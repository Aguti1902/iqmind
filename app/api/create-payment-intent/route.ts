import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
export const dynamic = 'force-dynamic'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userIQ, userName, lang } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    // Buscar o crear customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email,
        name: userName,
      })
    }

    // Crear Payment Intent de €0.50 para cobrar inmediatamente
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: 50, // €0.50 en centavos
      currency: 'eur',
      // Habilitar métodos automáticos para Apple Pay y Google Pay
      automatic_payment_methods: {
        enabled: true,
      },
      description: 'IQ Test Result Unlock',
      metadata: {
        email,
        userIQ: userIQ || '',
        userName: userName || '',
        lang: lang || 'es',
      },
      // Configurar para guardar el método de pago para uso futuro
      setup_future_usage: 'off_session',
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    })

  } catch (error: any) {
    console.error('Error al crear payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

