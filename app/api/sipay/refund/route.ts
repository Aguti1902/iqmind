import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { verifyInternalApiKey } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

/**
 * Procesar devolución (refund) con Sipay
 * https://developer.sipay.es/docs/api/mdwr/refund
 * 
 * SEGURIDAD:
 * - ⚠️ ENDPOINT CRÍTICO - Solo accesible con API key interna
 * - Solo administradores o llamadas internas pueden hacer refunds
 * - Nunca exponer al frontend
 */
export async function POST(request: NextRequest) {
  try {
    // SEGURIDAD: Verificar API key interna (solo admin/server puede llamar)
    const isAuthorized = verifyInternalApiKey(request)
    
    if (!isAuthorized) {
      console.error('❌ Intento de acceso no autorizado a refund')
      return NextResponse.json(
        { error: 'No autorizado. Este endpoint requiere autenticación interna.' },
        { status: 401 }
      )
    }

    const { transactionId, amount, email } = await request.json()

    console.log('↩️ Procesando reembolso con Sipay:', { transactionId, amount, email })

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID requerido' },
        { status: 400 }
      )
    }

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Procesar reembolso - amount en céntimos, requerido
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount requerido para el reembolso' },
        { status: 400 }
      )
    }

    const amountInCents = Math.round(amount * 100)

    const response: any = await sipay.refund({
      transactionId,
      amount: amountInCents,
    })

    console.log('📡 Respuesta de Sipay (refund):', JSON.stringify(response))

    // Verificar respuesta MDWR 2.0
    if (response.type !== 'success') {
      console.error('❌ Error en reembolso:', response.detail, response.description)
      return NextResponse.json(
        { error: response.description || 'Error procesando el reembolso' },
        { status: 400 }
      )
    }

    console.log('✅ Reembolso procesado exitosamente')

    return NextResponse.json({
      success: true,
      transactionId: response.payload?.transaction_id,
      amount: response.payload?.amount,
      approval: response.payload?.approval,
    })

  } catch (error: any) {
    console.error('❌ Error procesando reembolso:', error)
    return NextResponse.json(
      { error: error.message || 'Error procesando el reembolso' },
      { status: 500 }
    )
  }
}

