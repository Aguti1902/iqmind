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

    const { transactionId, amount, reason, email } = await request.json()

    console.log('↩️ Procesando reembolso con Sipay:', { transactionId, amount, email })

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID requerido' },
        { status: 400 }
      )
    }

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Procesar reembolso
    const amountInCents = amount ? Math.round(amount * 100) : undefined

    const response = await sipay.refund({
      transactionId,
      amount: amountInCents,
      reason: reason || 'Reembolso solicitado por el cliente',
    })

    console.log('📡 Respuesta de Sipay (refund):', response)

    // Verificar respuesta
    if (response.code !== 0) {
      console.error('❌ Error en reembolso:', response.description)
      return NextResponse.json(
        { error: response.description || 'Error procesando el reembolso' },
        { status: 400 }
      )
    }

    console.log('✅ Reembolso procesado exitosamente')

    return NextResponse.json({
      success: true,
      refundId: response.id_refund,
      transactionId: response.id_transaction,
      amount: response.amount,
      description: response.description,
    })

  } catch (error: any) {
    console.error('❌ Error procesando reembolso:', error)
    return NextResponse.json(
      { error: error.message || 'Error procesando el reembolso' },
      { status: 500 }
    )
  }
}

