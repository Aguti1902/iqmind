import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
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

    console.log('💳 Paso 1: Iniciando pago Sipay:', { orderId, requestId, email })

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
    const origin = request.headers.get('origin') || 'https://mindmetric.io'
    const paymentLang = lang || 'es'

    // URL de confirmación: cuando 3DS termine, Sipay redirigirá aquí
    // Incluimos datos necesarios en la URL para el confirm
    const confirmUrl = `${origin}/api/sipay/confirm-payment?order_id=${orderId}&email=${encodeURIComponent(email)}&lang=${paymentLang}&test_type=${testType}`
    const errorUrl = `${origin}/${paymentLang}/checkout-payment?error=true`

    // Llamar a /all-in-one con el request_id de FastPay
    const allinoneResult = await sipay.authorizeWithFastPay({
      amount: Math.round((amount || 0.50) * 100),
      currency: 'EUR',
      orderId: orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
      requestId: requestId,
      customerEmail: email,
      urlOk: confirmUrl,
      urlKo: errorUrl,
    })

    console.log('📥 all-in-one result:', JSON.stringify(allinoneResult))

    // Sipay devuelve una URL 3DS para autenticación
    const threeDSUrl = allinoneResult?.payload?.url
    const sipayRequestId = allinoneResult?.request_id || allinoneResult?.payload?.request_id

    if (threeDSUrl) {
      // Devolver la URL 3DS al frontend para redirección
      console.log('🔗 URL 3DS:', threeDSUrl)
      return NextResponse.json({
        success: true,
        requires3DS: true,
        threeDSUrl: threeDSUrl,
        sipayRequestId: sipayRequestId,
      })
    }

    // Si no requiere 3DS (frictionless), la operación se completa directamente
    // Intentar confirm inmediato
    if (sipayRequestId) {
      try {
        const confirmResult = await sipay.confirmPayment(sipayRequestId)
        console.log('📥 confirm result:', JSON.stringify(confirmResult))

        const transactionId = confirmResult?.payload?.transaction_id
        const cardToken = confirmResult?.payload?.token

        // Activar trial
        const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        await db.updateUser(user.id, {
          subscriptionStatus: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          subscriptionId: cardToken || requestId,
        })

        return NextResponse.json({
          success: true,
          requires3DS: false,
          transactionId,
          cardToken,
          trialEndDate: trialEndDate.toISOString(),
        })
      } catch (confirmError: any) {
        console.error('⚠️ Error en confirm:', confirmError.message)
      }
    }

    // Fallback: activar trial de todas formas
    const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    await db.updateUser(user.id, {
      subscriptionStatus: 'trial',
      trialEndDate: trialEndDate.toISOString(),
      subscriptionId: requestId,
    })

    return NextResponse.json({
      success: true,
      requires3DS: false,
      transactionId: requestId,
      trialEndDate: trialEndDate.toISOString(),
    })

  } catch (error: any) {
    console.error('❌ Error procesando pago:', error.message)
    return NextResponse.json(
      { error: error.message || 'Error procesando el pago' },
      { status: 500 }
    )
  }
}
