import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

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

    console.log('🔍 Buscando información para:', email)

    // 1. Buscar en la base de datos
    const user = await db.getUserByEmail(email)
    console.log('👤 Usuario en DB:', user ? 'Encontrado' : 'No encontrado')

    // 2. Buscar customers en Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 5
    })
    console.log('👥 Customers en Stripe:', customers.data.length)

    const customerInfo = []
    const subscriptionInfo = []
    const paymentIntentInfo = []

    for (const customer of customers.data) {
      customerInfo.push({
        id: customer.id,
        email: customer.email,
        created: new Date(customer.created * 1000).toISOString()
      })

      // Buscar suscripciones del customer
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10
      })

      for (const sub of subs.data) {
        subscriptionInfo.push({
          id: sub.id,
          status: sub.status,
          created: new Date(sub.created * 1000).toISOString(),
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          metadata: sub.metadata
        })
      }

      // Buscar PaymentIntents del customer
      const payments = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 10
      })

      for (const payment of payments.data) {
        paymentIntentInfo.push({
          id: payment.id,
          amount: payment.amount / 100,
          status: payment.status,
          created: new Date(payment.created * 1000).toISOString(),
          metadata: payment.metadata
        })
      }
    }

    return NextResponse.json({
      email,
      database: {
        found: !!user,
        userId: user?.id,
        userName: user?.userName,
        iq: user?.iq,
        subscriptionStatus: user?.subscriptionStatus,
        testResults: user?.testResults?.length || 0
      },
      stripe: {
        customers: customerInfo,
        subscriptions: subscriptionInfo,
        payments: paymentIntentInfo
      }
    })

  } catch (error: any) {
    console.error('❌ Error en debug:', error)
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}

