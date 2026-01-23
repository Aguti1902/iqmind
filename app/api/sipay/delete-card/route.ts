import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

/**
 * Borrar token de tarjeta guardada
 * https://developer.sipay.es/docs/api/mdwr/unregister
 */
export async function POST(request: NextRequest) {
  try {
    const { email, cardToken } = await request.json()

    console.log('🗑️ Eliminando tarjeta:', { email, cardToken })

    if (!email || !cardToken) {
      return NextResponse.json(
        { error: 'Email y card token requeridos' },
        { status: 400 }
      )
    }

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Eliminar token en Sipay
    const response = await sipay.deleteCardToken(cardToken)

    if (response.code !== 0) {
      console.error('❌ Error eliminando tarjeta:', response.description)
      return NextResponse.json(
        { error: response.description || 'Error eliminando tarjeta' },
        { status: 400 }
      )
    }

    // Actualizar usuario en BD (eliminar token guardado)
    const user = await db.getUserByEmail(email)
    if (user) {
      await db.updateUser(user.id, {
        subscriptionId: null as any,
        subscriptionStatus: 'cancelled',
      })
    }

    console.log('✅ Tarjeta eliminada exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Tarjeta eliminada exitosamente',
    })

  } catch (error: any) {
    console.error('❌ Error eliminando tarjeta:', error)
    return NextResponse.json(
      { error: error.message || 'Error eliminando tarjeta' },
      { status: 500 }
    )
  }
}

