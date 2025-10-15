import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
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

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado - Token requerido' },
        { status: 401 }
      )
    }
    
    const authData = verifyToken(token)
    
    if (!authData || !authData.userId) {
      return NextResponse.json(
        { error: 'No autorizado - Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID de suscripción requerido' },
        { status: 400 }
      )
    }

    // Cancelar la suscripción en Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        cancelled_by: 'user',
        cancelled_at: new Date().toISOString(),
        user_id: authData.userId
      }
    })

    console.log('✅ Suscripción cancelada:', {
      subscriptionId: subscription.id,
      userId: authData.userId,
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