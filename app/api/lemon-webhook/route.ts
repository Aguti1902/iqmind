// app/api/lemon-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { getLemonSqueezyConfig } from '@/lib/lemonsqueezy-config'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Verificar firma del webhook
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature')
    const rawBody = await request.text()
    
    console.log('🍋 [Lemon Squeezy Webhook] Evento recibido')

    // Obtener configuración y verificar firma
    const lemonConfig = await getLemonSqueezyConfig()
    
    if (signature && lemonConfig.webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, lemonConfig.webhookSecret)
      if (!isValid) {
        console.error('❌ [Lemon Squeezy Webhook] Firma inválida')
        return NextResponse.json({ error: 'Firma inválida' }, { status: 403 })
      }
      console.log('✅ [Lemon Squeezy Webhook] Firma verificada')
    }

    const event = JSON.parse(rawBody)
    const eventName = event.meta?.event_name
    const eventData = event.data

    console.log('📊 [Lemon Squeezy Webhook] Tipo de evento:', eventName)

    // Manejar diferentes tipos de eventos
    switch (eventName) {
      case 'order_created':
        console.log('💰 [Lemon Squeezy] Orden creada:', eventData.id)
        // El pago inicial se completó, pero esperamos a que se cree la suscripción
        break

      case 'subscription_created':
        console.log('🎉 [Lemon Squeezy] Suscripción creada:', eventData.id)
        
        // Extraer información del evento
        const customData = eventData.attributes.custom_data || {}
        const userId = customData.user_id
        const customerEmail = eventData.attributes.user_email
        const subscriptionId = eventData.id
        const status = eventData.attributes.status // 'on_trial', 'active', 'paused', 'cancelled', 'expired'
        const trialEndsAt = eventData.attributes.trial_ends_at
        const renewsAt = eventData.attributes.renews_at

        console.log('📧 Email del cliente:', customerEmail)
        console.log('👤 User ID:', userId)
        console.log('📅 Trial ends:', trialEndsAt)
        console.log('📅 Renews at:', renewsAt)

        // Buscar usuario por email o userId
        let user
        if (userId) {
          user = await db.getUserById(userId)
        }
        if (!user && customerEmail) {
          user = await db.getUserByEmail(customerEmail)
        }

        if (user) {
          // Actualizar usuario con información de suscripción
          await db.updateUserSubscription(
            user.id,
            subscriptionId,
            status === 'on_trial' ? 'trial' : 'active',
            trialEndsAt ? new Date(trialEndsAt) : undefined,
            renewsAt ? new Date(renewsAt) : undefined
          )
          console.log('✅ [Lemon Squeezy] Usuario actualizado:', user.id)
        } else {
          console.error('❌ [Lemon Squeezy] Usuario no encontrado:', { userId, customerEmail })
        }
        break

      case 'subscription_updated':
        console.log('🔄 [Lemon Squeezy] Suscripción actualizada:', eventData.id)
        
        const subscriptionIdUpdated = eventData.id
        const statusUpdated = eventData.attributes.status
        const renewsAtUpdated = eventData.attributes.renews_at

        // Actualizar estado de suscripción
        const userWithSub = await db.getUserBySubscriptionId(subscriptionIdUpdated)
        if (userWithSub) {
          let newStatus: 'trial' | 'active' | 'cancelled' | 'expired' = 'active'
          
          if (statusUpdated === 'on_trial') newStatus = 'trial'
          else if (statusUpdated === 'cancelled') newStatus = 'cancelled'
          else if (statusUpdated === 'expired') newStatus = 'expired'
          else if (statusUpdated === 'active') newStatus = 'active'

          await db.updateUserSubscription(
            userWithSub.id,
            subscriptionIdUpdated,
            newStatus,
            undefined,
            renewsAtUpdated ? new Date(renewsAtUpdated) : undefined
          )
          console.log('✅ [Lemon Squeezy] Suscripción actualizada:', { userId: userWithSub.id, status: newStatus })
        }
        break

      case 'subscription_cancelled':
        console.log('❌ [Lemon Squeezy] Suscripción cancelada:', eventData.id)
        
        const subscriptionIdCancelled = eventData.id
        const userCancelled = await db.getUserBySubscriptionId(subscriptionIdCancelled)
        
        if (userCancelled) {
          await db.updateUserSubscription(
            userCancelled.id,
            subscriptionIdCancelled,
            'cancelled'
          )
          console.log('✅ [Lemon Squeezy] Usuario actualizado a cancelled')
        }
        break

      case 'subscription_expired':
        console.log('⏰ [Lemon Squeezy] Suscripción expirada:', eventData.id)
        
        const subscriptionIdExpired = eventData.id
        const userExpired = await db.getUserBySubscriptionId(subscriptionIdExpired)
        
        if (userExpired) {
          await db.updateUserSubscription(
            userExpired.id,
            subscriptionIdExpired,
            'expired'
          )
          console.log('✅ [Lemon Squeezy] Usuario actualizado a expired')
        }
        break

      case 'subscription_payment_success':
        console.log('💳 [Lemon Squeezy] Pago exitoso:', eventData.id)
        // El pago recurrente se procesó correctamente
        break

      case 'subscription_payment_failed':
        console.log('⚠️ [Lemon Squeezy] Pago fallido:', eventData.id)
        // Aquí podrías enviar un email al usuario o marcar la cuenta
        break

      default:
        console.log('ℹ️ [Lemon Squeezy] Evento no manejado:', eventName)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('❌ [Lemon Squeezy Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook', details: error.message },
      { status: 500 }
    )
  }
}

