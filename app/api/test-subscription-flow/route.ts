import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
        { error: 'Email es requerido como parámetro' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    const results: any = {
      email,
      timestamp: new Date().toISOString(),
      stripeConfig: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasPriceId: !!process.env.STRIPE_PRICE_ID,
        priceId: process.env.STRIPE_PRICE_ID,
      },
    }

    // 1. Buscar customer
    console.log('🔍 Buscando customer:', email)
    const customers = await stripe.customers.list({ email, limit: 1 })
    
    if (customers.data.length === 0) {
      results.customer = 'No encontrado'
      results.subscriptions = []
      results.paymentIntents = []
      return NextResponse.json(results)
    }

    const customer = customers.data[0]
    results.customer = {
      id: customer.id,
      email: customer.email,
      created: new Date(customer.created * 1000).toISOString(),
    }

    // 2. Buscar suscripciones
    console.log('🔍 Buscando suscripciones para customer:', customer.id)
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
    })

    results.subscriptions = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      created: new Date(sub.created * 1000).toISOString(),
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      metadata: sub.metadata,
    }))

    // 3. Buscar PaymentIntents recientes
    console.log('🔍 Buscando PaymentIntents para customer:', customer.id)
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customer.id,
      limit: 10,
    })

    results.paymentIntents = paymentIntents.data.map(pi => ({
      id: pi.id,
      status: pi.status,
      amount: pi.amount,
      currency: pi.currency,
      created: new Date(pi.created * 1000).toISOString(),
      metadata: pi.metadata,
      payment_method: pi.payment_method,
    }))

    // 4. Verificar método de pago por defecto
    if (customer.invoice_settings?.default_payment_method) {
      results.defaultPaymentMethod = customer.invoice_settings.default_payment_method
    } else {
      results.defaultPaymentMethod = 'No configurado'
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    console.error('❌ Error en test-subscription-flow:', error)
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

