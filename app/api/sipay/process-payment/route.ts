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

    // Generar el tokenId ANTES de llamar a Sipay para poder incluirlo en la URL de confirmación
    const cardTokenId = 'mm' + Date.now().toString().slice(-12)

    // URL de confirmación: incluimos el tokenId para que confirm-payment pueda guardarlo
    const confirmUrl = `${origin}/api/sipay/confirm-payment?order_id=${orderId}&email=${encodeURIComponent(email)}&lang=${paymentLang}&test_type=${testType}&card_token_id=${cardTokenId}`
    const errorUrl = `${origin}/${paymentLang}/checkout-payment?error=true&email=${encodeURIComponent(email)}`

    console.log('💳 [process-payment] url_ok:', confirmUrl)
    console.log('💳 [process-payment] url_ko:', errorUrl)
    console.log('💳 [process-payment] cardTokenId que se registrará:', cardTokenId)

    // Llamar a /all-in-one con el request_id de FastPay
    let allinoneResult: any
    try {
      allinoneResult = await sipay.authorizeWithFastPay({
        amount: Math.round((amount || 0.90) * 100),
        currency: 'EUR',
        orderId: orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
        requestId: requestId,
        customerEmail: email,
        urlOk: confirmUrl,
        urlKo: errorUrl,
        tokenId: cardTokenId,  // Pasamos el tokenId para que Sipay registre la tarjeta con este ID
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
        // Preferimos el tokenId que nosotros enviamos (cardTokenId), luego lo que Sipay devuelva
        const cardToken = cardTokenId || confirmResult?.payload?.token || confirmResult?.payload?.card_token
        console.log('💳 [process-payment] cardToken guardado (frictionless):', cardToken)

        // Solo activar trial si el confirm fue exitoso
        const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        await db.updateUser(user.id, {
          subscriptionStatus: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          accessUntil: trialEndDate.toISOString(),
          subscriptionId: cardToken,
        })

        console.log('✅ [process-payment] Trial activado (frictionless) para:', email)

        // Enviar emails
        const userName = user.userName || email.split('@')[0]
        const trialEndFormatted = trialEndDate.toLocaleDateString(
          paymentLang === 'es' ? 'es-ES' : 'en-US',
          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        )

        try {
          const payEmail = emailTemplates.paymentSuccess(email, userName, amount || 0.90, paymentLang)
          await sendEmail(payEmail)
          console.log('📧 [process-payment] Email paymentSuccess enviado')
        } catch (emailErr) {
          console.error('⚠️ [process-payment] Error enviando email paymentSuccess:', emailErr)
        }

        try {
          const trialEmail = emailTemplates.trialStarted(email, userName, trialEndFormatted, paymentLang, user.iq)
          await sendEmail(trialEmail)
          console.log('📧 [process-payment] Email trialStarted enviado')
        } catch (emailErr) {
          console.error('⚠️ [process-payment] Error enviando email trialStarted:', emailErr)
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
