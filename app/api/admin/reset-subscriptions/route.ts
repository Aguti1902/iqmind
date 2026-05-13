import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

/**
 * Resetea todos los datos de suscripción de los usuarios (excepto admin@mindmetric.io).
 * - subscription_status → 'expired'
 * - subscription_id → NULL  (borra tokens de tarjeta Sipay)
 * - trial_end_date  → NULL
 * - access_until    → NULL
 * - last_test_type  → NULL
 * Los usuarios y contraseñas NO se borran.
 */
export async function GET() {
  const pool = getPool()
  try {
    const before = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE subscription_status = 'active')  AS active,
        COUNT(*) FILTER (WHERE subscription_status = 'trial')   AS trial,
        COUNT(*) FILTER (WHERE subscription_status = 'cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE subscription_status = 'expired') AS expired,
        COUNT(*) AS total
      FROM users
      WHERE email != 'admin@mindmetric.io'
    `)

    const result = await pool.query(`
      UPDATE users
      SET
        subscription_status = 'expired',
        subscription_id     = NULL,
        trial_end_date      = NULL,
        access_until        = NULL,
        last_test_type      = NULL,
        updated_at          = NOW()
      WHERE email != 'admin@mindmetric.io'
    `)

    return NextResponse.json({
      success: true,
      message: 'Suscripciones reseteadas. Todos los usuarios están ahora como "expired".',
      usersUpdated: result.rowCount,
      before: before.rows[0],
    })
  } catch (err: any) {
    console.error('Error en reset-subscriptions:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
