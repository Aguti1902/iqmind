import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { getStripeConfig } from '@/lib/stripe-config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 Iniciando creación de suscripciones faltantes...')
    
    // Verificar que es admin
    const adminCheck = await fetch(new URL('/api/admin/check', req.url), {
      headers: req.headers
    })
    const adminData = await adminCheck.json()
    
    if (!adminData.isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todos los charges exitosos
    const charges = await stripe.charges.list({
      limit: 100,
      expand: ['data.customer'],
    })

    const successfulCharges = charges.data.filter(charge => charge.status === 'succeeded')
    
    console.log(`📊 Encontrados ${successfulCharges.length} cargos exitosos`)

    // Agrupar por customer email
    const customerEmails = new Map<string, any[]>()
    
    for (const charge of successfulCharges) {
      let email = charge.receipt_email || charge.billing_details?.email
      
      // Si el customer es un objeto expandido, obtener el email
      if (!email && typeof charge.customer === 'object' && charge.customer) {
        const customer = charge.customer as Stripe.Customer
        email = customer.email || null
      }

      if (email) {
        if (!customerEmails.has(email)) {
          customerEmails.set(email, [])
        }
        customerEmails.get(email)!.push(charge)
      }
    }

    console.log(`👥 Encontrados ${customerEmails.size} clientes únicos`)

    const results = {
      total_customers: customerEmails.size,
      subscriptions_created: 0,
      already_has_subscription: 0,
      errors: [] as any[],
    }

    // Para cada cliente, verificar si tiene suscripción
    for (const [email, charges] of customerEmails.entries()) {
      try {
        console.log(`\n🔍 Verificando cliente: ${email}`)
        
        // Buscar cliente en Stripe
        const customers = await stripe.customers.list({
          email: email,
          limit: 1,
        })

        let customer
        if (customers.data.length > 0) {
          customer = customers.data[0]
        } else {
          // Crear customer si no existe
          const firstCharge = charges[0]
          customer = await stripe.customers.create({
            email: email,
            name: firstCharge.billing_details?.name || email.split('@')[0],
            metadata: {
              created_by: 'admin_recovery_script',
            }
          })
          console.log(`✅ Customer creado: ${customer.id}`)
        }

        // Verificar si ya tiene suscripción
        const existingSubscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 10,
        })

        if (existingSubscriptions.data.length > 0) {
          console.log(`ℹ️ Cliente ya tiene ${existingSubscriptions.data.length} suscripción(es)`)
          results.already_has_subscription++
          continue
        }

        // Crear suscripción con trial de 30 días
        const stripeConfig = await getStripeConfig()
        const monthlyPriceId = stripeConfig.mode === 'test' 
          ? stripeConfig.stripe_test_price_id_mensual 
          : stripeConfig.stripe_live_price_id_mensual

        if (!monthlyPriceId) {
          throw new Error('Price ID no configurado')
        }

        // Calcular fecha de trial (30 días desde el primer pago)
        const firstChargeDate = new Date(charges[0].created * 1000)
        const trialEnd = new Date(firstChargeDate)
        trialEnd.setDate(trialEnd.getDate() + 30)

        // Si ya pasó el trial, crear como activa
        const now = new Date()
        const isTrialExpired = trialEnd < now

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: monthlyPriceId }],
          trial_end: isTrialExpired ? undefined : Math.floor(trialEnd.getTime() / 1000),
          metadata: {
            email: email,
            created_by: 'admin_recovery_script',
            original_payment_date: firstChargeDate.toISOString(),
          }
        })

        console.log(`✅ Suscripción creada: ${subscription.id}`)
        console.log(`   Status: ${subscription.status}`)
        console.log(`   Trial: ${isTrialExpired ? 'Expirado' : 'Hasta ' + trialEnd.toISOString()}`)

        // Actualizar usuario en DB si existe
        try {
          const user = await db.getUserByEmail(email)
          if (user) {
            await db.updateUserSubscription(
              user.id.toString(),
              subscription.id,
              subscription.status === 'trialing' ? 'trial' : 'active',
              new Date(subscription.trial_end ? subscription.trial_end * 1000 : Date.now()),
              new Date(subscription.current_period_end * 1000)
            )
            console.log(`✅ Usuario actualizado en DB`)
          }
        } catch (dbError) {
          console.warn(`⚠️ No se pudo actualizar usuario en DB:`, dbError)
        }

        results.subscriptions_created++

      } catch (error: any) {
        console.error(`❌ Error procesando ${email}:`, error.message)
        results.errors.push({
          email,
          error: error.message,
        })
      }
    }

    console.log('\n✅ Proceso completado:')
    console.log(`   📊 Total clientes: ${results.total_customers}`)
    console.log(`   ✅ Suscripciones creadas: ${results.subscriptions_created}`)
    console.log(`   ℹ️ Ya tenían suscripción: ${results.already_has_subscription}`)
    console.log(`   ❌ Errores: ${results.errors.length}`)

    return NextResponse.json({
      success: true,
      message: 'Proceso completado',
      results,
    })

  } catch (error: any) {
    console.error('❌ Error en proceso:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

