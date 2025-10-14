import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Inicializar Stripe (solo en el servidor)
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

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Resultado Test de CI',
              description: 'Acceso completo a tu resultado de test de inteligencia + Prueba Premium de 2 días',
            },
            unit_amount: 50, // 0.50€ en centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/resultado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/checkout`,
      customer_email: email,
      metadata: {
        userIQ: userIQ || '',
        userName: userName || '',
      },
      // Configurar suscripción después del primer pago (opcional)
      // subscription_data: {
      //   trial_period_days: 2,
      // },
    })

    return NextResponse.json({ id: session.id })

  } catch (error: any) {
    console.error('Error al crear sesión de checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

