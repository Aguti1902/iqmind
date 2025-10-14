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
    const { email, fullName } = body

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

    console.log('Buscando suscripción para:', email)

    // Buscar el customer por email
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ninguna cuenta con este email' },
        { status: 404 }
      )
    }

    const customer = customers.data[0]
    console.log('Customer encontrado:', customer.id)

    // Buscar las suscripciones activas o en trial del customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
    })

    // Filtrar solo suscripciones activas o en trial
    const activeSubscriptions = subscriptions.data.filter(
      sub => sub.status === 'active' || sub.status === 'trialing'
    )

    if (activeSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ninguna suscripción activa' },
        { status: 404 }
      )
    }

    // Cancelar la suscripción más reciente
    const activeSubscription = activeSubscriptions[0]
    console.log('Cancelando suscripción:', activeSubscription.id)

    // Cancelar al final del periodo de facturación
    const canceledSubscription = await stripe.subscriptions.update(
      activeSubscription.id,
      {
        cancel_at_period_end: true,
      }
    )

    console.log('Suscripción cancelada exitosamente:', canceledSubscription.id)

    // Calcular la fecha de finalización
    const endDate = new Date(canceledSubscription.current_period_end * 1000)
    const formattedEndDate = endDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      subscriptionId: canceledSubscription.id,
      endDate: formattedEndDate,
      endDateTimestamp: canceledSubscription.current_period_end,
    })

  } catch (error: any) {
    console.error('Error al cancelar suscripción:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

