import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeConfig } from '@/lib/stripe-config'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

// GET - Diagnosticar por qué no se crean suscripciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const paymentIntentId = searchParams.get('payment_intent_id')

    const results: any = {
      timestamp: new Date().toISOString(),
      checks: {},
      recommendations: []
    }

    // 1. Verificar configuración de Stripe
    const stripeConfig = await getStripeConfig()
    results.checks.stripe_config = {
      has_secret_key: !!stripeConfig.secretKey,
      has_price_id: !!stripeConfig.priceId,
      price_id: stripeConfig.priceId ? stripeConfig.priceId.substring(0, 20) + '...' : 'NO CONFIGURADO',
      mode: stripeConfig.mode
    }

    if (!stripeConfig.priceId) {
      results.recommendations.push('❌ CRÍTICO: No hay priceId configurado. Las suscripciones NO se crearán.')
    }

    // 2. Verificar días de trial
    const trialDaysStr = await db.getConfigByKey('trial_days')
    const trialDays = trialDaysStr ? parseInt(trialDaysStr) : 15
    results.checks.trial_days = {
      value: trialDays,
      source: trialDaysStr ? 'database' : 'default'
    }

    // 3. Si hay customer_id, verificar suscripciones existentes
    if (customerId) {
      const stripe = new Stripe(stripeConfig.secretKey!, { apiVersion: '2023-10-16' })
      
      try {
        const customer = await stripe.customers.retrieve(customerId)
        results.checks.customer = {
          id: customerId,
          email: typeof customer === 'object' && !customer.deleted ? customer.email : 'N/A',
          has_default_payment_method: typeof customer === 'object' && !customer.deleted ? !!customer.invoice_settings?.default_payment_method : false
        }

        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 10
        })

        results.checks.customer_subscriptions = {
          total: subscriptions.data.length,
          active: subscriptions.data.filter(s => s.status === 'active').length,
          trialing: subscriptions.data.filter(s => s.status === 'trialing').length,
          subscriptions: subscriptions.data.map(s => ({
            id: s.id,
            status: s.status,
            trial_end: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
            created: new Date(s.created * 1000).toISOString()
          }))
        }

        if (subscriptions.data.length === 0) {
          results.recommendations.push(`⚠️ Customer ${customerId} no tiene suscripciones. Si hizo un pago recientemente, el webhook podría no haber funcionado.`)
        }
      } catch (error: any) {
        results.checks.customer = { error: error.message }
      }
    }

    // 4. Si hay payment_intent_id, verificar el PaymentIntent
    if (paymentIntentId) {
      const stripe = new Stripe(stripeConfig.secretKey!, { apiVersion: '2023-10-16' })
      
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['payment_method', 'latest_charge.payment_method']
        })

        results.checks.payment_intent = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          customer: paymentIntent.customer,
          payment_method: paymentIntent.payment_method,
          latest_charge: paymentIntent.latest_charge,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata
        }

        // Verificar si tiene payment_method
        let paymentMethodId: string | null = null
        if (paymentIntent.payment_method) {
          paymentMethodId = paymentIntent.payment_method as string
        } else if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string, {
            expand: ['payment_method']
          })
          paymentMethodId = charge.payment_method as string
        }

        results.checks.payment_intent.payment_method_found = !!paymentMethodId
        results.checks.payment_intent.payment_method_id = paymentMethodId

        if (!paymentMethodId) {
          results.recommendations.push('❌ CRÍTICO: No se encontró payment_method en el PaymentIntent. No se puede crear suscripción sin él.')
        }

        if (paymentIntent.status !== 'succeeded') {
          results.recommendations.push(`⚠️ PaymentIntent está en estado "${paymentIntent.status}", no "succeeded". El webhook solo crea suscripciones cuando el estado es "succeeded".`)
        }
      } catch (error: any) {
        results.checks.payment_intent = { error: error.message }
      }
    }

    // 5. Verificar últimos webhooks recibidos (si hay endpoint de logs)
    results.checks.webhook_endpoint = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mindmetric.io'}/api/webhook`,
      note: 'Verifica que este endpoint esté configurado en Stripe Dashboard > Webhooks'
    }

    results.recommendations.push('💡 Para diagnosticar: 1) Verifica los logs de Vercel cuando se recibe un webhook, 2) Verifica que el webhook esté configurado en Stripe, 3) Busca mensajes que empiecen con "[PAYMENT_INTENT]" en los logs')

    return NextResponse.json(results, { status: 200 })
  } catch (error: any) {
    console.error('Error en diagnóstico:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

