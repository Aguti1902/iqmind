import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

/**
 * Webhook de Sipay para recibir notificaciones de transacciones
 * https://developer.sipay.es/docs/documentation/online/selling/notifications
 */

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  const computedSignature = hmac.update(payload).digest('hex')
  return computedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-sipay-signature') || ''

    console.log('🔔 Webhook de Sipay recibido')

    // Verificar firma
    const secret = process.env.SIPAY_API_SECRET!
    if (!verifySignature(rawBody, signature, secret)) {
      console.error('❌ Firma inválida en webhook de Sipay')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(rawBody)
    
    console.log('📦 Datos del webhook:', {
      type: data.type || data.event_type,
      transactionId: data.id_transaction,
      status: data.transaction_status,
    })

    // Procesar según el tipo de evento
    const eventType = data.type || data.event_type

    switch (eventType) {
      case 'payment.success':
      case 'transaction.authorized':
        await handlePaymentSuccess(data)
        break

      case 'payment.failed':
      case 'transaction.failed':
        await handlePaymentFailed(data)
        break

      case 'payment.refunded':
      case 'refund.completed':
        await handleRefund(data)
        break

      case 'recurring.success':
        await handleRecurringSuccess(data)
        break

      case 'recurring.failed':
        await handleRecurringFailed(data)
        break

      default:
        console.log('⚠️ Tipo de evento no manejado:', eventType)
    }

    return NextResponse.json({
      success: true,
      received: true,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('❌ Error en webhook de Sipay:', error)
    return NextResponse.json(
      { error: error.message || 'Error procesando webhook' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(data: any) {
  console.log('✅ Pago exitoso:', {
    transactionId: data.id_transaction,
    amount: data.amount,
    email: data.customer_email,
  })

  const email = data.customer_email
  if (!email) return

  try {
    const user = await db.getUserByEmail(email)
    if (!user) {
      console.error('❌ Usuario no encontrado:', email)
      return
    }

    // Guardar token si viene en la respuesta
    if (data.card_token) {
      await db.updateUser(user.id, {
        subscriptionId: data.card_token,
      })
      console.log('✅ Token guardado para usuario:', email)
    }

    // Activar trial de 2 días
    const trialEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    await db.updateUser(user.id, {
      subscriptionStatus: 'trial',
      trialEndDate: trialEnd.toISOString(),
    })

    console.log('✅ Usuario actualizado con trial de 2 días')
    
    // TODO: Enviar email de bienvenida
    
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error)
  }
}

async function handlePaymentFailed(data: any) {
  console.log('❌ Pago fallido:', {
    transactionId: data.id_transaction,
    reason: data.error_message || data.description,
    email: data.customer_email,
  })

  // TODO: Notificar al usuario del fallo
  // TODO: Registrar en logs para análisis
}

async function handleRefund(data: any) {
  console.log('↩️ Reembolso procesado:', {
    refundId: data.id_refund,
    transactionId: data.id_transaction,
    amount: data.amount,
    email: data.customer_email,
  })

  const email = data.customer_email
  if (!email) return

  try {
    const user = await db.getUserByEmail(email)
    if (!user) return

    // Desactivar acceso del usuario
    await db.updateUser(user.id, {
      subscriptionStatus: 'cancelled',
      accessUntil: new Date().toISOString(),
    })

    console.log('✅ Acceso desactivado después de reembolso')
    
    // TODO: Enviar email confirmando reembolso
    
  } catch (error) {
    console.error('❌ Error procesando reembolso:', error)
  }
}

async function handleRecurringSuccess(data: any) {
  console.log('🔄 Pago recurrente exitoso:', {
    transactionId: data.id_transaction,
    amount: data.amount,
    email: data.customer_email,
  })

  const email = data.customer_email
  if (!email) return

  try {
    const user = await db.getUserByEmail(email)
    if (!user) return

    // Extender suscripción por 1 mes más
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await db.updateUser(user.id, {
      subscriptionStatus: 'active',
      accessUntil: nextMonth.toISOString(),
    })

    console.log('✅ Suscripción extendida por 1 mes')
    
    // TODO: Enviar email de confirmación de renovación
    
  } catch (error) {
    console.error('❌ Error actualizando suscripción:', error)
  }
}

async function handleRecurringFailed(data: any) {
  console.log('❌ Pago recurrente fallido:', {
    transactionId: data.id_transaction,
    reason: data.error_message || data.description,
    email: data.customer_email,
  })

  const email = data.customer_email
  if (!email) return

  try {
    const user = await db.getUserByEmail(email)
    if (!user) return

    // Marcar suscripción como vencida
    await db.updateUser(user.id, {
      subscriptionStatus: 'expired',
    })

    console.log('⚠️ Suscripción marcada como vencida')
    
    // TODO: Enviar email notificando el fallo en el pago
    // TODO: Dar período de gracia antes de desactivar completamente
    
  } catch (error) {
    console.error('❌ Error actualizando suscripción fallida:', error)
  }
}

