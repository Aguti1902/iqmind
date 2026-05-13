import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

/**
 * 1. Elimina duplicados: conserva solo el registro más antiguo por (user_email, DATE de created_at)
 * 2. Añade índice único para evitar futuros duplicados en el backfill
 * 3. Los pagos con transaction_id real son protegidos por unicidad de transaction_id
 */
export async function GET() {
  const pool = getPool()
  try {
    // Paso 1: contar duplicados antes de limpiar
    const beforeResult = await pool.query(`SELECT COUNT(*) as total FROM purchases`)
    const totalBefore = parseInt(beforeResult.rows[0].total)

    // Paso 2: eliminar duplicados — quedar solo con el id más pequeño (el primero insertado)
    // por combinación de user_email + mismo día
    const deleteResult = await pool.query(`
      DELETE FROM purchases
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM purchases
        GROUP BY user_email, DATE_TRUNC('day', created_at)
      )
    `)
    const deleted = deleteResult.rowCount ?? 0

    // Paso 3: contar después de limpiar
    const afterResult = await pool.query(`SELECT COUNT(*) as total FROM purchases`)
    const totalAfter = parseInt(afterResult.rows[0].total)

    // Paso 4: crear índice único para el backfill (por user_email + día)
    // Esto previene que el backfill inserte el mismo usuario dos veces en el mismo día
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS purchases_email_day_unique
      ON purchases (user_email, DATE_TRUNC('day', created_at))
      WHERE transaction_id IS NULL
    `)

    // Paso 5: crear índice único para transaction_id real (pagos Sipay reales)
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS purchases_transaction_id_unique
      ON purchases (transaction_id)
      WHERE transaction_id IS NOT NULL
    `)

    return NextResponse.json({
      success: true,
      message: 'Limpieza completada',
      totalBefore,
      deleted,
      totalAfter,
    })
  } catch (err: any) {
    console.error('Error en cleanup:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
