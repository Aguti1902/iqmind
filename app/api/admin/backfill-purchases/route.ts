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
 * Para cada usuario que pagó (trial/active/cancelled/expired con subscription_id),
 * crea un registro de compra de 0.90€ en la fecha en que se creó el usuario.
 * Solo inserta si no existe ya un registro para ese usuario.
 */
export async function GET() {
  const pool = getPool()
  try {
    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(255),
        order_id VARCHAR(255),
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255),
        test_type VARCHAR(50) NOT NULL DEFAULT 'iq',
        amount DECIMAL(10,2) NOT NULL DEFAULT 0.90,
        currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Obtener usuarios que en algún momento pagaron (tienen subscription_id o status no es null/new)
    const usersResult = await pool.query(`
      SELECT id, email, user_name, subscription_id, subscription_status, created_at
      FROM users
      WHERE subscription_status IN ('trial', 'active', 'cancelled', 'expired')
        AND subscription_id IS NOT NULL
        AND subscription_id != ''
      ORDER BY created_at ASC
    `)

    let inserted = 0
    let skipped = 0

    for (const user of usersResult.rows) {
      // Verificar si ya existe registro para este email
      const existing = await pool.query(
        `SELECT id FROM purchases WHERE user_email = $1 LIMIT 1`,
        [user.email]
      )

      if (existing.rows.length > 0) {
        skipped++
        continue
      }

      // Extraer transaction_id del subscription_id (puede ser "token|cofId" o solo token)
      const rawToken = user.subscription_id || ''
      const transactionId = rawToken.includes('|') ? rawToken.split('|')[0] : rawToken

      await pool.query(
        `INSERT INTO purchases (transaction_id, user_email, user_name, test_type, amount, currency, status, created_at)
         VALUES ($1, $2, $3, 'iq', 0.90, 'EUR', 'completed', $4)`,
        [transactionId || null, user.email, user.user_name || user.email.split('@')[0], user.created_at]
      )
      inserted++
    }

    return NextResponse.json({
      success: true,
      message: `Backfill completado`,
      inserted,
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
