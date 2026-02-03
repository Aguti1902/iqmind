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

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Determinar qué token usar (requestId de FastPay o cardToken directo)
    const tokenToUse = requestId || cardToken

    // Si viene de la página HTML estática, necesitamos obtener los datos del orderId
    let userEmail = email
    let paymentAmount = amount
    let paymentLang = lang || 'es'

    if (requestId && !email) {
      // Buscar en la BD el pedido para obtener el email
      // Por ahora, vamos a necesitar que el frontend pase estos datos
      console.log('⚠️ Falta email, buscando en BD por orderId...')
      // TODO: Implementar búsqueda de orden en BD si es necesario
    }

    // Obtener usuario
    const user = await db.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // URLs de retorno
    const origin = request.headers.get('origin') || 'https://mindmetric.io'
    const returnUrl = `${origin}/${paymentLang}/resultado?order_id=${orderId}`
    const cancelUrl = `${origin}/${paymentLang}/checkout?canceled=true`

    // Procesar pago con Sipay
    const amountInCents = paymentAmount ? Math.round(paymentAmount * 100) : 50 // 0.50€ por defecto

    // Si es requestId de FastPay, usar authorizeWithFastPay
    const response = requestId 
      ? await sipay.authorizeWithFastPay({
          amount: amountInCents,
          currency: 'EUR',
          orderId,
          requestId: requestId,
          customerEmail: userEmail,
        })
      : await sipay.authorizeWithTokenization({
          amount: amountInCents,
          currency: 'EUR',
          orderId,
          description: description || `Pago MindMetric - ${userEmail}`,
          cardToken: cardToken,
          customerEmail: userEmail,
          returnUrl,
          cancelUrl,
        })

    console.log('📡 Respuesta de Sipay:', response)

    // Verificar respuesta
    if (response.code !== 0) {
      console.error('❌ Error en Sipay:', response.description)
      return NextResponse.json(
        { error: response.description || 'Error procesando el pago' },
        { status: 400 }
      )
    }

    // Guardar token de la tarjeta en la BD para futuros pagos
    if (response.card_token) {
      await db.updateUser(user.id, {
        subscriptionId: response.card_token, // Usamos este campo para guardar el token
      })
      console.log('✅ Token de tarjeta guardado')
    }

    // Calcular fecha de fin del trial (2 días)
    const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    
    // Actualizar estado del usuario
    await db.updateUser(user.id, {
      subscriptionStatus: 'trial',
      trialEndDate: trialEndDate.toISOString(),
    })

    console.log('✅ Pago procesado exitosamente')

    // Obtener el IQ del usuario (si existe)
    const testResults = await db.getTestResultsByUserId(user.id)
    const latestResult = testResults && testResults.length > 0 ? testResults[0] : null
    const userIQ = latestResult?.iq || 100

    // Enviar emails
    const userName = user.name || userEmail.split('@')[0]
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
      console.log(`📧 Email de test ${testType} enviado`)
    } catch (e) {
      console.error('⚠️ Error enviando email de test:', e)
    }

    // 2. Email de trial iniciado
    try {
      const trialEmail = emailTemplates.trialStarted(userEmail, userName, trialEndFormatted, paymentLang)
      await sendEmail(trialEmail)
      console.log('📧 Email de trial enviado')
    } catch (e) {
      console.error('⚠️ Error enviando email de trial:', e)
    }

    return NextResponse.json({
      success: true,
      transactionId: response.id_transaction,
      orderId: response.id_order,
      cardToken: response.card_token,
      cardMask: response.card_mask,
      cardBrand: response.card_brand,
      authorizationCode: response.authorization_code,
      amount: response.amount,
      status: response.transaction_status,
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

