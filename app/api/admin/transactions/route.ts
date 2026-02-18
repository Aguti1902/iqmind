import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getSipayClient } from '@/lib/sipay-client'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

/**
 * Admin: listar usuarios con suscripciones (como transacciones)
 * Con Sipay no tenemos un log de transacciones local, pero mostramos
 * los usuarios con su estado de suscripción.
 */
export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    let query = `
      SELECT id, email, user_name, subscription_status, subscription_id,
             trial_end_date, access_until, created_at, updated_at
      FROM users
      ORDER BY updated_at DESC
    `
    const params: any[] = []
    let paramIdx = 1

    if (search) {
      query = `
        SELECT id, email, user_name, subscription_status, subscription_id,
               trial_end_date, access_until, created_at, updated_at
        FROM users
        WHERE email ILIKE $${paramIdx++} OR user_name ILIKE $${paramIdx++}
        ORDER BY updated_at DESC
      `
      params.push(`%${search}%`)
      params.push(`%${search}%`)
    }

    query += ` LIMIT $${paramIdx++}`
    params.push(limit)

    const result = await pool.query(query, params)

    const formattedTransactions = result.rows.map(row => ({
      id: row.id,
      amount: row.subscription_status === 'trial' ? 0.50 : 9.99,
      currency: 'EUR',
      status: row.subscription_status,
      customer_email: row.email,
      customer_name: row.user_name || 'N/A',
      has_card_token: !!row.subscription_id,
      created: row.created_at,
      description: row.subscription_status === 'trial' ? 'Pago inicial' : 'Suscripción mensual',
    }))

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length,
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  } finally {
    await pool.end().catch(() => {})
  }
}

/**
 * Admin: crear reembolso via Sipay
 */
export async function POST(req: NextRequest) {
  try {
    const { transactionId, amount } = await req.json()

    if (!transactionId || !amount) {
      return NextResponse.json(
        { success: false, error: 'transactionId y amount requeridos' },
        { status: 400 }
      )
    }

    const sipay = getSipayClient()
    const response: any = await sipay.refund({
      transactionId,
      amount: Math.round(amount * 100),
      currency: 'EUR',
    })

    if (response.type !== 'success') {
      return NextResponse.json(
        { success: false, error: response.description || 'Error en reembolso' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: response.payload,
    })
  } catch (error: any) {
    console.error('Error creating refund:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
