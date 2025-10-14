import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, customerId, paymentMethodId } = body

    console.log('=== INICIO CREAR SUSCRIPCIÓN ===')
    console.log('Body recibido:', { email, userName, customerId, paymentMethodId })

    if (!customerId || !paymentMethodId) {
      console.error('❌ Faltan parámetros:', { customerId, paymentMethodId })
      return NextResponse.json(
        { error: 'Customer ID y Payment Method ID requeridos' },
        { status: 400 }
      )
    }

    if (!stripe) {
      console.error('❌ Stripe no configurado')
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    console.log('✅ Parámetros válidos, creando suscripción...')

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

    // El pago de €0.50 ya fue procesado por el PaymentIntent
    // Solo necesitamos crear la suscripción con trial de 2 días
    console.log('🚀 Creando suscripción con trial de 2 días...')
    console.log('Price ID:', process.env.STRIPE_PRICE_ID)
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID,
        },
      ],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        userName: userName || '',
        email: email || '',
      },
      trial_period_days: 2,
    })

    console.log('✅ Suscripción creada exitosamente:', subscription.id)
    console.log('Estado:', subscription.status)
    console.log('Trial end:', new Date(subscription.trial_end! * 1000).toISOString())

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end,
    })

  } catch (error: any) {
    console.error('Error al crear suscripción:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

