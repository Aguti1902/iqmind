import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

// Función para verificar la firma del webhook
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return digest === signature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-prime-signature') || request.headers.get('signature') || ''

    // Verificar firma con las palabras secretas
    const secret1 = process.env.PRIME_PAYMENTS_SECRET_1!
    const secret2 = process.env.PRIME_PAYMENTS_SECRET_2!

    const isValid = verifyWebhookSignature(rawBody, signature, secret1) || 
                    verifyWebhookSignature(rawBody, signature, secret2)

    if (!isValid) {
      console.error('❌ Prime Payments webhook: Firma inválida')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(rawBody)
    
    console.log('✅ Prime Payments webhook recibido:', {
      type: data.type || data.event_type,
      id: data.id || data.transaction_id,
      timestamp: new Date().toISOString()
    })

    // Procesar diferentes tipos de eventos
    switch (data.type || data.event_type) {
      case 'payment.success':
      case 'payment_success':
        await handlePaymentSuccess(data)
        break

      case 'payment.failed':
      case 'payment_failed':
        await handlePaymentFailed(data)
        break

      case 'payment.refunded':
      case 'payment_refunded':
        await handlePaymentRefunded(data)
        break

      case 'subscription.created':
      case 'subscription_created':
        await handleSubscriptionCreated(data)
        break

      case 'subscription.cancelled':
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data)
        break

      default:
        console.log('⚠️ Prime Payments: Tipo de evento no manejado:', data.type || data.event_type)
    }

    return NextResponse.json({ received: true, timestamp: new Date().toISOString() })

  } catch (error: any) {
    console.error('❌ Error procesando webhook de Prime Payments:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    )
  }
}

// Handlers para diferentes eventos
async function handlePaymentSuccess(data: any) {
  console.log('💰 Pago exitoso:', {
    amount: data.amount,
    currency: data.currency,
    email: data.customer?.email || data.email,
    transactionId: data.id || data.transaction_id
  })

  // TODO: Actualizar base de datos con el pago exitoso
  // TODO: Enviar email de confirmación
  // TODO: Activar acceso al usuario
}

async function handlePaymentFailed(data: any) {
  console.log('❌ Pago fallido:', {
    reason: data.failure_reason || data.error_message,
    email: data.customer?.email || data.email,
    transactionId: data.id || data.transaction_id
  })

  // TODO: Registrar el fallo en la base de datos
  // TODO: Enviar email de notificación al usuario
}

async function handlePaymentRefunded(data: any) {
  console.log('↩️ Pago reembolsado:', {
    amount: data.amount,
    email: data.customer?.email || data.email,
    transactionId: data.id || data.transaction_id
  })

  // TODO: Actualizar base de datos con el reembolso
  // TODO: Desactivar acceso del usuario
  // TODO: Enviar email de confirmación de reembolso
}

async function handleSubscriptionCreated(data: any) {
  console.log('🔄 Suscripción creada:', {
    email: data.customer?.email || data.email,
    subscriptionId: data.subscription_id
  })

  // TODO: Activar suscripción en base de datos
  // TODO: Enviar email de bienvenida
}

async function handleSubscriptionCancelled(data: any) {
  console.log('🚫 Suscripción cancelada:', {
    email: data.customer?.email || data.email,
    subscriptionId: data.subscription_id
  })

  // TODO: Desactivar suscripción en base de datos
  // TODO: Enviar email de confirmación de cancelación
}

