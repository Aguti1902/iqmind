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
    const { email, userIQ, userName } = body

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

    // Crear Payment Intent para el pago de €0.50
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 50, // 0.50€ en centavos
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email,
        userIQ: userIQ || '',
        userName: userName || '',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error: any) {
    console.error('Error al crear payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

