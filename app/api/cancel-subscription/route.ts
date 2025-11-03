import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database-postgres'
import { getFastSpringConfig } from '@/lib/fastspring-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Se requiere el email' },
        { status: 400 }
      )
    }

    console.log('🔍 [cancel-subscription] Buscando usuario:', email)

    // Buscar el usuario en la base de datos
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No se encontró ninguna suscripción para este email' },
        { status: 404 }
      )
    }

    // Verificar que tiene una suscripción activa
    if (!user.subscriptionId || user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'No tienes ninguna suscripción activa' },
        { status: 404 }
      )
    }

    console.log('📞 [cancel-subscription] Cancelando en FastSpring:', user.subscriptionId)

    // Obtener configuración de FastSpring
    const config = await getFastSpringConfig()
    
    // Cancelar la suscripción en FastSpring
    const response = await fetch(
      `https://api.fastspring.com/subscriptions/${user.subscriptionId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.apiUsername}:${config.apiPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error de FastSpring:', errorText)
      return NextResponse.json(
        { error: 'Error al cancelar la suscripción en FastSpring' },
        { status: 500 }
      )
    }

    // Actualizar el estado en nuestra base de datos
    await db.updateUser(email, {
      subscriptionStatus: 'cancelled',
      updatedAt: new Date()
    })

    console.log('✅ Suscripción cancelada:', {
      email,
      subscriptionId: user.subscriptionId,
      cancelledAt: new Date().toISOString()
    })

    // Calcular fecha de finalización (fin del período actual)
    const endDate = user.accessUntil 
      ? new Date(user.accessUntil).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Inmediatamente'

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      endDate
    })

  } catch (error: any) {
    console.error('❌ Error cancelando suscripción:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    )
  }
}