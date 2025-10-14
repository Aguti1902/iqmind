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
    console.error('❌ Stripe no configurado')
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('❌ Sin firma de Stripe')
    return NextResponse.json({ error: 'Sin firma' }, { status: 400 })
  }

  try {
    // Verificar webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET no configurado')
      // En desarrollo, podemos permitir webhooks sin verificar (no recomendado en producción)
      console.warn('⚠️ Procesando webhook sin verificación (solo desarrollo)')
    }

    let event: Stripe.Event

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Solo para desarrollo - parsear sin verificar
      event = JSON.parse(body)
    }

    console.log('📨 Webhook recibido:', event.type, 'ID:', event.id)

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('✅ PaymentIntent exitoso:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          customer: paymentIntent.customer,
          email: paymentIntent.metadata.email,
        })
        
        // Aquí podrías guardar en la base de datos:
        // - Email del usuario
        // - Resultado del test
        // - Fecha de compra
        // - Transaction ID
        
        break

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Checkout completado:', {
          id: session.id,
          customer: session.customer,
          email: session.customer_email,
          amount: session.amount_total,
        })
        break

      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription
        console.log('✅ Suscripción creada:', {
          id: subscriptionCreated.id,
          customer: subscriptionCreated.customer,
          status: subscriptionCreated.status,
          trial_end: subscriptionCreated.trial_end,
          current_period_end: subscriptionCreated.current_period_end,
        })
        
        // Aquí actualizarías el estado del usuario en tu base de datos
        // - Marcar como suscriptor premium
        // - Guardar fecha de inicio del trial
        // - Guardar fecha de renovación
        
        break

      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription
        console.log('🔄 Suscripción actualizada:', {
          id: subscriptionUpdated.id,
          customer: subscriptionUpdated.customer,
          status: subscriptionUpdated.status,
          cancel_at_period_end: subscriptionUpdated.cancel_at_period_end,
        })
        
        // Actualizar el estado de la suscripción en tu base de datos
        
        break

      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription
        console.log('❌ Suscripción cancelada:', {
          id: subscriptionDeleted.id,
          customer: subscriptionDeleted.customer,
          status: subscriptionDeleted.status,
        })
        
        // Actualizar estado de suscripción en la base de datos
        // - Marcar como no-suscriptor
        // - Remover acceso premium
        
        break

      case 'customer.subscription.trial_will_end':
        const subscriptionTrialEnding = event.data.object as Stripe.Subscription
        console.log('⚠️ Trial próximo a terminar:', {
          id: subscriptionTrialEnding.id,
          customer: subscriptionTrialEnding.customer,
          trial_end: subscriptionTrialEnding.trial_end,
        })
        
        // Enviar email de recordatorio al usuario
        // - Recordar que el trial termina pronto
        // - Informar del próximo cobro
        
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('✅ Pago de factura exitoso:', {
          id: invoice.id,
          customer: invoice.customer,
          subscription: invoice.subscription,
          amount: invoice.amount_paid,
        })
        
        // Confirmar pago de suscripción en la base de datos
        
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('❌ Pago de factura fallido:', {
          id: failedInvoice.id,
          customer: failedInvoice.customer,
          subscription: failedInvoice.subscription,
          amount: failedInvoice.amount_due,
        })
        
        // Notificar al usuario del pago fallido
        // - Enviar email
        // - Actualizar estado en la base de datos
        
        break

      default:
        console.log(`ℹ️ Evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('❌ Error en webhook:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

