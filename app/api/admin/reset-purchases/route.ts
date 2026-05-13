import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

/**
 * Resetea la tabla purchases completamente:
 * 1. Borra todos los registros
 * 2. Resetea el auto-increment del ID
 * 3. Recrea los índices únicos anti-duplicado
 */
export async function GET() {
  const pool = getPool()
  try {
    // Borrar todos los registros y resetear secuencia
    await pool.query(`TRUNCATE TABLE purchases RESTART IDENTITY`)

    // Eliminar índices únicos anteriores si existen (para recrearlos limpios)
    await pool.query(`DROP INDEX IF EXISTS purchases_transaction_id_unique`)
    await pool.query(`DROP INDEX IF EXISTS purchases_email_day_unique`)

    // Recrear índice único para transaction_id real de Sipay
    await pool.query(`
      CREATE UNIQUE INDEX purchases_transaction_id_unique
      ON purchases (transaction_id)
      WHERE transaction_id IS NOT NULL
    `)

    // Recrear índice único para backfill (un registro por email por día sin transaction_id)
    await pool.query(`
      CREATE UNIQUE INDEX purchases_email_day_unique
      ON purchases (user_email, DATE_TRUNC('day', created_at))
      WHERE transaction_id IS NULL
    `)

    return NextResponse.json({
      success: true,
      message: 'Tabla purchases reseteada. Lista para registrar compras reales desde 0.',
      indexes: [
        'purchases_transaction_id_unique — previene duplicados por transaction_id de Sipay',
        'purchases_email_day_unique — previene duplicados de backfill por email+día',
      ],
    })
  } catch (err: any) {
    console.error('Error en reset:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
