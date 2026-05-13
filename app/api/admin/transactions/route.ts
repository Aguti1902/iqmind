import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getSipayClient } from '@/lib/sipay-client'

export const dynamic = 'force-dynamic'

const TEST_TYPE_LABELS: Record<string, string> = {
  iq: 'Test de IQ',
  personality: 'Test de Personalidad',
  adhd: 'Test TDAH',
  anxiety: 'Test de Ansiedad',
  depression: 'Test de Depresión',
  eq: 'Test de IE',
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
    const statusFilter = searchParams.get('status') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 1000)

    const conditions: string[] = []
    const params: any[] = []
    let idx = 1

    if (search) {
      conditions.push(`(user_email ILIKE $${idx} OR user_name ILIKE $${idx + 1} OR transaction_id ILIKE $${idx + 2})`)
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      idx += 3
    }

    if (statusFilter !== 'all') {
      const dbStatus = statusFilter === 'succeeded' ? 'completed' : statusFilter
      conditions.push(`status = $${idx}`)
      params.push(dbStatus)
      idx++
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    params.push(limit)

    const result = await pool.query(
      `SELECT * FROM purchases ${where} ORDER BY created_at DESC LIMIT $${idx}`,
      params
    )

    const transactions = result.rows.map(row => ({
      id: row.transaction_id || String(row.id),
      purchaseId: row.id,
      amount: parseFloat(row.amount),
      amount_refunded: 0,
      currency: row.currency,
      status: row.status === 'completed' ? 'succeeded' : row.status,
      refunded: row.status === 'refunded',
      customer_email: row.user_email,
      customer_name: row.user_name || 'N/A',
      test_type: row.test_type,
      test_type_label: TEST_TYPE_LABELS[row.test_type] || row.test_type,
      description: TEST_TYPE_LABELS[row.test_type] || `Test ${row.test_type}`,
      created: row.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: transactions,
      total: transactions.length,
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}

/**
 * Procesar reembolso via Sipay y marcar en purchases
 */
export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { transactionId, amount, chargeId } = await req.json()
    const txId = transactionId || chargeId

    if (!txId || !amount) {
      return NextResponse.json(
        { success: false, error: 'transactionId y amount requeridos' },
        { status: 400 }
      )
    }

    const sipay = getSipayClient()
    const response: any = await sipay.refund({
      transactionId: txId,
      amount: Math.round(amount * 100),
      currency: 'EUR',
    })

    if (response.type !== 'success') {
      return NextResponse.json(
        { success: false, error: response.description || 'Error en reembolso' },
        { status: 400 }
      )
    }

    // Marcar como reembolsado en purchases
    await ensurePurchasesTable(pool)
    await pool.query(
      `UPDATE purchases SET status = 'refunded' WHERE transaction_id = $1`,
      [txId]
    )

    return NextResponse.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: response.payload,
    })
  } catch (error: any) {
    console.error('Error creating refund:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
