import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

/**
 * PASO 1: Iniciar pago con Sipay
 * 
 * Flujo completo PSD2:
 * 1. FastPay (iframe) tokeniza tarjeta → devuelve request_id
 * 2. Este endpoint llama a /all-in-one con fastpay.request_id → devuelve URL 3DS
 * 3. Frontend redirige al usuario a la URL 3DS
 * 4. Usuario se autentica con el banco → redirigido a url_ok con request_id
 * 5. /api/sipay/confirm-payment llama a /all-in-one/confirm → captura fondos
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`process-payment:${clientIP}`, 5, 60000)
    
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetIn)
    }

    const {
      orderId,
      requestId, // request_id de FastPay
      email,
      amount,
      lang,
      testType = 'iq'
    } = await request.json()

    console.log('💳 [process-payment] Iniciando pago Sipay:', { orderId, requestId: requestId?.slice(0, 8) + '...', email })

    if (!orderId || !requestId) {
      return NextResponse.json(
        { error: 'orderId y requestId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar usuario
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const sipay = getSipayClient()
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://mindmetric.io'
    const paymentLang = lang || 'es'

    // URL de confirmación: cuando 3DS termine, Sipay redirigirá aquí
    // Incluimos datos necesarios en la URL para el confirm
    const confirmUrl = `${origin}/api/sipay/confirm-payment?order_id=${orderId}&email=${encodeURIComponent(email)}&lang=${paymentLang}&test_type=${testType}`
    const errorUrl = `${origin}/${paymentLang}/checkout-payment?error=true&email=${encodeURIComponent(email)}`

    console.log('💳 [process-payment] url_ok:', confirmUrl)
    console.log('💳 [process-payment] url_ko:', errorUrl)

    // Llamar a /all-in-one con el request_id de FastPay
    let allinoneResult: any
    try {
      allinoneResult = await sipay.authorizeWithFastPay({
        amount: Math.round((amount || 0.50) * 100),
        currency: 'EUR',
        orderId: orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
        requestId: requestId,
        customerEmail: email,
        urlOk: confirmUrl,
        urlKo: errorUrl,
      })
    } catch (sipayError: any) {
      console.error('❌ [process-payment] Error en all-in-one:', sipayError.message)
      return NextResponse.json(
        { 
          error: 'Error iniciando el pago con Sipay', 
          detail: sipayError.message,
          step: 'all-in-one'
        },
        { status: 502 }
      )
    }

    console.log('📥 [process-payment] all-in-one result:', JSON.stringify(allinoneResult))

    // Sipay devuelve una URL 3DS para autenticación
    const threeDSUrl = allinoneResult?.payload?.url
    const sipayRequestId = allinoneResult?.request_id || allinoneResult?.payload?.request_id

    if (threeDSUrl) {
      // Devolver la URL 3DS al frontend para redirección
      console.log('🔗 [process-payment] URL 3DS encontrada, redirigiendo usuario:', threeDSUrl)
      return NextResponse.json({
        success: true,
        requires3DS: true,
        threeDSUrl: threeDSUrl,
        sipayRequestId: sipayRequestId,
      })
    }

    // Si no requiere 3DS (frictionless), intentar confirm inmediato
    if (sipayRequestId) {
      try {
        console.log('📤 [process-payment] Flujo frictionless, confirmando:', sipayRequestId)
        const confirmResult = await sipay.confirmPayment(sipayRequestId)
        console.log('📥 [process-payment] confirm result:', JSON.stringify(confirmResult))

        const transactionId = confirmResult?.payload?.transaction_id || confirmResult?.payload?.id_transaction
        const cardToken = confirmResult?.payload?.token || confirmResult?.payload?.card_token

        // Solo activar trial si el confirm fue exitoso
        const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        await db.updateUser(user.id, {
          subscriptionStatus: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          subscriptionId: cardToken || sipayRequestId,
        })

        console.log('✅ [process-payment] Trial activado (frictionless) para:', email)

        // Enviar emails
        try {
          const userName = (user as any).name || email.split('@')[0]
          const trialEndFormatted = trialEndDate.toLocaleDateString(
            paymentLang === 'es' ? 'es-ES' : 'en-US',
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
          )
          const trialEmail = emailTemplates.trialStarted(email, userName, trialEndFormatted, paymentLang)
          await sendEmail(trialEmail)
        } catch (emailErr) {
          console.error('⚠️ [process-payment] Error enviando email:', emailErr)
        }

        return NextResponse.json({
          success: true,
          requires3DS: false,
          transactionId,
          cardToken,
          trialEndDate: trialEndDate.toISOString(),
        })
      } catch (confirmError: any) {
        console.error('❌ [process-payment] Error en confirm frictionless:', confirmError.message)
        return NextResponse.json(
          { 
            error: 'Error confirmando el pago',
            detail: confirmError.message,
            step: 'confirm-frictionless'
          },
          { status: 502 }
        )
      }
    }

    // Si no hay 3DS URL ni sipayRequestId, algo salió mal
    console.error('❌ [process-payment] No se obtuvo URL 3DS ni request_id de Sipay')
    return NextResponse.json(
      { 
        error: 'Sipay no devolvió URL de autenticación', 
        detail: 'No threeDSUrl and no sipayRequestId from all-in-one',
        sipayResponse: allinoneResult
      },
      { status: 502 }
    )

  } catch (error: any) {
    console.error('❌ [process-payment] Error general:', error.message)
    return NextResponse.json(
      { error: error.message || 'Error procesando el pago' },
      { status: 500 }
    )
  }
}
