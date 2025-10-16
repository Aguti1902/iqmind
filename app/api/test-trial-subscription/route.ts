import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

// ⚠️ ENDPOINT SOLO PARA PRUEBAS - TRIAL DE 1 MINUTO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, testData, lang = 'es' } = body

    if (!email || !userName) {
      return NextResponse.json(
        { error: 'Email y userName son requeridos' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID no configurado' },
        { status: 500 }
      )
    }

    console.log('🧪 CREANDO SUSCRIPCIÓN DE PRUEBA CON TRIAL DE 1 MINUTO')
    console.log('Email:', email)
    console.log('Price ID:', priceId)

    // 1. Buscar o crear customer
    let customer: Stripe.Customer | null = null
    
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log('✅ Customer existente encontrado:', customer.id)
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: userName,
        metadata: {
          userName: userName,
          lang: lang,
        },
      })
      console.log('✅ Nuevo customer creado:', customer.id)
    }

    // 2. Crear un método de pago de prueba (solo funciona en modo test)
    console.log('💳 Creando método de pago de prueba...')
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Token de prueba de Stripe
      },
    })
    console.log('✅ Payment method creado:', paymentMethod.id)

    // 3. Adjuntar método de pago al customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    })
    console.log('✅ Payment method adjuntado al customer')

    // 4. Establecer como método de pago por defecto
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    })
    console.log('✅ Payment method establecido como predeterminado')

    // 5. Verificar suscripciones existentes
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    })

    console.log(`📋 Suscripciones existentes: ${existingSubscriptions.data.length}`)
    
    // Cancelar suscripciones activas o en trial
    for (const sub of existingSubscriptions.data) {
      if (sub.status === 'active' || sub.status === 'trialing') {
        await stripe.subscriptions.cancel(sub.id)
        console.log(`🗑️ Suscripción anterior cancelada: ${sub.id}`)
      }
    }

    // 6. Calcular trial end (1 minuto desde ahora)
    const now = Math.floor(Date.now() / 1000)
    const trialEnd = now + 60 // 60 segundos = 1 minuto

    console.log('⏰ Creando suscripción con trial de 1 minuto')
    console.log('Hora actual:', new Date(now * 1000).toISOString())
    console.log('Fin del trial:', new Date(trialEnd * 1000).toISOString())

    // 7. Crear suscripción con trial de 1 minuto
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: priceId,
        },
      ],
      trial_end: trialEnd,
      default_payment_method: paymentMethod.id,
      metadata: {
        userName: userName,
        lang: lang,
        testData: testData ? JSON.stringify(testData) : '',
        testMode: 'true',
        trialDuration: '1 minute',
      },
      expand: ['latest_invoice'],
    })

    console.log('✅ Suscripción de prueba creada:', subscription.id)
    console.log('Status:', subscription.status)
    console.log('Trial end:', new Date(subscription.trial_end! * 1000).toISOString())

    // 8. Calcular cuándo será el cobro
    const nextPaymentDate = new Date(trialEnd * 1000)
    const timeUntilCharge = 60 // segundos

    return NextResponse.json({
      success: true,
      message: '🧪 Suscripción de prueba creada exitosamente',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer: customer.id,
        trial_start: new Date(subscription.trial_start! * 1000).toISOString(),
        trial_end: new Date(subscription.trial_end! * 1000).toISOString(),
        next_charge_date: nextPaymentDate.toISOString(),
        seconds_until_charge: timeUntilCharge,
        amount: '9.99€',
      },
      instructions: [
        '1️⃣ El trial durará exactamente 1 minuto',
        '2️⃣ Después de 1 minuto, Stripe intentará cobrar 9.99€',
        '3️⃣ Monitorea los webhooks en tu dashboard de Stripe',
        '4️⃣ Eventos esperados:',
        '   - invoice.created',
        '   - invoice.payment_succeeded',
        '   - customer.subscription.updated',
        '5️⃣ Verifica tus logs de Vercel para ver si el webhook se ejecuta',
      ],
      monitoring: {
        stripe_dashboard: `https://dashboard.stripe.com/subscriptions/${subscription.id}`,
        stripe_webhooks: 'https://dashboard.stripe.com/webhooks',
        verify_endpoint: `/api/verify-subscription-config?subscriptionId=${subscription.id}`,
      },
    })

  } catch (error: any) {
    console.error('❌ Error creando suscripción de prueba:', error)
    return NextResponse.json(
      {
        error: error.message,
        type: error.type,
        code: error.code,
        details: error.raw?.message,
      },
      { status: 500 }
    )
  }
}

// Endpoint GET para ver instrucciones
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/test-trial-subscription',
    method: 'POST',
    description: '🧪 Crea una suscripción de PRUEBA con trial de 1 MINUTO para verificar el cobro',
    warning: '⚠️ SOLO USAR EN MODO TEST DE STRIPE',
    body: {
      email: 'test@ejemplo.com',
      userName: 'Usuario Test',
      testData: '(opcional) Datos del test',
      lang: '(opcional) Idioma, por defecto "es"',
    },
    example: {
      email: 'prueba-trial@test.com',
      userName: 'Test Trial 1min',
      lang: 'es',
    },
    notes: [
      'El trial durará SOLO 1 MINUTO',
      'Usa una tarjeta de prueba de Stripe (se crea automáticamente)',
      'Después de 1 minuto verás el cobro de 9.99€',
      'Monitorea los eventos del webhook en tiempo real',
      'SOLO funciona en modo TEST de Stripe',
    ],
  })
}

