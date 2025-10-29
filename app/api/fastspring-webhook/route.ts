import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { sendEmail } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'
export const dynamic = 'force-dynamic'

// Tipos de eventos FastSpring
type FastSpringEvent = 
  | 'order.completed'
  | 'subscription.activated'
  | 'subscription.charge.completed'
  | 'subscription.charge.failed'
  | 'subscription.canceled'
  | 'subscription.deactivated'
  | 'subscription.payment.reminder'
  | 'return.created'
  | 'fulfillment.created'

interface FastSpringWebhookEvent {
  id: string
  type: FastSpringEvent
  live: boolean
  processed: boolean
  created: number
  data: any
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const events = body.events as FastSpringWebhookEvent[]

    console.log('📨 Webhook de FastSpring recibido:', events?.length || 0, 'eventos')

    // Verificar HMAC signature si está configurado
    const signature = request.headers.get('x-fastspring-signature')
    const webhookSecret = process.env.FASTSPRING_WEBHOOK_SECRET
    
    if (webhookSecret && signature) {
      // TODO: Implementar verificación HMAC si lo configuras en FastSpring
      console.log('🔐 Verificando firma del webhook...')
    }

    if (!events || !Array.isArray(events)) {
      console.error('❌ Formato de webhook inválido')
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    for (const event of events) {
      console.log(`📦 Procesando evento: ${event.type} (ID: ${event.id})`)

      try {
        switch (event.type) {
          case 'order.completed':
            await handleOrderCompleted(event.data)
            break

          case 'subscription.activated':
            await handleSubscriptionActivated(event.data)
            break

          case 'subscription.charge.completed':
            await handleSubscriptionChargeCompleted(event.data)
            break

          case 'subscription.charge.failed':
            await handleSubscriptionChargeFailed(event.data)
            break

          case 'subscription.canceled':
            await handleSubscriptionCanceled(event.data)
            break

          case 'subscription.deactivated':
            await handleSubscriptionDeactivated(event.data)
            break

          case 'return.created':
            await handleReturnCreated(event.data)
            break

          default:
            console.log(`ℹ️ Evento no manejado: ${event.type}`)
        }
      } catch (eventError) {
        console.error(`❌ Error procesando evento ${event.type}:`, eventError)
        // Continuar con el siguiente evento
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('❌ Error en webhook de FastSpring:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

async function handleOrderCompleted(data: any) {
  console.log('✅ Orden completada:', data.id || data.reference)
  
  const email = data.customer?.email
  const subscriptionId = data.items?.[0]?.subscription
  
  if (!email) {
    console.error('❌ No se encontró email en la orden')
    return
  }

  // Buscar usuario por email
  const user = await db.getUserByEmail(email)
  
  if (user) {
    console.log('👤 Usuario encontrado:', user.id)
    
    // Actualizar subscription ID si existe
    if (subscriptionId && user.subscriptionId !== subscriptionId) {
      await db.updateUser(user.id, {
        subscriptionId: subscriptionId,
        subscriptionStatus: 'trial'
      })
      console.log('✅ Subscription ID actualizado')
    }
  } else {
    console.log('⚠️ Usuario no encontrado, probablemente se creará en /api/fastspring-process-order')
  }
}

async function handleSubscriptionActivated(data: any) {
  console.log('✅ Suscripción activada:', data.id)
  
  const user = await db.getUserBySubscriptionId(data.id)
  
  if (!user) {
    console.error('❌ Usuario no encontrado para subscription:', data.id)
    return
  }

  console.log('👤 Usuario encontrado:', user.email)

  // Actualizar a activa (después del trial)
  const nextChargeDate = data.nextChargeDate ? new Date(data.nextChargeDate * 1000) : null
  
  await db.updateUser(user.id, {
    subscriptionStatus: 'active',
    accessUntil: nextChargeDate ? nextChargeDate.toISOString() : undefined
  })

  console.log('✅ Usuario actualizado a activo')

  // Enviar email de activación
  try {
    const lang = data.tags?.lang || 'es'
    const t = (key: any) => getEmailTranslation(lang, key)
    
    await sendEmail({
      to: user.email,
      subject: t('subscriptionActivatedSubject') || 'Suscripción activada - IQmind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Suscripción Activada</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #031C43;">✅ Tu suscripción está activa</h2>
            <p>Hola ${user.userName},</p>
            <p>Tu período de prueba ha finalizado y tu suscripción premium ha sido activada exitosamente.</p>
            <p><strong>Próximo cargo:</strong> ${nextChargeDate ? nextChargeDate.toLocaleDateString('es-ES') : 'N/A'}</p>
            <p><strong>Monto:</strong> €9.99/mes</p>
            <p>Puedes cancelar en cualquier momento desde tu cuenta.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${lang}/cuenta" style="display: inline-block; background: #218B8E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Acceder a mi cuenta
            </a>
          </div>
        </body>
        </html>
      `
    })
    console.log('📧 Email de activación enviado')
  } catch (emailError) {
    console.error('❌ Error enviando email:', emailError)
  }
}

async function handleSubscriptionChargeCompleted(data: any) {
  console.log('💳 Cargo de suscripción completado:', data.id)
  
  const user = await db.getUserBySubscriptionId(data.subscription)
  
  if (!user) {
    console.error('❌ Usuario no encontrado para subscription:', data.subscription)
    return
  }

  console.log('👤 Usuario encontrado:', user.email)

  // Extender acceso hasta el próximo cargo
  const nextChargeDate = data.nextChargeDate ? new Date(data.nextChargeDate * 1000) : null
  
  await db.updateUser(user.id, {
    subscriptionStatus: 'active',
    accessUntil: nextChargeDate ? nextChargeDate.toISOString() : undefined
  })

  console.log('✅ Acceso extendido')

  // Enviar email de confirmación de pago mensual
  try {
    const amount = (data.amountInPayoutCurrency || data.total || 9.99).toFixed(2)
    const currency = data.currency || 'EUR'
    const lang = data.tags?.lang || 'es'
    
    await sendEmail({
      to: user.email,
      subject: 'Pago recibido - IQmind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Pago Recibido</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #031C43;">✅ Pago recibido</h2>
            <p>Hola ${user.userName},</p>
            <p>Hemos recibido tu pago mensual de <strong>${amount} ${currency}</strong>.</p>
            <p>Tu suscripción continúa activa.</p>
            <p><strong>Próximo cargo:</strong> ${nextChargeDate ? nextChargeDate.toLocaleDateString('es-ES') : 'N/A'}</p>
            <p>Gracias por confiar en IQmind.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${lang}/cuenta" style="display: inline-block; background: #218B8E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Ver mi cuenta
            </a>
          </div>
        </body>
        </html>
      `
    })
    console.log('📧 Email de confirmación de pago enviado')
  } catch (emailError) {
    console.error('❌ Error enviando email:', emailError)
  }
}

async function handleSubscriptionChargeFailed(data: any) {
  console.log('❌ Cargo de suscripción fallido:', data.id)
  
  const user = await db.getUserBySubscriptionId(data.subscription)
  
  if (!user) {
    console.error('❌ Usuario no encontrado para subscription:', data.subscription)
    return
  }

  console.log('👤 Usuario encontrado:', user.email)

  // Enviar email de pago fallido
  try {
    const attempt = data.attemptCount || 1
    const lang = data.tags?.lang || 'es'
    
    await sendEmail({
      to: user.email,
      subject: '⚠️ Problema con tu pago - IQmind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Problema con el pago</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #c53030;">⚠️ No pudimos procesar tu pago</h2>
            <p>Hola ${user.userName},</p>
            <p>No hemos podido procesar tu pago mensual de €9.99.</p>
            <p><strong>Intento:</strong> ${attempt}</p>
            <p>Por favor, actualiza tu método de pago para evitar la cancelación de tu suscripción.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${lang}/cuenta" style="display: inline-block; background: #c53030; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Actualizar método de pago
            </a>
          </div>
        </body>
        </html>
      `
    })
    console.log('📧 Email de pago fallido enviado')
  } catch (emailError) {
    console.error('❌ Error enviando email:', emailError)
  }
}

async function handleSubscriptionCanceled(data: any) {
  console.log('🚫 Suscripción cancelada:', data.id)
  
  const user = await db.getUserBySubscriptionId(data.id)
  
  if (!user) {
    console.error('❌ Usuario no encontrado para subscription:', data.id)
    return
  }

  console.log('👤 Usuario encontrado:', user.email)

  // Actualizar estado a cancelado
  const endDate = data.endDate ? new Date(data.endDate * 1000) : new Date()
  
  await db.updateUser(user.id, {
    subscriptionStatus: 'cancelled',
    accessUntil: endDate.toISOString()
  })

  console.log('✅ Usuario marcado como cancelado')

  // Enviar email de confirmación de cancelación
  try {
    const lang = data.tags?.lang || 'es'
    const accessUntil = endDate.toLocaleDateString('es-ES')
    
    await sendEmail({
      to: user.email,
      subject: 'Suscripción cancelada - IQmind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Suscripción Cancelada</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #031C43;">Tu suscripción ha sido cancelada</h2>
            <p>Hola ${user.userName},</p>
            <p>Tu suscripción a IQmind ha sido cancelada.</p>
            <p><strong>Acceso hasta:</strong> ${accessUntil}</p>
            <p>Podrás seguir accediendo a tu cuenta hasta esa fecha.</p>
            <p>Si cambias de opinión, puedes reactivar tu suscripción en cualquier momento.</p>
            <p>Lamentamos verte partir. 😢</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${lang}/cuenta" style="display: inline-block; background: #218B8E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Ver mi cuenta
            </a>
          </div>
        </body>
        </html>
      `
    })
    console.log('📧 Email de cancelación enviado')
  } catch (emailError) {
    console.error('❌ Error enviando email:', emailError)
  }
}

async function handleSubscriptionDeactivated(data: any) {
  console.log('❌ Suscripción desactivada:', data.id)
  
  const user = await db.getUserBySubscriptionId(data.id)
  
  if (!user) {
    console.error('❌ Usuario no encontrado para subscription:', data.id)
    return
  }

  console.log('👤 Usuario encontrado:', user.email)

  // Marcar como expirado
  await db.updateUser(user.id, {
    subscriptionStatus: 'expired'
  })

  console.log('✅ Usuario marcado como expirado')
}

async function handleReturnCreated(data: any) {
  console.log('🔄 Reembolso creado:', data.id)
  
  // FastSpring gestiona los reembolsos automáticamente
  // Aquí puedes agregar lógica adicional si necesitas hacer algo especial
  
  const email = data.customer?.email
  if (email) {
    const user = await db.getUserByEmail(email)
    
    if (user) {
      console.log('👤 Usuario encontrado:', user.email)
      
      // Marcar como cancelado si se hizo reembolso total
      if (data.refundType === 'full') {
        await db.updateUser(user.id, {
          subscriptionStatus: 'cancelled'
        })
        console.log('✅ Usuario cancelado por reembolso total')
      }
      
      // Enviar email de reembolso
      try {
        const lang = 'es' // Podrías obtenerlo de algún metadata
        const amount = (data.total || 0).toFixed(2)
        
        await sendEmail({
          to: user.email,
          subject: 'Reembolso procesado - IQmind',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Reembolso Procesado</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                <h2 style="color: #031C43;">Reembolso procesado</h2>
                <p>Hola ${user.userName},</p>
                <p>Tu reembolso de <strong>${amount} EUR</strong> ha sido procesado.</p>
                <p>El dinero será devuelto a tu método de pago original en 5-10 días hábiles.</p>
                <p>Gracias por haber probado IQmind.</p>
              </div>
            </body>
            </html>
          `
        })
        console.log('📧 Email de reembolso enviado')
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError)
      }
    }
  }
}

