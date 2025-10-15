import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
export const dynamic = 'force-dynamic'
import { verifyToken } from '@/lib/auth'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { subscriptionId, email } = body

    // Verificar autenticación por token O por email
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let userId: string | null = null
    let userEmail: string | null = email || null

    // Intento 1: Verificar con token si está presente
    if (token) {
      const authData = verifyToken(token)
      if (authData && authData.userId) {
        userId = authData.userId
        userEmail = authData.email || userEmail
      }
    }

    // Si no hay subscriptionId, intentar buscar por email
    if (!subscriptionId && !userEmail) {
      return NextResponse.json(
        { error: 'Se requiere subscriptionId o email' },
        { status: 400 }
      )
    }

    let subscription: any

    // Si tenemos subscriptionId, usarlo directamente
    if (subscriptionId) {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          cancelled_by: 'user',
          cancelled_at: new Date().toISOString(),
          user_id: userId || 'unknown',
          user_email: userEmail || 'unknown'
        }
      })
    } else if (userEmail) {
      // Buscar el cliente por email
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      })

      if (customers.data.length === 0) {
        return NextResponse.json(
          { error: 'No se encontró ninguna suscripción para este email' },
          { status: 404 }
        )
      }

      // Buscar suscripciones activas o en trial del cliente
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        limit: 10 // Buscar hasta 10 suscripciones
      })

      // Filtrar solo las que están activas o en trial
      const activeSubscriptions = subscriptions.data.filter(sub => 
        sub.status === 'active' || sub.status === 'trialing'
      )

      if (activeSubscriptions.length === 0) {
        return NextResponse.json(
          { error: 'No tienes ninguna suscripción activa o en trial' },
          { status: 404 }
        )
      }

      // Cancelar la primera suscripción activa o en trial
      subscription = await stripe.subscriptions.update(activeSubscriptions[0].id, {
        cancel_at_period_end: true,
        metadata: {
          cancelled_by: 'user',
          cancelled_at: new Date().toISOString(),
          user_email: userEmail
        }
      })
    }

    console.log('✅ Suscripción cancelada:', {
      subscriptionId: subscription.id,
      userId: userId,
      userEmail: userEmail,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end
    })

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end
      }
    })

  } catch (error: any) {
    console.error('❌ Error cancelando suscripción:', error)
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Suscripción no encontrada o ya cancelada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}