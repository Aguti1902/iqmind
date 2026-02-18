import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

/**
 * Procesar pago con Google Pay
 * Docs: https://developer.sipay.es/docs/documentation/online/selling/wallets/gpay
 * 
 * Recibe el token string de Google Pay (paymentMethodData.tokenizationData.token)
 * Envía a Sipay POST /mdwr/v1/authorization con formato catcher type=gpay.
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`google-pay:${clientIP}`, 3, 60000)

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetIn)
    }

    const {
      googlePayToken,
      email,
      userName,
      amount,
      userIQ,
      lang,
      testData
    } = await request.json()

    console.log('🔍 Procesando Google Pay:', { email, amount })

    if (!googlePayToken || !email || !amount) {
      return NextResponse.json(
        { error: 'Datos incompletos: googlePayToken, email y amount son requeridos' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    let user = await db.getUserByEmail(email)

    if (!user) {
      const hashedPassword = `temp_${Math.random().toString(36).substr(2, 9)}`
      user = await db.createUser({
        email,
        password: hashedPassword,
        userName: userName || 'Usuario',
        iq: userIQ || 0,
        subscriptionStatus: 'trial',
      })
    }

    if (testData && testData.answers && user) {
      try {
        const testResultId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await db.createTestResult({
          id: testResultId,
          userId: user.id,
          iq: userIQ || 0,
          correctAnswers: testData.correctAnswers || 0,
          timeElapsed: testData.timeElapsed || 0,
          answers: testData.answers || [],
          categoryScores: testData.categoryScores || {},
          completedAt: testData.completedAt || new Date().toISOString(),
        })
      } catch (error) {
        console.error('⚠️ Error guardando datos del test:', error)
      }
    }

    const sipay = getSipayClient()
    const amountInCents = Math.round(amount * 100)
    const tokenId = 'mndmtrc_' + Date.now().toString().slice(-10)

    const response = await sipay.authorizeGooglePay({
      amount: amountInCents,
      currency: 'EUR',
      googlePayToken,
      tokenId,
    })

    console.log('📡 Respuesta Sipay Google Pay:', JSON.stringify(response).slice(0, 300))

    const payloadCode = response.payload?.code
    if (payloadCode !== '0' && payloadCode !== 0) {
      console.error('❌ Google Pay pago denegado:', response.payload)
      return NextResponse.json(
        { error: response.payload?.description || response.description || 'Pago denegado' },
        { status: 400 }
      )
    }

    const trialEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    await db.updateUser(user.id, {
      subscriptionStatus: 'trial',
      subscriptionId: tokenId,
      trialEndDate: trialEnd.toISOString(),
      accessUntil: trialEnd.toISOString(),
    })

    try {
      const uName = userName || email.split('@')[0]
      const trialEmail = emailTemplates.trialStarted(email, uName, trialEnd.toLocaleDateString('es-ES'), lang || 'es')
      await sendEmail(trialEmail)
      const payEmail = emailTemplates.paymentSuccess(email, uName, amount, lang || 'es')
      await sendEmail(payEmail)
    } catch (e: any) {
      console.error('⚠️ Error enviando emails:', e.message)
    }

    console.log('✅ Google Pay completado. Token guardado:', tokenId.slice(0, 12) + '...')

    return NextResponse.json({
      success: true,
      transactionId: response.payload?.transaction_id,
      orderId: response.payload?.order,
      amount: response.payload?.amount,
    })

  } catch (error: any) {
    console.error('❌ Error en Google Pay:', error)
    return NextResponse.json(
      { error: error.message || 'Error procesando Google Pay' },
      { status: 500 }
    )
  }
}
