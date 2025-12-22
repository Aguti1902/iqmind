import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeConfig } from '@/lib/stripe-config'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, paymentIntentId, testData, lang } = body

    console.log('=== INICIO CREAR SUSCRIPCIÓN ===')
    console.log('Body recibido:', { email, userName, paymentIntentId, testData, lang })

    if (!paymentIntentId) {
      console.error('❌ Falta paymentIntentId')
      return NextResponse.json(
        { error: 'Payment Intent ID requerido' },
        { status: 400 }
      )
    }

    // Obtener configuración de Stripe según el modo actual
    const stripeConfig = await getStripeConfig()
    
    if (!stripeConfig.secretKey) {
      console.error('❌ Stripe no configurado')
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    if (!stripeConfig.priceId) {
      console.error('❌ STRIPE_PRICE_ID no configurado en variables de entorno')
      return NextResponse.json(
        { error: 'Configuración de precio no encontrada' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2023-10-16',
    })

    // Obtener el PaymentIntent desde el backend para acceder al customer y payment method
    console.log('🔍 Recuperando PaymentIntent desde Stripe...')
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    console.log('📋 PaymentIntent recuperado:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      customer: paymentIntent.customer,
      payment_method: paymentIntent.payment_method,
    })

    const customerId = paymentIntent.customer as string
    const paymentMethodId = paymentIntent.payment_method as string

    if (!customerId || !paymentMethodId) {
      console.error('❌ PaymentIntent no tiene customer o payment_method:', { customerId, paymentMethodId })
      return NextResponse.json(
        { error: 'No se pudo obtener el customer o payment method del pago' },
        { status: 400 }
      )
    }

    console.log('✅ Customer y Payment Method obtenidos correctamente')

    // Verificar si el payment method ya está attachado
    console.log('📌 Verificando payment method...')
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    console.log('Payment method:', paymentMethod.id, 'Attached to:', paymentMethod.customer)
    
    if (!paymentMethod.customer) {
      console.log('🔗 Attaching payment method to customer...')
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })
    }

    // Establecer como método de pago por defecto
    console.log('💳 Estableciendo payment method por defecto...')
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Verificar si ya existe una suscripción activa para este customer
    console.log('🔍 Verificando suscripciones existentes...')
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    })

    // Filtrar suscripciones activas o en trial
    const activeSubscriptions = existingSubscriptions.data.filter(
      sub => sub.status === 'active' || sub.status === 'trialing'
    )

    if (activeSubscriptions.length > 0) {
      console.log('⚠️ Ya existe una suscripción activa:', activeSubscriptions[0].id)
      return NextResponse.json({
        subscriptionId: activeSubscriptions[0].id,
        status: activeSubscriptions[0].status,
        trialEnd: activeSubscriptions[0].trial_end,
        message: 'Ya tienes una suscripción activa',
      })
    }

    // El pago de €0.50 ya fue procesado por el PaymentIntent
    // Leer días de prueba desde la BD
    const trialDaysStr = await db.getConfigByKey('trial_days')
    const trialDays = trialDaysStr ? parseInt(trialDaysStr) : 15
    
    console.log(`🚀 Creando suscripción con trial de ${trialDays} días...`)
    console.log('Price ID:', stripeConfig.priceId)
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: stripeConfig.priceId,
        },
      ],
      default_payment_method: paymentMethodId,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        userName: userName || '',
        email: email || '',
        lang: lang || paymentIntent.metadata.lang || 'es',
        initialPaymentIntentId: paymentIntentId,
        userIQ: paymentIntent.metadata.userIQ || '',
        testAnswers: testData?.answers ? JSON.stringify(testData.answers) : '',
        testTimeElapsed: testData?.timeElapsed?.toString() || '',
        testCorrectAnswers: testData?.correctAnswers?.toString() || '',
        testCategoryScores: testData?.categoryScores ? JSON.stringify(testData.categoryScores) : '',
      },
      trial_period_days: trialDays,
    })

    console.log('✅ Suscripción creada exitosamente:', subscription.id)
    console.log('Estado:', subscription.status)
    console.log('Trial end:', subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : 'N/A')
    console.log('Current period end:', subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : 'N/A')

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end,
      currentPeriodEnd: subscription.current_period_end,
    })

  } catch (error: any) {
    console.error('❌ Error al crear suscripción:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

