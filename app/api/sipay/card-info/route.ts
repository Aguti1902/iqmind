import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { requireAuth } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

/**
 * Consultar información de un token de tarjeta
 * https://developer.sipay.es/docs/api/mdwr/card
 * 
 * SEGURIDAD:
 * - Requiere autenticación JWT
 * - Solo devuelve info de la tarjeta del usuario autenticado
 */
export async function POST(request: NextRequest) {
  try {
    // SEGURIDAD: Verificar autenticación
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { cardToken } = await request.json()

    if (!cardToken) {
      return NextResponse.json(
        { error: 'Card token requerido' },
        { status: 400 }
      )
    }
    
    // SEGURIDAD: Verificar que el token pertenece al usuario autenticado
    const user = await db.getUserByEmail(authResult.user.email)
    if (!user || user.subscriptionId !== cardToken) {
      console.error(`❌ Usuario ${authResult.user.email} intentó acceder a token ajeno`)
      return NextResponse.json(
        { error: 'No autorizado. Este token no te pertenece.' },
        { status: 403 }
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

