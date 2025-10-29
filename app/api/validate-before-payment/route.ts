import { NextRequest, NextResponse } from 'next/server'
import { validateBeforePayment, getRealIP, logFraudAttempt } from '@/lib/fraud-detection'
export const dynamic = 'force-dynamic'

/**
 * API endpoint para validar datos antes de permitir el pago
 * CRÍTICO para prevenir fraude y disputas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, testData } = body

    console.log('🔍 Validando datos antes del pago...')

    if (!email || !testData) {
      return NextResponse.json(
        { error: 'Datos incompletos', valid: false },
        { status: 400 }
      )
    }

    // Obtener IP real
    const ip = getRealIP(request)
    console.log('📍 IP detectada:', ip)

    // Validar con sistema anti-fraude
    const validation = await validateBeforePayment(email, testData, ip)

    if (validation.shouldBlock) {
      console.log('❌ Pago bloqueado por sistema anti-fraude')
      
      // Log intento fraudulento
      await logFraudAttempt(email, ip, validation.reasons, validation.risk)

      return NextResponse.json({
        valid: false,
        error: 'No se puede procesar el pago en este momento',
        risk: validation.risk,
        reasons: validation.reasons
      }, { status: 403 })
    }

    console.log('✅ Validación exitosa, permitir pago')

    return NextResponse.json({
      valid: true,
      risk: validation.risk,
      reasons: validation.reasons
    })

  } catch (error: any) {
    console.error('❌ Error en validación:', error)
    
    // En caso de error, permitir el pago (fail-open)
    // pero registrar el error
    return NextResponse.json({
      valid: true,
      error: 'Error en validación, permitiendo pago',
      fallback: true
    })
  }
}

