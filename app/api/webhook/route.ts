import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

// Endpoint para webhooks de Stripe
export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Sin firma' }, { status: 400 })
  }

  try {
    // Verificar webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Pago completado:', session)
        
        // Aquí guardarías en la base de datos:
        // - Email del usuario
        // - Resultado del test
        // - Fecha de compra
        // - Transaction ID
        
        // También podrías enviar un email con el resultado
        break

      case 'customer.subscription.created':
        console.log('Suscripción creada:', event.data.object)
        break

      case 'customer.subscription.deleted':
        console.log('Suscripción cancelada:', event.data.object)
        break

      default:
        console.log(`Evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error en webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

