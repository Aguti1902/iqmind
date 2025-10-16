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
    const subscriptionId = searchParams.get('subscriptionId')

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId es requerido como parámetro' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    // Obtener la suscripción
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Obtener el producto y precio
    const priceId = subscription.items.data[0].price.id
    const price = await stripe.prices.retrieve(priceId)
    const product = await stripe.products.retrieve(price.product as string)

    // Obtener el customer
    const customer = await stripe.customers.retrieve(subscription.customer as string)

    // Verificar próxima factura
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptionId,
    })

    const now = new Date()
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const nextPaymentDate = new Date(upcomingInvoice.next_payment_attempt! * 1000)

    const analysis = {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        created: new Date(subscription.created * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: trialEnd ? trialEnd.toISOString() : null,
        trial_days_remaining: trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      },
      pricing: {
        price_id: priceId,
        amount: price.unit_amount! / 100,
        currency: price.currency.toUpperCase(),
        interval: price.recurring?.interval,
        product_name: product.name,
      },
      payment_method: {
        has_default_payment_method: !!subscription.default_payment_method,
        default_payment_method_id: subscription.default_payment_method || 'No configurado',
        customer_has_default: !!(customer as any).invoice_settings?.default_payment_method,
      },
      next_invoice: {
        amount_due: upcomingInvoice.amount_due / 100,
        currency: upcomingInvoice.currency.toUpperCase(),
        next_payment_attempt: nextPaymentDate.toISOString(),
        days_until_payment: Math.ceil((nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        subtotal: upcomingInvoice.subtotal / 100,
        total: upcomingInvoice.total / 100,
        lines: upcomingInvoice.lines.data.map(line => ({
          description: line.description,
          amount: line.amount / 100,
          period_start: new Date(line.period.start * 1000).toISOString(),
          period_end: new Date(line.period.end * 1000).toISOString(),
        })),
      },
      warnings: [] as string[],
      status_ok: true,
    }

    // Verificar posibles problemas
    if (!subscription.default_payment_method && !(customer as any).invoice_settings?.default_payment_method) {
      analysis.warnings.push('⚠️ No hay método de pago por defecto configurado')
      analysis.status_ok = false
    }

    if (subscription.status !== 'trialing' && subscription.status !== 'active') {
      analysis.warnings.push(`⚠️ Estado de suscripción inusual: ${subscription.status}`)
      analysis.status_ok = false
    }

    if (price.unit_amount !== 999) { // 9.99€
      analysis.warnings.push(`⚠️ El precio es ${price.unit_amount! / 100}€, esperado 9.99€`)
      analysis.status_ok = false
    }

    if (subscription.cancel_at_period_end) {
      analysis.warnings.push('⚠️ La suscripción está marcada para cancelarse al final del período')
    }

    if (analysis.status_ok && analysis.warnings.length === 0) {
      analysis.warnings.push('✅ Todo está configurado correctamente. El pago de 9.99€ se procesará automáticamente.')
    }

    return NextResponse.json(analysis, { status: 200 })

  } catch (error: any) {
    console.error('❌ Error verificando suscripción:', error)
    return NextResponse.json(
      { 
        error: error.message,
        type: error.type,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

