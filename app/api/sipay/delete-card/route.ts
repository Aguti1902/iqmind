import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { requireAuth, verifyCardOwnership, getAuthFromRequest } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

/**
 * Borrar token de tarjeta guardada
 * https://developer.sipay.es/docs/api/mdwr/unregister
 * 
 * SEGURIDAD:
 * - Requiere autenticación JWT
 * - Verifica que el usuario sea el propietario de la tarjeta
 */
export async function POST(request: NextRequest) {
  try {
    // SEGURIDAD: Verificar autenticación
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { email, cardToken } = await request.json()

    console.log('🗑️ Eliminando tarjeta:', { email, cardToken, requestedBy: authResult.user.email })

    if (!email || !cardToken) {
      return NextResponse.json(
        { error: 'Email y card token requeridos' },
        { status: 400 }
      )
    }
    
    // SEGURIDAD: Verificar que el usuario autenticado es el propietario
    if (authResult.user.email.toLowerCase() !== email.toLowerCase()) {
      console.error(`❌ Usuario ${authResult.user.email} intentó eliminar tarjeta de ${email}`)
      return NextResponse.json(
        { error: 'No autorizado. Solo puedes eliminar tu propia tarjeta.' },
        { status: 403 }
      )
    }
    
    // SEGURIDAD: Verificar propiedad de la tarjeta
    const isOwner = await verifyCardOwnership(email, cardToken)
    if (!isOwner) {
      console.error(`❌ Token de tarjeta no pertenece al usuario ${email}`)
      return NextResponse.json(
        { error: 'Token de tarjeta inválido o no pertenece a este usuario.' },
        { status: 403 }
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

