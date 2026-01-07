// app/api/whop/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/database-postgres'
// import { sendWelcomeEmail, sendTrialStartEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

/**
 * Webhook de Whop para manejar eventos de membresías y pagos
 * POST /api/whop/webhook
 * 
 * Eventos importantes:
 * - membership.went_valid: Usuario activó membresía (después de pago)
 * - membership.went_invalid: Membresía expiró o fue cancelada
 * - payment.succeeded: Pago exitoso
 * - payment.failed: Pago fallido
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n🔔 ================================')
    console.log('🔔 WEBHOOK WHOP RECIBIDO')
    console.log('🔔 ================================')

    const headersList = headers()
    const signature = headersList.get('x-whop-signature')
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET

    console.log('🔐 Signature:', signature ? 'Presente' : 'Ausente')

    // Obtener el body del webhook
    const body = await request.json()
    const event = body

    console.log('📦 Evento recibido:', event.action || event.type)
    console.log('📄 Datos completos:', JSON.stringify(event, null, 2))

    // Verificar firma si está configurada
    if (webhookSecret && signature) {
      // TODO: Implementar verificación de firma de Whop
      console.log('🔐 Verificación de firma pendiente')
    }

    const action = event.action || event.type

    // Manejar diferentes tipos de eventos
    switch (action) {
      case 'membership.went_valid':
        await handleMembershipActivated(event)
        break

      case 'membership.went_invalid':
        await handleMembershipDeactivated(event)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(event)
        break

      case 'payment.failed':
        await handlePaymentFailed(event)
        break

      default:
        console.log('ℹ️ Evento no manejado:', action)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Maneja cuando una membresía se activa (usuario pagó)
 */
async function handleMembershipActivated(event: any) {
  console.log('\n✅ MEMBRESÍA ACTIVADA')
  
  const membership = event.data
  const email = membership.email
  const userId = membership.user_id
  const membershipId = membership.id
  const validUntil = membership.valid_until
  const planId = membership.plan_id

  console.log('📧 Email:', email)
  console.log('🆔 User ID:', userId)
  console.log('🎫 Membership ID:', membershipId)
  console.log('📅 Válido hasta:', validUntil)
  console.log('📦 Plan ID:', planId)

  try {
    // Buscar o crear usuario en la base de datos
    let user = await db.getUserByEmail(email)

    if (!user) {
      console.log('👤 Usuario no encontrado, creando...')
      // Crear nuevo usuario
      await db.createUser({
        email,
        password: '', // Whop maneja la autenticación
        userName: membership.username || 'Usuario',
        subscriptionStatus: 'trial',
      })
      user = await db.getUserByEmail(email)
    }

    if (user) {
      // Actualizar suscripción del usuario
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 2) // 2 días de trial

      await db.updateUserSubscription(
        user.id,
        membershipId,
        'trial',
        trialEndDate,
        new Date(validUntil)
      )

      console.log('✅ Usuario actualizado en BD')

      // Enviar emails de bienvenida
      try {
        // TODO: Implementar envío de emails con Whop
        // await sendWelcomeEmail(email, user.name || 'Usuario')
        // await sendTrialStartEmail(email, user.name || 'Usuario', 2) // 2 días
        console.log('📧 Emails pendientes de configurar')
      } catch (emailError) {
        console.error('⚠️ Error enviando emails:', emailError)
      }
    }

  } catch (dbError) {
    console.error('❌ Error actualizando BD:', dbError)
  }
}

/**
 * Maneja cuando una membresía se desactiva (cancelación o expiración)
 */
async function handleMembershipDeactivated(event: any) {
  console.log('\n❌ MEMBRESÍA DESACTIVADA')
  
  const membership = event.data
  const email = membership.email
  const membershipId = membership.id

  console.log('📧 Email:', email)
  console.log('🆔 Membership ID:', membershipId)

  try {
    const user = await db.getUserByEmail(email)

    if (user) {
      await db.updateUserSubscription(
        user.id,
        membershipId,
        'cancelled',
        undefined,
        new Date()
      )

      console.log('✅ Usuario actualizado - membresía cancelada')
    }
  } catch (dbError) {
    console.error('❌ Error actualizando BD:', dbError)
  }
}

/**
 * Maneja pagos exitosos
 */
async function handlePaymentSucceeded(event: any) {
  console.log('\n💰 PAGO EXITOSO')
  
  const payment = event.data
  console.log('💳 Payment:', JSON.stringify(payment, null, 2))

  // Whop ya maneja la activación de membresía automáticamente
  console.log('✅ Pago procesado por Whop')
}

/**
 * Maneja pagos fallidos
 */
async function handlePaymentFailed(event: any) {
  console.log('\n❌ PAGO FALLIDO')
  
  const payment = event.data
  console.log('💳 Payment:', JSON.stringify(payment, null, 2))

  // TODO: Enviar email de notificación de pago fallido
  console.log('⚠️ Notificar al usuario sobre pago fallido')
}

