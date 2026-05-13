import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

/**
 * Rellena la tabla purchases con datos históricos de usuarios existentes.
 * Incluye TODOS los usuarios que pagaron (trial/active/cancelled/expired),
 * con o sin subscription_id.
 * El precio real es €0.50 (precio del pago inicial en Sipay).
 */
export async function GET() {
  const pool = getPool()
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(255),
        order_id VARCHAR(255),
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255),
        test_type VARCHAR(50) NOT NULL DEFAULT 'iq',
        amount DECIMAL(10,2) NOT NULL DEFAULT 0.50,
        currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Todos los usuarios que en algún momento completaron un pago
    const usersResult = await pool.query(`
      SELECT id, email, user_name, subscription_id, subscription_status, created_at
      FROM users
      WHERE subscription_status IN ('trial', 'active', 'cancelled', 'expired')
      ORDER BY created_at ASC
    `)

    let inserted = 0
    let skipped = 0
    let updated = 0

    for (const user of usersResult.rows) {
      const existing = await pool.query(
        `SELECT id, amount FROM purchases WHERE user_email = $1 LIMIT 1`,
        [user.email]
      )

      // Si ya existe con el precio correcto, saltar
      if (existing.rows.length > 0) {
        const existingAmount = parseFloat(existing.rows[0].amount)
        // Si el precio está mal (era 0.90 del backfill anterior), corregirlo
        if (existingAmount === 0.90) {
          await pool.query(
            `UPDATE purchases SET amount = 0.50 WHERE user_email = $1`,
            [user.email]
          )
          updated++
        } else {
          skipped++
        }
        continue
      }

      // Extraer transaction_id del subscription_id si existe
      const rawToken = user.subscription_id || ''
      const transactionId = rawToken.includes('|') ? rawToken.split('|')[0] : (rawToken || null)

      await pool.query(
        `INSERT INTO purchases (transaction_id, user_email, user_name, test_type, amount, currency, status, created_at)
         VALUES ($1, $2, $3, 'iq', 0.50, 'EUR', 'completed', $4)`,
        [transactionId, user.email, user.user_name || user.email.split('@')[0], user.created_at]
      )
      inserted++
    }

    return NextResponse.json({
      success: true,
      message: 'Backfill completado',
      inserted,
      updated,
      skipped,
      total: usersResult.rows.length,
    })
  } catch (err: any) {
    console.error('Error en backfill:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
