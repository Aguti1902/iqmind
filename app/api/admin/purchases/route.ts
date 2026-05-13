import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

const TEST_TYPE_LABELS: Record<string, string> = {
  iq: 'Test de IQ',
  personality: 'Test de Personalidad',
  adhd: 'Test TDAH',
  anxiety: 'Test de Ansiedad',
  depression: 'Test de Depresión',
  eq: 'Test de Inteligencia Emocional',
}

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

async function ensurePurchasesTable(pool: Pool) {
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
}

export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    await ensurePurchasesTable(pool)

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const testTypeFilter = searchParams.get('test_type') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 1000)

    const conditions: string[] = []
    const params: any[] = []
    let idx = 1

    if (search) {
      conditions.push(`(user_email ILIKE $${idx} OR user_name ILIKE $${idx + 1} OR transaction_id ILIKE $${idx + 2})`)
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      idx += 3
    }

    if (testTypeFilter !== 'all') {
      conditions.push(`test_type = $${idx}`)
      params.push(testTypeFilter)
      idx++
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    params.push(limit)

    const result = await pool.query(
      `SELECT * FROM purchases ${where} ORDER BY created_at DESC LIMIT $${idx}`,
      params
    )

    // Estadísticas por tipo de test
    const statsResult = await pool.query(
      `SELECT test_type, COUNT(*) as count, SUM(amount) as total
       FROM purchases
       WHERE status = 'completed'
       GROUP BY test_type
       ORDER BY count DESC`
    )

    const purchases = result.rows.map(row => ({
      id: row.id,
      transactionId: row.transaction_id,
      orderId: row.order_id,
      email: row.user_email,
      name: row.user_name || 'N/A',
      testType: row.test_type,
      testTypeLabel: TEST_TYPE_LABELS[row.test_type] || row.test_type,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
    }))

    const stats = statsResult.rows.map(row => ({
      testType: row.test_type,
      testTypeLabel: TEST_TYPE_LABELS[row.test_type] || row.test_type,
      count: parseInt(row.count),
      total: parseFloat(row.total),
    }))

    const totalRevenue = purchases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      success: true,
      data: purchases,
      stats,
      total: purchases.length,
      totalRevenue,
    })
  } catch (error: any) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
