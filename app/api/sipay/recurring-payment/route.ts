import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

/**
 * Procesar pago recurrente con Sipay usando token guardado
 * MIT (Merchant Initiated Transaction) - Sin presencia del cliente
 */
export async function POST(request: NextRequest) {
  try {
    const { email, amount, description } = await request.json()

    console.log('🔄 Procesando pago recurrente con Sipay:', { email, amount })

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email y monto requeridos' },
        { status: 400 }
      )
    }

    // Obtener usuario y su token de tarjeta
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const cardToken = user.subscriptionId // El token está guardado aquí
    if (!cardToken) {
      return NextResponse.json(
        { error: 'No hay tarjeta guardada para este usuario' },
        { status: 400 }
      )
    }

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Generar ID único para la orden
    const orderId = `recurring_${Date.now()}_${user.id.substr(-6)}`

    // Procesar pago recurrente (MIT)
    const amountInCents = Math.round(amount * 100)

    const response = await sipay.authorizeRecurring({
      amount: amountInCents,
      currency: 'EUR',
      orderId,
      description: description || `Suscripción MindMetric Premium - ${email}`,
      cardToken,
      customerEmail: email,
    })

    console.log('📡 Respuesta de Sipay (recurrente):', response)

    // Verificar respuesta
    if (response.code !== 0) {
      console.error('❌ Error en pago recurrente:', response.description)
      
      // Si el pago falla, marcar suscripción como vencida
      await db.updateUser(user.id, {
        subscriptionStatus: 'expired',
      })

      return NextResponse.json(
        { error: response.description || 'Error procesando el pago recurrente' },
        { status: 400 }
      )
    }

    // Actualizar suscripción del usuario
    const nextBillingDate = new Date()
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

    await db.updateUser(user.id, {
      subscriptionStatus: 'active',
      accessUntil: nextBillingDate.toISOString(),
    })

    console.log('✅ Pago recurrente procesado exitosamente')

    return NextResponse.json({
      success: true,
      transactionId: response.id_transaction,
      orderId: response.id_order,
      amount: response.amount,
      status: response.transaction_status,
      nextBillingDate: nextBillingDate.toISOString(),
    })

  } catch (error: any) {
    console.error('❌ Error en pago recurrente:', error)
    return NextResponse.json(
      { error: error.message || 'Error en pago recurrente' },
      { status: 500 }
    )
  }
}

