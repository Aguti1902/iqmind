import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'

export const dynamic = 'force-dynamic'

/**
 * Validar sesión de Apple Pay con Sipay
 * Docs: https://developer.sipay.es/docs/documentation/online/selling/wallets/apay
 * 
 * Paso 1 del flujo Apple Pay:
 * Frontend envía validationURL → Backend llama a Sipay /apay/api/v1/session
 * → Devuelve merchantSession (payload) + request_id para paso 2
 */
export async function POST(request: NextRequest) {
  try {
    const { validationURL } = await request.json()

    if (!validationURL) {
      return NextResponse.json(
        { error: 'validationURL es requerido' },
        { status: 400 }
      )
    }

    console.log('🍎 Validando sesión Apple Pay:', validationURL)

    const sipay = getSipayClient()
    const response = await sipay.validateApplePaySession({
      validationURL,
      domain: 'mindmetric.io',
      displayName: 'MindMetric',
    })

    // Sipay puede devolver request_id a nivel raíz O dentro de payload
    const requestId = response.request_id || response.payload?.request_id || ''

    console.log('✅ Sesión Apple Pay validada. request_id raíz:', response.request_id, '| request_id payload:', response.payload?.request_id, '| usado:', requestId)
    console.log('📥 Sipay session respuesta completa:', JSON.stringify({
      type: response.type,
      code: response.code,
      uuid: response.uuid,
      request_id: response.request_id,
      payload_keys: response.payload ? Object.keys(response.payload) : [],
      payload_request_id: response.payload?.request_id,
    }))

    return NextResponse.json({
      merchantSession: response.payload,
      request_id: requestId,
    })

  } catch (error: any) {
    console.error('❌ Error en validación Apple Pay:', error)
    return NextResponse.json(
      { error: error.message || 'Error en validación' },
      { status: 500 }
    )
  }
}
