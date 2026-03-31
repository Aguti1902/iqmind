import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

/**
 * API para crear un pago inicial con Sipay
 * Incluye tokenización para futuros pagos recurrentes
 * 
 * SEGURIDAD:
 * - Rate limiting: 5 peticiones por minuto por IP
 * - Validación de email y monto
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`create-payment:${clientIP}`, 5, 60000) // 5 req/min
    
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit excedido para IP: ${clientIP}`)
      return rateLimitResponse(rateLimit.resetIn)
    }

    const { email, userName, amount, userIQ, lang, testData } = await request.json()

    console.log('💳 Iniciando pago con Sipay:', { email, amount, lang })

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email y monto requeridos' },
        { status: 400 }
      )
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Generar ID único para la orden
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Crear o actualizar usuario en la base de datos
    let user = await db.getUserByEmail(email)
    
    if (!user) {
      console.log('📝 Creando nuevo usuario en BD')
      const hashedPassword = `temp_${Math.random().toString(36).substr(2, 9)}`
      
      user = await db.createUser({
        email,
        password: hashedPassword,
        userName: userName || 'Usuario',
        iq: Math.round(userIQ || 0),
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
          iq: Math.round(userIQ || 0),
          correctAnswers: testData.correctAnswers || 0,
          timeElapsed: testData.timeElapsed || 0,
          answers: testData.answers || [],
          categoryScores: testData.categoryScores || {},
          completedAt: testData.completedAt || new Date().toISOString(),
        })
        console.log('✅ Datos del test guardados')
      } catch (error) {
        console.error('⚠️ Error guardando datos del test:', error)
      }
    }

    // URLs de retorno
    const origin = request.headers.get('origin') || 'https://mindmetric.io'
    const returnUrl = `${origin}/${lang}/resultado?order_id=${orderId}`
    const cancelUrl = `${origin}/${lang}/checkout?canceled=true`

    console.log('🔗 URLs configuradas:', { returnUrl, cancelUrl })

    // TODO: Integrar con Sipay para obtener URL de pago o token
    // Documentación: https://developer.sipay.es/docs/documentation/online/selling/only_card
    
    // Por ahora, devolvemos una URL de ejemplo
    // En producción, aquí se llamaría a la API de Sipay para crear la sesión de pago
    const paymentUrl = `${process.env.NEXT_PUBLIC_SIPAY_ENDPOINT || 'https://sandbox.sipay.es'}/payment/${orderId}`
    
    return NextResponse.json({
      success: true,
      orderId,
      amount,
      currency: 'EUR',
      returnUrl,
      cancelUrl,
      userId: user.id,
      paymentUrl, // URL a la que redirigir al usuario para completar el pago
      // Configuración para el frontend de Sipay
      sipayConfig: {
        key: process.env.NEXT_PUBLIC_SIPAY_KEY,
        resource: process.env.NEXT_PUBLIC_SIPAY_RESOURCE,
        endpoint: process.env.NEXT_PUBLIC_SIPAY_ENDPOINT || 'https://sandbox.sipay.es',
      }
    })

  } catch (error: any) {
    console.error('❌ Error en create-payment:', error)
    return NextResponse.json(
      { error: error.message || 'Error creando el pago' },
      { status: 500 }
    )
  }
}

