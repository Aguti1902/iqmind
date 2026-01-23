import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'

export const dynamic = 'force-dynamic'

/**
 * Consultar información de un token de tarjeta
 * https://developer.sipay.es/docs/api/mdwr/card
 */
export async function POST(request: NextRequest) {
  try {
    const { cardToken } = await request.json()

    if (!cardToken) {
      return NextResponse.json(
        { error: 'Card token requerido' },
        { status: 400 }
      )
    }

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Consultar información de la tarjeta
    const response = await sipay.getCardInfo(cardToken)

    if (response.code !== 0) {
      return NextResponse.json(
        { error: response.description || 'Error consultando tarjeta' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      cardToken: response.card_token,
      cardMask: response.card_mask,
      cardBrand: response.card_brand,
      expiryDate: response.expiry_date,
    })

  } catch (error: any) {
    console.error('❌ Error consultando tarjeta:', error)
    return NextResponse.json(
      { error: error.message || 'Error consultando tarjeta' },
      { status: 500 }
    )
  }
}

