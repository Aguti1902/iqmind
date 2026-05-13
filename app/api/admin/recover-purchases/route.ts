import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

/**
 * Recupera compras perdidas: busca usuarios con trial reciente que no tienen
 * registro en purchases y los inserta.
 * También crea los índices únicos si no existen.
 */
export async function GET() {
  const pool = getPool()
  try {
    // Asegurar tabla e índices
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
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS purchases_transaction_id_unique
      ON purchases (transaction_id)
      WHERE transaction_id IS NOT NULL
    `)

    // Buscar usuarios con trial activado en los últimos 7 días que NO tienen compra registrada
    const missingResult = await pool.query(`
      SELECT u.id, u.email, u.user_name, u.subscription_id, u.subscription_status,
             u.trial_end_date, u.created_at, u.last_test_type
      FROM users u
      WHERE u.subscription_status IN ('trial', 'active')
        AND u.trial_end_date IS NOT NULL
        AND u.trial_end_date > NOW() - INTERVAL '10 days'
        AND NOT EXISTS (
          SELECT 1 FROM purchases p WHERE p.user_email = u.email
        )
      ORDER BY u.created_at DESC
    `)

    const recovered = []
    for (const user of missingResult.rows) {
      const rawToken = user.subscription_id || ''
      // El subscription_id tiene formato "tokenId|cofId" o solo "tokenId"
      const transactionId = rawToken.includes('|') ? rawToken.split('|')[0] : (rawToken || null)
      const testType = user.last_test_type || 'iq'

      await pool.query(
        `INSERT INTO purchases (transaction_id, user_email, user_name, test_type, amount, currency, status, created_at)
         SELECT $1, $2, $3, $4, 0.50, 'EUR', 'completed', $5
         WHERE NOT EXISTS (SELECT 1 FROM purchases WHERE user_email = $2 AND created_at::date = $5::date)`,
        [transactionId, user.email, user.user_name || user.email.split('@')[0], testType, user.created_at]
      )
      recovered.push({ email: user.email, testType, transactionId })
    }

    // Estado actual de la tabla
    const countResult = await pool.query(`SELECT COUNT(*) as total FROM purchases`)
    const allPurchases = await pool.query(
      `SELECT user_email, test_type, amount, status, created_at, transaction_id
       FROM purchases ORDER BY created_at DESC LIMIT 20`
    )

    return NextResponse.json({
      success: true,
      recovered: recovered.length,
      recoveredDetails: recovered,
      totalInTable: parseInt(countResult.rows[0].total),
      lastPurchases: allPurchases.rows,
    })
  } catch (err: any) {
    console.error('Error en recover-purchases:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
