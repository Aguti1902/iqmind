import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
export const dynamic = 'force-dynamic'
import { verifyToken } from '@/lib/auth'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, discountPercent = 50, durationMonths = 3 } = body

    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let userEmail: string | null = email || null

    if (token) {
      const authData = verifyToken(token)
      if (authData && authData.email) {
        userEmail = authData.email
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    console.log('🎁 Aplicando descuento de retención para:', userEmail)

    // Buscar el cliente por email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ningún cliente con este email' },
        { status: 404 }
      )
    }

    const customer = customers.data[0]

    // Buscar suscripciones activas o en trial
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10
    })

    // Incluir también las que están en trialing
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'trialing',
      limit: 10
    })

    const allSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data]

    if (allSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró ninguna suscripción activa' },
        { status: 404 }
      )
    }

    // Crear o obtener cupón de descuento
    const couponId = `retention_${discountPercent}off_${durationMonths}m`
    
    let coupon
    try {
      // Intentar obtener el cupón existente
      coupon = await stripe.coupons.retrieve(couponId)
    } catch (error) {
      // Si no existe, crearlo
      coupon = await stripe.coupons.create({
        id: couponId,
        percent_off: discountPercent,
        duration: 'repeating',
        duration_in_months: durationMonths,
        name: `Descuento de Retención ${discountPercent}% - ${durationMonths} meses`,
        metadata: {
          type: 'retention',
          created_at: new Date().toISOString()
        }
      })
      console.log('✅ Cupón creado:', couponId)
    }

    // Aplicar el cupón a la primera suscripción activa
    const subscription = allSubscriptions[0]
    
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      coupon: couponId,
      metadata: {
        ...subscription.metadata,
        retention_discount_applied: 'true',
        retention_discount_date: new Date().toISOString(),
        retention_discount_percent: discountPercent.toString(),
        retention_discount_months: durationMonths.toString()
      }
    })

    console.log('✅ Descuento aplicado a suscripción:', updatedSubscription.id)

    // Enviar notificación al cliente (opcional)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://mindmetric.io'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: '🎉 ¡Descuento Especial Aplicado!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #07C59A;">¡Gracias por quedarte con nosotros!</h2>
              <p>Nos alegra que hayas decidido continuar tu suscripción Premium.</p>
              
              <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
                <h3 style="color: #059669; margin-top: 0;">Tu descuento especial:</h3>
                <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 10px 0;">
                  ${discountPercent}% de descuento
                </p>
                <p style="color: #065f46;">
                  Aplicado durante los próximos ${durationMonths} meses
                </p>
              </div>
              
              <p>Este descuento se aplicará automáticamente en tus próximas facturas.</p>
              
              <p style="margin-top: 30px;">
                Gracias por confiar en MindMetric,<br>
                <strong>El equipo de MindMetric</strong>
              </p>
            </div>
          `
        })
      })
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError)
      // No fallar la operación si falla el email
    }

    return NextResponse.json({
      success: true,
      message: 'Descuento aplicado exitosamente',
      subscription: {
        id: updatedSubscription.id,
        discount: {
          coupon: coupon.id,
          percent_off: discountPercent,
          duration_in_months: durationMonths
        }
      }
    })

  } catch (error: any) {
    console.error('❌ Error aplicando descuento:', error)
    
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

