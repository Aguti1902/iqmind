import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getSipayClient } from '@/lib/sipay-client'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

/**
 * Endpoint unificado para el agente de IA de n8n.
 * Seguridad: requiere N8N_API_KEY en header x-api-key
 *
 * Acciones:
 * - lookup:  busca usuario por email, devuelve datos de suscripción
 * - cancel:  cancela suscripción (elimina token Sipay + actualiza BD + email)
 * - refund:  procesa reembolso vía Sipay (requiere transaction_id)
 */
export async function POST(request: NextRequest) {
  const pool = getPool()

  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, email, transaction_id, amount, reason } = await request.json()

    if (!action || !email) {
      return NextResponse.json({ error: 'action y email requeridos' }, { status: 400 })
    }

    // --- LOOKUP ---
    if (action === 'lookup') {
      const result = await pool.query(
        `SELECT id, email, user_name, subscription_status, subscription_id,
                trial_end_date, access_until, created_at
         FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({
          found: false,
          email,
        })
      }

      const user = result.rows[0]
      return NextResponse.json({
        found: true,
        email: user.email,
        user_name: user.user_name,
        subscription_status: user.subscription_status,
        has_card_token: !!user.subscription_id,
        trial_end_date: user.trial_end_date,
        access_until: user.access_until,
        created_at: user.created_at,
        has_active_subscription: user.subscription_status === 'active' || user.subscription_status === 'trial',
      })
    }

    // --- CANCEL ---
    if (action === 'cancel') {
      const result = await pool.query(
        `SELECT id, email, user_name, subscription_status, subscription_id, access_until, trial_end_date
         FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Usuario no encontrado' })
      }

      const user = result.rows[0]

      if (user.subscription_status !== 'active' && user.subscription_status !== 'trial') {
        return NextResponse.json({
          success: false,
          error: 'No hay suscripción activa',
          current_status: user.subscription_status,
        })
      }

      if (user.subscription_id) {
        try {
          const sipay = getSipayClient()
          await sipay.deleteCardToken(user.subscription_id)
        } catch (e: any) {
          console.error('⚠️ [n8n-cancel] Error eliminando token Sipay:', e.message)
        }
      }

      const accessUntil = user.access_until || user.trial_end_date || new Date().toISOString()

      await pool.query(
        `UPDATE users SET subscription_status = 'cancelled', subscription_id = NULL, updated_at = NOW() WHERE id = $1`,
        [user.id]
      )

      try {
        const userName = user.user_name || email.split('@')[0]
        const accessDate = new Date(accessUntil).toLocaleDateString('es-ES', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
        const cancelEmail = emailTemplates.subscriptionCancelled(email, userName, accessDate, 'es')
        await sendEmail(cancelEmail)
      } catch (e: any) {
        console.error('⚠️ [n8n-cancel] Error enviando email:', e.message)
      }

      return NextResponse.json({
        success: true,
        message: 'Suscripción cancelada',
        access_until: accessUntil,
      })
    }

    // --- REFUND ---
    if (action === 'refund') {
      if (!transaction_id) {
        return NextResponse.json({
          success: false,
          error: 'transaction_id requerido para procesar reembolso',
          note: 'El cliente debe proporcionar el ID de transacción o se debe buscar en el panel de Sipay',
        })
      }

      const refundAmount = amount ? Math.round(amount * 100) : undefined
      if (!refundAmount) {
        return NextResponse.json({ success: false, error: 'amount requerido' })
      }

      try {
        const sipay = getSipayClient()
        const refundResult: any = await sipay.refund({
          transactionId: transaction_id,
          amount: refundAmount,
          currency: 'EUR',
        })

        if (refundResult.type !== 'success') {
          return NextResponse.json({
            success: false,
            error: refundResult.description || 'Error en reembolso Sipay',
            sipay_detail: refundResult.detail,
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Reembolso procesado',
          refund_data: refundResult.payload,
        })
      } catch (e: any) {
        return NextResponse.json({
          success: false,
          error: e.message,
        })
      }
    }

    return NextResponse.json({ error: 'Acción no válida. Usa: lookup, cancel, refund' }, { status: 400 })

  } catch (error: any) {
    console.error('❌ [n8n-agent] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
