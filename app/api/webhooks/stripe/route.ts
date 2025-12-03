import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendEmail, emailTemplates } from '@/lib/email-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  console.log('✅ Webhook recibido:', event.type)

  try {
    switch (event.type) {
      // 💳 Pago de €0.50 completado (desbloquear resultado)
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('💰 Pago completado:', paymentIntent.id)
        
        // Obtener datos del metadata
        const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.userEmail
        const userName = paymentIntent.metadata?.userName || 'Usuario'
        const userIQ = parseInt(paymentIntent.metadata?.userIQ || '100')
        const lang = paymentIntent.metadata?.lang || 'es'
        
        console.log('📧 Datos para email:', { customerEmail, userName, userIQ, lang })
        
        if (customerEmail) {
          try {
            // EMAIL 1: Enviar email de pago exitoso
            const emailResult = await sendEmail(emailTemplates.paymentSuccess(
              customerEmail,
              userName,
              userIQ,
              lang
            ))
            
            if (emailResult.success) {
              console.log('✅ Email 1/2 enviado: Pago exitoso a:', customerEmail)
            } else {
              console.error('❌ Error enviando email de pago:', emailResult.error)
            }

            // EMAIL 2: Crear usuario y enviar credenciales
            console.log('👤 Creando usuario y enviando credenciales...')
            
            try {
              const createUserResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://mindmetric.io'}/api/create-user-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: customerEmail,
                  userName,
                  iq: userIQ,
                  lang,
                }),
              })

              const createUserData = await createUserResponse.json()
              
              if (createUserData.success) {
                console.log('✅ Email 2/2 enviado: Credenciales a:', customerEmail)
                console.log('🔑 Contraseña generada:', createUserData.credentials?.password)
              } else if (createUserData.error === 'Usuario ya existe') {
                console.log('ℹ️ Usuario ya existe, no se envía email de credenciales')
              } else {
                console.error('❌ Error creando usuario:', createUserData.error)
              }
            } catch (userError) {
              console.error('❌ Excepción creando usuario:', userError)
            }

          } catch (emailError) {
            console.error('❌ Excepción en flujo de emails:', emailError)
          }
        } else {
          console.warn('⚠️ No se pudo enviar emails: falta customerEmail')
        }
        
        break
      }

      // 🎉 Suscripción creada exitosamente
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          const customerEmail = session.customer_details?.email || session.metadata?.userEmail
          const lang = session.metadata?.lang || 'es'
          
          if (customerEmail) {
            // Aquí deberías actualizar tu base de datos
            // await db.updateUserSubscription(customerEmail, {
            //   stripeCustomerId: customerId,
            //   subscriptionId: subscriptionId,
            //   isSubscribed: true,
            // })
            
            // Obtener detalles de la suscripción
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const userName = customerEmail.split('@')[0]
            
            // Enviar email de bienvenida
            await sendEmail(emailTemplates.subscriptionActivated(
              customerEmail,
              userName,
              lang
            ))
            
            console.log('✅ Suscripción activada para:', customerEmail)
          }
        }
        break
      }

      // 🔄 Suscripción actualizada
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const email = (customer as Stripe.Customer).email
        
        if (email) {
          // Actualizar estado en base de datos
          // await db.updateSubscriptionStatus(email, subscription.status)
          
          console.log('🔄 Suscripción actualizada para:', email, 'Estado:', subscription.status)
        }
        break
      }

      // 🔄 Pago recurrente exitoso
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const email = (customer as Stripe.Customer).email
          const userName = email?.split('@')[0] || 'Usuario'
          const lang = (customer as Stripe.Customer).metadata?.lang || 'es'
          
          if (email) {
            // Extender suscripción en base de datos
            // await db.extendSubscription(email, new Date(subscription.current_period_end * 1000))
            
            // Enviar confirmación de pago
            await sendEmail(emailTemplates.monthlyPaymentSuccess(
              email,
              userName,
              invoice.amount_paid / 100,
              lang
            ))
            
            console.log('✅ Pago recurrente procesado para:', email)
          }
        }
        break
      }

      // ❌ Pago recurrente fallido
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const email = (customer as Stripe.Customer).email
          const userName = email?.split('@')[0] || 'Usuario'
          const lang = (customer as Stripe.Customer).metadata?.lang || 'es'
          
          if (email) {
            // Contar intentos fallidos
            const attempt = invoice.attempt_count || 1
            
            // Enviar email de aviso
            await sendEmail(emailTemplates.paymentFailed(
              email,
              userName,
              attempt,
              lang
            ))
            
            console.log('⚠️ Pago fallido para:', email, 'Intento:', attempt)
          }
        }
        break
      }

      // 🚫 Suscripción cancelada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const email = (customer as Stripe.Customer).email
        const userName = email?.split('@')[0] || 'Usuario'
        const lang = (customer as Stripe.Customer).metadata?.lang || 'es'
        
        if (email) {
          // Desactivar suscripción en base de datos
          // await db.updateUserSubscription(email, {
          //   isSubscribed: false,
          //   subscriptionId: null,
          // })
          
          // Fecha de fin de acceso
          const accessUntil = new Date(subscription.current_period_end * 1000).toLocaleDateString('es-ES')
          
          // Enviar confirmación de cancelación
          await sendEmail(emailTemplates.subscriptionCancelled(
            email,
            userName,
            accessUntil,
            lang
          ))
          
          console.log('❌ Suscripción cancelada para:', email)
        }
        break
      }

      // 📅 Próxima factura (recordatorio - 3 días antes)
      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const email = (customer as Stripe.Customer).email
          
          if (email) {
            // No enviar email aquí, ya que puede ser spam
            // Solo log para monitoreo
            console.log('📅 Próxima factura para:', email, 'Monto:', invoice.amount_due / 100)
          }
        }
        break
      }

      default:
        console.log('ℹ️ Evento no manejado:', event.type)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

