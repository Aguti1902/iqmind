import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { verifyInternalApiKey } from '@/lib/api-security'

export const dynamic = 'force-dynamic'

/**
 * Procesar pago recurrente con Sipay usando token guardado
 * MIT (Merchant Initiated Transaction) - Sin presencia del cliente
 * 
 * SEGURIDAD:
 * - ⚠️ ENDPOINT CRÍTICO - Solo accesible con API key interna
 * - Solo el cron job o llamadas internas pueden usar este endpoint
 * - Nunca exponer al frontend
 */
export async function POST(request: NextRequest) {
  try {
    // SEGURIDAD: Verificar API key interna (solo cron/server puede llamar)
    const isAuthorized = verifyInternalApiKey(request)
    
    if (!isAuthorized) {
      console.error('❌ Intento de acceso no autorizado a recurring-payment')
      return NextResponse.json(
        { error: 'No autorizado. Este endpoint requiere autenticación interna.' },
        { status: 401 }
      )
    }

    const { email, amount, description } = await request.json()

    console.log('🔄 Procesando pago recurrente con Sipay:', { email, amount })

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email y monto requeridos' },
        { status: 400 }
      )
    }
    
    // Validar que el monto sea el esperado (9.99€)
    if (amount !== 9.99) {
      console.warn(`⚠️ Monto inesperado en pago recurrente: ${amount}`)
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

    // Generar ID único para la orden (solo numérico para Sipay)
    const orderId = Date.now().toString().slice(-10)

    // Procesar pago recurrente (MIT) - amount en céntimos
    const amountInCents = Math.round(amount * 100)

    const response: any = await sipay.authorizeRecurring({
      amount: amountInCents,
      currency: 'EUR',
      orderId,
      cardToken,
      mitReason: 'R', // R = Recurrente
    })

    console.log('📡 Respuesta de Sipay (recurrente):', JSON.stringify(response))

    // Verificar respuesta MDWR 2.0
    if (response.type !== 'success') {
      console.error('❌ Error en pago recurrente:', response.detail, response.description)
      
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

    const transactionId = response.payload?.transaction_id
    console.log('✅ Pago recurrente procesado. Transaction:', transactionId)

    return NextResponse.json({
      success: true,
      transactionId: transactionId,
      orderId: response.payload?.order,
      amount: response.payload?.amount,
      approval: response.payload?.approval,
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

