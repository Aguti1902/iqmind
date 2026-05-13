import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

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
      amount DECIMAL(10,2) NOT NULL DEFAULT 0.50,
      currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)
}

export async function GET() {
  const pool = getPool()
  try {
    await ensurePurchasesTable(pool)

    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    // ── Métricas Sipay: últimas 2 semanas ──────────────────────────────
    const sipayResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') AS purchases_2w,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS revenue_2w,
        COUNT(*) FILTER (WHERE status = 'refunded') AS refunds_2w,
        COALESCE(SUM(amount) FILTER (WHERE status = 'refunded'), 0) AS refunded_amount_2w
      FROM purchases
      WHERE created_at >= $1
    `, [twoWeeksAgo])

    const s2w = sipayResult.rows[0]
    const purchases2w = parseInt(s2w.purchases_2w)
    const revenue2w = parseFloat(s2w.revenue_2w)
    const refunds2w = parseInt(s2w.refunds_2w)
    const refundedAmount2w = parseFloat(s2w.refunded_amount_2w)

    // ── Métricas Sipay: totales históricos ─────────────────────────────
    const totalResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') AS total_purchases,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total_revenue,
        COUNT(DISTINCT user_email) FILTER (WHERE status = 'completed') AS unique_buyers
      FROM purchases
    `)
    const tot = totalResult.rows[0]
    const totalPurchases = parseInt(tot.total_purchases)
    const totalRevenue = parseFloat(tot.total_revenue)
    const uniqueBuyers = parseInt(tot.unique_buyers)

    // ── Desglose por tipo de test (últimas 2 semanas) ──────────────────
    const typeBreakdown2w = await pool.query(`
      SELECT
        test_type,
        COUNT(*) FILTER (WHERE status = 'completed') AS count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS revenue
      FROM purchases
      WHERE created_at >= $1 AND status = 'completed'
      GROUP BY test_type
      ORDER BY count DESC
    `, [twoWeeksAgo])

    // ── Gráfico diario: últimas 2 semanas ──────────────────────────────
    const dailyResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('day', created_at), 'DD Mon') AS day,
        DATE_TRUNC('day', created_at) AS day_ts,
        COUNT(*) FILTER (WHERE status = 'completed') AS purchases,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS revenue
      FROM purchases
      WHERE created_at >= $1
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at) ASC
    `, [twoWeeksAgo])

    // Rellenar días sin datos
    const dailyMap: Record<string, { purchases: number; revenue: number }> = {}
    dailyResult.rows.forEach(r => {
      dailyMap[r.day] = { purchases: parseInt(r.purchases), revenue: parseFloat(r.revenue) }
    })

    const dailyChart = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        .replace('.', '').replace(' ', ' ')
      // Try matching with the DB format
      const matchKey = Object.keys(dailyMap).find(k => {
        const dbDate = new Date(dailyResult.rows.find(r => r.day === k)?.day_ts || 0)
        return dbDate.toDateString() === d.toDateString()
      })
      dailyChart.push({
        day: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        purchases: matchKey ? dailyMap[matchKey].purchases : 0,
        revenue: matchKey ? dailyMap[matchKey].revenue : 0,
      })
    }

    // ── Suscripciones activas REALES (con acceso vigente) ─────────────
    const activeSubsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE subscription_status = 'active' AND access_until > $1) AS truly_active,
        COUNT(*) FILTER (WHERE subscription_status = 'trial' AND trial_end_date > $1) AS truly_trialing,
        COUNT(*) FILTER (WHERE subscription_status = 'cancelled' AND updated_at >= $2) AS cancelled_2w
      FROM users
    `, [now, twoWeeksAgo])

    const subs = activeSubsResult.rows[0]
    const trulyActive = parseInt(subs.truly_active)
    const trulyTrialing = parseInt(subs.truly_trialing)
    const cancelled2w = parseInt(subs.cancelled_2w)

    // ── Transacciones recientes (últimas 2 semanas) ────────────────────
    const recentResult = await pool.query(`
      SELECT id, transaction_id, user_email, user_name, test_type, amount, currency, status, created_at
      FROM purchases
      WHERE created_at >= $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [twoWeeksAgo])

    const recentTransactions = recentResult.rows.map(row => ({
      id: row.transaction_id || String(row.id),
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status === 'completed' ? 'succeeded' : row.status,
      customer_email: row.user_email,
      customer_name: row.user_name || 'N/A',
      test_type: row.test_type,
      created: row.created_at,
      description: row.test_type === 'iq' ? 'Test de IQ'
        : row.test_type === 'personality' ? 'Test de Personalidad'
        : `Test ${row.test_type}`,
    }))

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          // Sipay — últimas 2 semanas
          purchases2w,
          revenue2w: Math.round(revenue2w * 100) / 100,
          refunds2w,
          refundedAmount2w: Math.round(refundedAmount2w * 100) / 100,
          // Sipay — totales
          totalPurchases,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          uniqueBuyers,
          // Suscripciones reales
          activeSubscriptions: trulyActive,
          trialingSubscriptions: trulyTrialing,
          cancelations2w: cancelled2w,
        },
        charts: {
          dailyRevenue: dailyChart,
          typeBreakdown: typeBreakdown2w.rows.map(r => ({
            testType: r.test_type,
            count: parseInt(r.count),
            revenue: parseFloat(r.revenue),
          })),
        },
        tables: {
          recentTransactions,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
