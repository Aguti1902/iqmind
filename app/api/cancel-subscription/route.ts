import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Cancelar suscripción (Sipay)
 *
 * - Elimina el token de tarjeta en Sipay (impide futuros cobros)
 * - Mantiene acceso hasta el final del periodo pagado (accessUntil)
 * - Envía email de confirmación de cancelación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

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
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🚫 [cancel] Cancelando suscripción para:', userEmail)

    const user = await db.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trial') {
      return NextResponse.json(
        { error: 'No hay suscripción activa para cancelar' },
        { status: 400 }
      )
    }

    const cardToken = user.subscriptionId

    if (cardToken) {
      try {
        const sipay = getSipayClient()
        await sipay.deleteCardToken(cardToken)
        console.log('✅ [cancel] Token eliminado de Sipay:', cardToken.slice(0, 10) + '...')
      } catch (sipayErr: any) {
        console.error('⚠️ [cancel] Error eliminando token en Sipay (continuamos):', sipayErr.message)
      }
    }

    const accessUntil = user.accessUntil || user.trialEndDate || new Date().toISOString()

    await db.updateUser(user.id, {
      subscriptionStatus: 'cancelled',
      subscriptionId: null as any,
    })

    console.log('✅ [cancel] Suscripción cancelada. Acceso hasta:', accessUntil)

    try {
      const userName = user.userName || userEmail.split('@')[0]
      const accessDate = new Date(accessUntil).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const cancelEmail = emailTemplates.subscriptionCancelled(userEmail, userName, accessDate, 'es')
      await sendEmail(cancelEmail)
      console.log('📧 [cancel] Email de cancelación enviado a:', userEmail)
    } catch (emailErr: any) {
      console.error('⚠️ [cancel] Error enviando email:', emailErr.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      accessUntil,
    })

  } catch (error: any) {
    console.error('❌ [cancel] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Error cancelando suscripción' },
      { status: 500 }
    )
  }
}
