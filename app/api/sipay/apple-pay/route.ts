import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

/**
 * Procesar pago con Apple Pay
 * https://developer.sipay.es/docs/documentation/online/selling/wallets/apay
 */
export async function POST(request: NextRequest) {
  try {
    const {
      applePayToken,
      email,
      userName,
      amount,
      userIQ,
      lang,
      testData
    } = await request.json()

    console.log('🍎 Procesando pago con Apple Pay:', { email, amount })

    if (!applePayToken || !email || !amount) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Crear o actualizar usuario
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

    // Guardar datos del test si existen
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

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Generar ID de orden
    const orderId = `applepay_${Date.now()}_${user.id.substr(-6)}`

    // Procesar pago con Apple Pay
    const amountInCents = Math.round(amount * 100)

    const response = await sipay.authorizeApplePay({
      amount: amountInCents,
      currency: 'EUR',
      orderId,
      description: `MindMetric - Test de CI - ${email}`,
      applePayToken,
      customerEmail: email,
    })

    console.log('📡 Respuesta de Sipay (Apple Pay):', response)

    // Verificar respuesta
    if (response.code !== 0) {
      console.error('❌ Error en Apple Pay:', response.description)
      return NextResponse.json(
        { error: response.description || 'Error procesando Apple Pay' },
        { status: 400 }
      )
    }

    // Activar trial
    const trialEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    await db.updateUser(user.id, {
      subscriptionStatus: 'trial',
      trialEndDate: trialEnd.toISOString(),
    })

    console.log('✅ Pago con Apple Pay procesado exitosamente')

    return NextResponse.json({
      success: true,
      transactionId: response.id_transaction,
      orderId: response.id_order,
      amount: response.amount,
      status: response.transaction_status,
    })

  } catch (error: any) {
    console.error('❌ Error en Apple Pay:', error)
    return NextResponse.json(
      { error: error.message || 'Error procesando Apple Pay' },
      { status: 500 }
    )
  }
}

