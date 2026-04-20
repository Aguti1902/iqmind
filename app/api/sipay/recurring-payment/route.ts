import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { verifyInternalApiKey } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

const MAX_RETRY_DAYS = 7
const GRACE_PERIOD_DAYS = 3

/**
 * Procesar pago recurrente con Sipay usando token guardado
 * MIT (Merchant Initiated Transaction) - Sin presencia del cliente
 *
 * Lógica de reintentos:
 * - 1er fallo: status queda igual, se da periodo de gracia de 3 días
 * - El cron reintentará en las siguientes ejecuciones (cada 6h)
 * - Después de 7 días sin poder cobrar: status = 'expired'
 */
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = verifyInternalApiKey(request)
    if (!isAuthorized) {
      console.error('❌ Intento de acceso no autorizado a recurring-payment')
      return NextResponse.json(
        { error: 'No autorizado. Este endpoint requiere autenticación interna.' },
        { status: 401 }
      )
    }

    const { email, amount, description, isRetry } = await request.json()

    console.log('🔄 Procesando pago recurrente con Sipay:', { email, amount, isRetry })

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email y monto requeridos' },
        { status: 400 }
      )
    }

    if (amount !== 19.99) {
      console.warn(`⚠️ Monto inesperado en pago recurrente: ${amount}`)
    }

    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const cardToken = user.subscriptionId
    if (!cardToken) {
      return NextResponse.json(
        { error: 'No hay tarjeta guardada para este usuario' },
        { status: 400 }
      )
    }

    const sipay = getSipayClient()
    const orderId = Date.now().toString().slice(-10)
    const amountInCents = Math.round(amount * 100)

    const response: any = await sipay.authorizeRecurring({
      amount: amountInCents,
      currency: 'EUR',
      orderId,
      cardToken,
      mitReason: 'R',
    })

    console.log('📡 [recurring] TRAZA COMPLETA Sipay:', JSON.stringify({
      email,
      cardToken_preview: cardToken?.slice(0, 15) + '...',
      orderId,
      amount: amountInCents,
      response_type: response.type,
      response_code: response.code,
      response_detail: response.detail,
      response_description: response.description,
      response_uuid: response.uuid,
      response_request_id: response.request_id,
      payload: response.payload,
    }))

    if (response.type !== 'success') {
      console.error('❌ [recurring] PARA SIPAY SUPPORT — uuid:', response.uuid, '| request_id:', response.request_id, '| token_preview:', cardToken?.slice(0, 15), '| error:', response.detail)

      const now = new Date()
      const originalDueDate = user.trialEndDate
        ? new Date(user.trialEndDate)
        : user.accessUntil
          ? new Date(user.accessUntil)
          : now

      const daysSinceDue = Math.floor((now.getTime() - originalDueDate.getTime()) / (1000 * 60 * 60 * 24))
      const attemptNumber = Math.max(1, Math.ceil(daysSinceDue / 0.25))

      if (daysSinceDue >= MAX_RETRY_DAYS) {
        console.log(`⛔ [recurring] ${email}: ${daysSinceDue} días sin pagar, expirando cuenta`)
        await db.updateUser(user.id, { subscriptionStatus: 'expired' })

        try {
          const userName = user.userName || email.split('@')[0]
          const failEmail = emailTemplates.paymentFailed(email, userName, attemptNumber, 'es')
          await sendEmail(failEmail)
        } catch (e: any) {
          console.error('⚠️ Error enviando email de pago fallido final:', e.message)
        }
      } else {
        const gracePeriod = new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
        const currentAccess = user.accessUntil ? new Date(user.accessUntil) : now

        if (gracePeriod > currentAccess) {
          await db.updateUser(user.id, { accessUntil: gracePeriod.toISOString() })
          console.log(`⏳ [recurring] ${email}: gracia extendida hasta ${gracePeriod.toISOString()}`)
        }

        if (daysSinceDue < 1 || daysSinceDue === 3 || daysSinceDue === 5) {
          try {
            const userName = user.userName || email.split('@')[0]
            const failEmail = emailTemplates.paymentFailed(email, userName, attemptNumber, 'es')
            await sendEmail(failEmail)
            console.log(`📧 [recurring] Email de pago fallido enviado a ${email} (intento ~${attemptNumber})`)
          } catch (e: any) {
            console.error('⚠️ Error enviando email de pago fallido:', e.message)
          }
        }
      }

      return NextResponse.json(
        { error: response.description || 'Error procesando el pago recurrente', retryable: daysSinceDue < MAX_RETRY_DAYS },
        { status: 400 }
      )
    }

    // Pago exitoso
    const nextBillingDate = new Date()
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    await db.updateUser(user.id, {
      subscriptionStatus: 'active',
      accessUntil: nextBillingDate.toISOString(),
    })

    const transactionId = response.payload?.transaction_id
    console.log('✅ Pago recurrente procesado. Transaction:', transactionId)

    try {
      const userName = user.userName || email.split('@')[0]
      const successEmail = emailTemplates.monthlyPaymentSuccess(email, userName, amount, 'es')
      await sendEmail(successEmail)
      console.log(`📧 [recurring] Email de pago exitoso enviado a ${email}`)
    } catch (e: any) {
      console.error('⚠️ Error enviando email de pago exitoso:', e.message)
    }

    return NextResponse.json({
      success: true,
      transactionId,
      orderId: response.payload?.order,
      amount: response.payload?.amount,
      approval: response.payload?.approval,
      nextBillingDate: nextBillingDate.toISOString(),
    })

  } catch (error: any) {
    console.error('❌ Error en pago recurrente:', error)
    return NextResponse.json(
      { error: error.message || 'Error en pago recurrente' },
      { status: 500 }
    )
  }
}
