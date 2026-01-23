import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

/**
 * Procesar pago con Sipay después de obtener el token de la tarjeta
 * Autorización + Tokenización para suscripciones futuras
 */
export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      cardToken,
      email,
      amount,
      description,
      lang
    } = await request.json()

    console.log('💳 Procesando pago con Sipay:', { orderId, email, amount })

    if (!orderId || !cardToken || !email || !amount) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Obtener cliente de Sipay
    const sipay = getSipayClient()

    // Obtener usuario
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // URLs de retorno
    const origin = request.headers.get('origin') || 'https://mindmetric.io'
    const returnUrl = `${origin}/${lang}/resultado?order_id=${orderId}`
    const cancelUrl = `${origin}/${lang}/checkout?canceled=true`

    // Procesar pago con Sipay (autorización + tokenización)
    const amountInCents = Math.round(amount * 100) // Convertir a centavos

    const response = await sipay.authorizeWithTokenization({
      amount: amountInCents,
      currency: 'EUR',
      orderId,
      description: description || `Pago MindMetric - Test de CI - ${email}`,
      cardToken,
      customerEmail: email,
      returnUrl,
      cancelUrl,
    })

    console.log('📡 Respuesta de Sipay:', response)

    // Verificar respuesta
    if (response.code !== 0) {
      console.error('❌ Error en Sipay:', response.description)
      return NextResponse.json(
        { error: response.description || 'Error procesando el pago' },
        { status: 400 }
      )
    }

    // Guardar token de la tarjeta en la BD para futuros pagos
    if (response.card_token) {
      await db.updateUser(user.id, {
        subscriptionId: response.card_token, // Usamos este campo para guardar el token
      })
      console.log('✅ Token de tarjeta guardado')
    }

    // Actualizar estado del usuario
    await db.updateUser(user.id, {
      subscriptionStatus: 'trial',
      trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días
    })

    console.log('✅ Pago procesado exitosamente')

    return NextResponse.json({
      success: true,
      transactionId: response.id_transaction,
      orderId: response.id_order,
      cardToken: response.card_token,
      cardMask: response.card_mask,
      cardBrand: response.card_brand,
      authorizationCode: response.authorization_code,
      amount: response.amount,
      status: response.transaction_status,
    })

  } catch (error: any) {
    console.error('❌ Error procesando pago:', error)
    return NextResponse.json(
      { error: error.message || 'Error procesando el pago' },
      { status: 500 }
    )
  }
}

