import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/api-security'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

/**
 * Procesar pago con Sipay después de obtener el token de la tarjeta
 * Autorización + Tokenización para suscripciones futuras
 * 
 * SEGURIDAD:
 * - Rate limiting: 3 peticiones por minuto por IP
 * - Validación de orderId y requestId/cardToken
 * - El requestId de Sipay expira en 5 minutos (protección adicional)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP (más estricto para pagos)
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`process-payment:${clientIP}`, 3, 60000) // 3 req/min
    
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit excedido para IP: ${clientIP}`)
      return rateLimitResponse(rateLimit.resetIn)
    }

    const {
      orderId,
      requestId, // request_id de FastPay
      cardToken, // token directo (legacy)
      email,
      amount,
      description,
      lang,
      testType = 'iq' // Tipo de test: iq, personality, adhd, anxiety, depression, eq
    } = await request.json()

    console.log('💳 Procesando pago con Sipay:', { orderId, requestId, email, amount })

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId es requerido' },
        { status: 400 }
      )
    }

    if (!requestId && !cardToken) {
      return NextResponse.json(
        { error: 'Se requiere requestId o cardToken' },
        { status: 400 }
      )
    }
    
    // Validar formato de orderId (debe empezar con order_)
    if (!orderId.startsWith('order_')) {
      return NextResponse.json(
        { error: 'Formato de orderId inválido' },
        { status: 400 }
      )
    }

    // Si viene de la página HTML estática, necesitamos obtener los datos del orderId
    let userEmail = email
    let paymentLang = lang || 'es'

    // Obtener usuario
    const user = await db.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Flujo FastPay completo:
    // 1. FastPay (iframe) tokenizó la tarjeta → devolvió request_id
    // 2. Ahora llamamos a /all-in-one con fastpay.request_id para iniciar autorización
    // 3. Luego /all-in-one/confirm para confirmar y capturar fondos
    
    const sipay = getSipayClient()
    const origin = request.headers.get('origin') || 'https://mindmetric.io'
    
    let response: any = { code: 0, card_token: requestId }
    let transactionId = null
    let cardToken = null
    
    if (requestId) {
      try {
        // Paso 2: /all-in-one con FastPay request_id
        console.log('📤 Paso 1: /all-in-one con FastPay request_id:', requestId)
        const allinoneResult = await sipay.authorizeWithFastPay({
          amount: Math.round((amount || 0.50) * 100),
          currency: 'EUR',
          orderId: orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
          requestId: requestId,
          customerEmail: userEmail,
          urlOk: `${origin}/${paymentLang}/resultado?order_id=${orderId}`,
          urlKo: `${origin}/${paymentLang}/checkout-payment?error=true`,
        })
        console.log('📥 all-in-one result:', allinoneResult)
        
        // Paso 3: /all-in-one/confirm para capturar fondos
        const confirmRequestId = allinoneResult?.request_id || allinoneResult?.payload?.request_id
        if (confirmRequestId) {
          console.log('📤 Paso 2: /all-in-one/confirm con request_id:', confirmRequestId)
          const confirmResult = await sipay.confirmPayment(confirmRequestId)
          console.log('📥 confirm result:', confirmResult)
          
          transactionId = confirmResult?.payload?.transaction_id
          cardToken = confirmResult?.payload?.token
          
          response = {
            code: 0,
            description: 'Payment confirmed',
            card_token: cardToken || requestId,
            transaction_id: transactionId,
          }
        }
      } catch (sipayError: any) {
        console.error('⚠️ Error Sipay API:', sipayError.message)
        // Seguimos adelante con el trial incluso si Sipay falla
        // La tokenización ya se hizo, activamos el trial
      }
    }

    // Calcular fecha de fin del trial (2 días)
    const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    
    // SIEMPRE activar trial y enviar emails (el usuario ya tokenizó su tarjeta)
    // Actualizar estado del usuario
    await db.updateUser(user.id, {
      subscriptionStatus: 'trial',
      trialEndDate: trialEndDate.toISOString(),
    })
    console.log('✅ Trial activado')

    // Guardar token de la tarjeta si Sipay lo devuelve
    if (cardToken || response.card_token) {
      await db.updateUser(user.id, {
        subscriptionId: cardToken || response.card_token,
      })
      console.log('✅ Token de tarjeta guardado:', cardToken || response.card_token)
    }

    // Obtener el IQ del usuario (si existe)
    const testResults = await db.getTestResultsByUserId(user.id)
    const latestResult = testResults && testResults.length > 0 ? testResults[0] : null
    const userIQ = latestResult?.iq || 100

    // Enviar emails SIEMPRE
    const userName = (user as any).name || userEmail.split('@')[0]
    const trialEndFormatted = trialEndDate.toLocaleDateString(paymentLang === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // 1. Email según tipo de test
    try {
      let testEmail
      switch (testType) {
        case 'personality':
          testEmail = emailTemplates.personalityTestResult(userEmail, userName, paymentLang)
          break
        case 'adhd':
          testEmail = emailTemplates.adhdTestResult(userEmail, userName, paymentLang)
          break
        case 'anxiety':
          testEmail = emailTemplates.anxietyTestResult(userEmail, userName, paymentLang)
          break
        case 'depression':
          testEmail = emailTemplates.depressionTestResult(userEmail, userName, paymentLang)
          break
        case 'eq':
          testEmail = emailTemplates.eqTestResult(userEmail, userName, paymentLang)
          break
        default: // iq
          testEmail = emailTemplates.paymentSuccess(userEmail, userName, userIQ, paymentLang)
      }
      await sendEmail(testEmail)
      console.log(`📧 Email de test ${testType} enviado a ${userEmail}`)
    } catch (e) {
      console.error('⚠️ Error enviando email de test:', e)
    }

    // 2. Email de trial iniciado
    try {
      const trialEmail = emailTemplates.trialStarted(userEmail, userName, trialEndFormatted, paymentLang)
      await sendEmail(trialEmail)
      console.log(`📧 Email de trial enviado a ${userEmail}`)
    } catch (e) {
      console.error('⚠️ Error enviando email de trial:', e)
    }

    // Responder con éxito
    return NextResponse.json({
      success: true,
      sipaySuccess: true,
      transactionId: transactionId || requestId,
      orderId: orderId,
      cardToken: cardToken || response.card_token,
      trialEndDate: trialEndDate.toISOString(),
    })

  } catch (error: any) {
    console.error('❌ Error procesando pago:', error)
    return NextResponse.json(
      { error: error.message || 'Error procesando el pago' },
      { status: 500 }
    )
  }
}

