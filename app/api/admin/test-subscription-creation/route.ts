import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeConfig } from '@/lib/stripe-config'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

// POST - Probar creación de suscripción con un PaymentIntent específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_intent_id } = body

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'payment_intent_id es requerido' },
        { status: 400 }
      )
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      payment_intent_id,
      steps: [],
      errors: [],
      success: false
    }

    // 1. Obtener configuración
    const stripeConfig = await getStripeConfig()
    if (!stripeConfig.secretKey || !stripeConfig.priceId) {
      results.errors.push('Stripe no configurado correctamente o falta priceId')
      return NextResponse.json(results, { status: 400 })
    }

    const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: '2023-10-16' })

    // 2. Recuperar PaymentIntent completo
    results.steps.push('Recuperando PaymentIntent completo...')
    let paymentIntent: Stripe.PaymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
        expand: ['payment_method', 'latest_charge.payment_method']
      })
      results.payment_intent = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        customer: paymentIntent.customer,
        payment_method: paymentIntent.payment_method,
        latest_charge: paymentIntent.latest_charge,
        amount: paymentIntent.amount
      }
    } catch (error: any) {
      results.errors.push(`Error recuperando PaymentIntent: ${error.message}`)
      return NextResponse.json(results, { status: 400 })
    }

    // 3. Obtener customer y payment_method
    const customerId = paymentIntent.customer as string
    let paymentMethodId: string | null = null

    if (paymentIntent.payment_method) {
      paymentMethodId = paymentIntent.payment_method as string
    } else if (paymentIntent.latest_charge) {
      try {
        const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string, {
          expand: ['payment_method']
        })
        if (charge.payment_method) {
          paymentMethodId = charge.payment_method as string
        }
      } catch (error: any) {
        results.errors.push(`Error obteniendo payment_method del charge: ${error.message}`)
      }
    }

    results.customer_id = customerId
    results.payment_method_id = paymentMethodId

    if (!customerId) {
      results.errors.push('No hay customerId en el PaymentIntent')
      return NextResponse.json(results, { status: 400 })
    }

    if (!paymentMethodId) {
      results.errors.push('No se pudo obtener payment_method del PaymentIntent')
      return NextResponse.json(results, { status: 400 })
    }

    // 4. Verificar suscripciones existentes
    results.steps.push('Verificando suscripciones existentes...')
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10
    })
    const activeSubscriptions = existingSubscriptions.data.filter(
      sub => sub.status === 'active' || sub.status === 'trialing'
    )

    if (activeSubscriptions.length > 0) {
      results.warning = 'Ya existe una suscripción activa'
      results.existing_subscription = {
        id: activeSubscriptions[0].id,
        status: activeSubscriptions[0].status
      }
      return NextResponse.json(results, { status: 200 })
    }

    // 5. Attach payment method si es necesario
    results.steps.push('Verificando payment method...')
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    if (!paymentMethod.customer) {
      results.steps.push('Attaching payment method to customer...')
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    }

    // 6. Establecer como default
    results.steps.push('Estableciendo payment method por defecto...')
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    })

    // 7. Obtener trial days
    const trialDaysStr = await db.getConfigByKey('trial_days')
    const trialDays = trialDaysStr ? parseInt(trialDaysStr) : 30

    // 8. Crear suscripción
    results.steps.push(`Creando suscripción con trial de ${trialDays} días...`)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: stripeConfig.priceId }],
      default_payment_method: paymentMethodId,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        createdVia: 'admin_test_endpoint',
        paymentIntentId: payment_intent_id
      },
      trial_period_days: trialDays
    })

    results.success = true
    results.subscription = {
      id: subscription.id,
      status: subscription.status,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
    }

    // 9. Guardar en BD si hay email
    const userEmail = paymentIntent.metadata?.userEmail || paymentIntent.metadata?.email
    if (userEmail) {
      results.steps.push(`Guardando subscription_id en BD para ${userEmail}...`)
      try {
        const user = await db.getUserByEmail(userEmail)
        if (user) {
          await db.updateUserSubscription(
            user.id.toString(),
            subscription.id,
            subscription.status === 'trialing' ? 'trial' : (subscription.status as 'active' | 'cancelled' | 'expired'),
            subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
            subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined
          )
          results.db_saved = true
        } else {
          results.warning = `Usuario no encontrado en BD: ${userEmail}`
        }
      } catch (dbError: any) {
        results.errors.push(`Error guardando en BD: ${dbError.message}`)
      }
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error: any) {
    console.error('Error en test-subscription-creation:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

