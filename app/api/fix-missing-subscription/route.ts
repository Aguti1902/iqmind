import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID no configurado' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('🔧 Intentando crear suscripción manualmente para:', email)

    // 1. Buscar customer
    const customers = await stripe.customers.list({ email, limit: 1 })
    
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'Customer no encontrado' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const customer = customers.data[0]
    console.log('✅ Customer encontrado:', customer.id)

    // 2. Verificar si ya tiene suscripción activa
    const existingSubs = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    })

    const activeSubs = existingSubs.data.filter(
      sub => sub.status === 'active' || sub.status === 'trialing'
    )

    if (activeSubs.length > 0) {
      console.log('⚠️ Ya existe una suscripción activa')
      return NextResponse.json({
        message: 'Ya existe una suscripción activa',
        subscription: {
          id: activeSubs[0].id,
          status: activeSubs[0].status,
          trial_end: activeSubs[0].trial_end,
        }
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 3. Obtener el payment method del customer
    const defaultPaymentMethod = customer.invoice_settings?.default_payment_method

    if (!defaultPaymentMethod) {
      return NextResponse.json(
        { error: 'Customer no tiene método de pago configurado' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('💳 Payment method:', defaultPaymentMethod)

    // 4. Buscar el último PaymentIntent exitoso para obtener metadata
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customer.id,
      limit: 5,
    })

    const lastSuccessfulPI = paymentIntents.data.find(pi => pi.status === 'succeeded')
    
    let metadata: any = {
      email: customer.email || email,
      manuallyCreated: 'true',
      createdAt: new Date().toISOString(),
    }

    if (lastSuccessfulPI?.metadata) {
      metadata = {
        ...metadata,
        userName: lastSuccessfulPI.metadata.userName || '',
        userIQ: lastSuccessfulPI.metadata.userIQ || '',
        lang: lastSuccessfulPI.metadata.lang || 'es',
        initialPaymentIntentId: lastSuccessfulPI.id,
      }
    }

    console.log('📋 Metadata para suscripción:', metadata)

    // 5. Crear la suscripción con trial de 30 días
    console.log('🚀 Creando suscripción...')
    
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID,
        },
      ],
      default_payment_method: defaultPaymentMethod as string,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      metadata,
      trial_period_days: 30,
    })

    console.log('✅ Suscripción creada:', subscription.id)
    console.log('📅 Trial end:', subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : 'N/A')

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
        current_period_end: subscription.current_period_end,
      },
      message: 'Suscripción creada exitosamente',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error: any) {
    console.error('❌ Error creando suscripción manual:', error)
    return NextResponse.json(
      { 
        error: error.message,
        type: error.type,
        stack: error.stack,
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

