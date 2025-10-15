import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
// Endpoint para manejar eventos de webhook de Paddle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar la firma del webhook de Paddle
    // (En producción, deberías verificar la autenticidad del webhook)

    const eventType = body.event_type

    switch (eventType) {
      case 'subscription.created':
        console.log('Nueva suscripción creada:', body.data)
        // Aquí actualizarías el estado del usuario en tu base de datos
        break

      case 'subscription.canceled':
        console.log('Suscripción cancelada:', body.data)
        // Actualizar estado de suscripción
        break

      case 'transaction.completed':
        console.log('Transacción completada:', body.data)
        // Dar acceso al usuario
        break

      default:
        console.log('Evento no manejado:', eventType)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}

