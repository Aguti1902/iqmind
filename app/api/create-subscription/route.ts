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

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Customer ID y Payment Method ID requeridos' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    console.log('Creando suscripción con:', { customerId, paymentMethodId })

    // Verificar si el payment method ya está attachado
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    
    if (!paymentMethod.customer) {
      // Solo attach si no está ya attachado
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })
    }

    // Establecer como método de pago por defecto
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // El pago de €0.50 ya fue procesado por el PaymentIntent
    // Solo necesitamos crear la suscripción con trial de 2 días
    console.log('Creando suscripción con trial de 2 días...')
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

    console.log('Suscripción creada exitosamente:', subscription.id)

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

