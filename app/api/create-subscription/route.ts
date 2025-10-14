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

    // Attach payment method al customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Establecer como método de pago por defecto
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Crear suscripción con trial de 2 días
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

    // Agregar cargo de €0.50 a la primera factura
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: 50, // €0.50 en centavos
      currency: 'eur',
      description: 'IQ Test Result Unlock',
      invoice: subscription.latest_invoice as string,
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

