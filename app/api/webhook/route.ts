import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

// Función helper para enviar emails
async function sendEmail(type: string, data: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://iqmind.io'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        email: data.email,
        userName: data.userName || 'Usuario',
        lang: data.lang || 'es',
        ...data
      })
    })
    
    if (!response.ok) {
      console.error(`❌ Error enviando email ${type}:`, await response.text())
    } else {
      console.log(`✅ Email ${type} enviado a ${data.email}`)
    }
  } catch (error) {
    console.error(`❌ Error enviando email ${type}:`, error)
  }
}

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
        
        // Enviar email de confirmación de pago
        if (paymentIntent.metadata.email && paymentIntent.metadata.userIQ) {
          await sendEmail('paymentSuccess', {
            email: paymentIntent.metadata.email,
            userName: paymentIntent.metadata.userName || 'Usuario',
            iq: parseInt(paymentIntent.metadata.userIQ),
            lang: paymentIntent.metadata.lang || 'es'
          })
        }
        
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
        
        // Enviar email de bienvenida al trial
        if (subscriptionCreated.customer_email || subscriptionCreated.metadata?.email) {
          const trialEndDate = subscriptionCreated.trial_end 
            ? new Date(subscriptionCreated.trial_end * 1000).toLocaleDateString('es-ES')
            : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
          
          await sendEmail('trialStarted', {
            email: subscriptionCreated.customer_email || subscriptionCreated.metadata?.email,
            userName: subscriptionCreated.metadata?.userName || 'Usuario',
            trialEndDate,
            lang: subscriptionCreated.metadata?.lang || 'es'
          })
        }
        
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
        
        // Enviar email de confirmación de cancelación
        if (subscriptionDeleted.customer_email || subscriptionDeleted.metadata?.email) {
          const accessUntil = subscriptionDeleted.current_period_end
            ? new Date(subscriptionDeleted.current_period_end * 1000).toLocaleDateString('es-ES')
            : new Date().toLocaleDateString('es-ES')
          
          await sendEmail('subscriptionCancelled', {
            email: subscriptionDeleted.customer_email || subscriptionDeleted.metadata?.email,
            userName: subscriptionDeleted.metadata?.userName || 'Usuario',
            accessUntil,
            lang: subscriptionDeleted.metadata?.lang || 'es'
          })
        }
        
        break

      case 'customer.subscription.trial_will_end':
        const subscriptionTrialEnding = event.data.object as Stripe.Subscription
        console.log('⚠️ Trial próximo a terminar:', {
          id: subscriptionTrialEnding.id,
          customer: subscriptionTrialEnding.customer,
          trial_end: subscriptionTrialEnding.trial_end,
        })
        
        // Enviar email de recordatorio al usuario
        if (subscriptionTrialEnding.customer_email || subscriptionTrialEnding.metadata?.email) {
          await sendEmail('trialEndingTomorrow', {
            email: subscriptionTrialEnding.customer_email || subscriptionTrialEnding.metadata?.email,
            userName: subscriptionTrialEnding.metadata?.userName || 'Usuario',
            lang: subscriptionTrialEnding.metadata?.lang || 'es'
          })
        }
        
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('✅ Pago de factura exitoso:', {
          id: invoice.id,
          customer: invoice.customer,
          subscription: invoice.subscription,
          amount: invoice.amount_paid,
        })
        
        // Enviar email de confirmación de pago mensual
        if (invoice.customer_email) {
          const amount = (invoice.amount_paid / 100).toFixed(2)
          
          // Solo enviar email si es un pago de suscripción (no el pago inicial)
          if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
            await sendEmail('monthlyPaymentSuccess', {
              email: invoice.customer_email,
              userName: invoice.metadata?.userName || 'Usuario',
              amount: parseFloat(amount),
              lang: invoice.metadata?.lang || 'es'
            })
          } else if (invoice.subscription && invoice.billing_reason === 'subscription_create') {
            // Primer pago de suscripción - enviar email de activación
            await sendEmail('subscriptionActivated', {
              email: invoice.customer_email,
              userName: invoice.metadata?.userName || 'Usuario',
              lang: invoice.metadata?.lang || 'es'
            })
          }
        }
        
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
        if (failedInvoice.customer_email) {
          const attempt = failedInvoice.attempt_count || 1
          
          await sendEmail('paymentFailed', {
            email: failedInvoice.customer_email,
            userName: failedInvoice.metadata?.userName || 'Usuario',
            attempt,
            lang: failedInvoice.metadata?.lang || 'es'
          })
        }
        
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

