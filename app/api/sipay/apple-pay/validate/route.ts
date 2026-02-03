import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Validar sesión de Apple Pay con Sipay
 * https://developer.sipay.es/docs/documentation/online/selling/wallets/apay
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

    console.log('🍎 Validando merchant Apple Pay:', validationURL)

    // Sipay maneja la validación del comerciante
    // En producción, esto debería llamar a la API de Sipay
    const sipayEndpoint = process.env.SIPAY_ENDPOINT || 'https://sandbox.sipay.es'
    
    const response = await fetch(`${sipayEndpoint}/mdwr/v1/applepay/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SIPAY_API_KEY}`,
      },
      body: JSON.stringify({
        validationURL,
        displayName: 'MindMetric',
        domainName: 'mindmetric.io',
      }),
    })

    if (!response.ok) {
      console.error('❌ Error validando Apple Pay merchant')
      return NextResponse.json(
        { error: 'Error validando merchant' },
        { status: 400 }
      )
    }

    const merchantSession = await response.json()
    console.log('✅ Sesión Apple Pay validada')

    return NextResponse.json(merchantSession)

  } catch (error: any) {
    console.error('❌ Error en validación Apple Pay:', error)
    return NextResponse.json(
      { error: error.message || 'Error en validación' },
      { status: 500 }
    )
  }
}
