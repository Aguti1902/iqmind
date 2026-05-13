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
      amount DECIMAL(10,2) NOT NULL DEFAULT 0.90,
      currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)
}

export async function GET() {
  const pool = getPool()
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    await ensurePurchasesTable(pool)

    // Datos de usuarios/suscripciones
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE subscription_status = 'active') as active_count,
        COUNT(*) FILTER (WHERE subscription_status = 'trial') as trial_count,
        COUNT(*) FILTER (WHERE subscription_status = 'cancelled' AND updated_at >= $1) as cancelled_this_month,
        COUNT(*) as total_users
      FROM users
    `, [startOfMonth.toISOString()])

    const stats = statsResult.rows[0]
    const activeCount = parseInt(stats.active_count)
    const trialCount = parseInt(stats.trial_count)
    const cancelledThisMonth = parseInt(stats.cancelled_this_month)
    const totalUsers = parseInt(stats.total_users)

    const mrr = activeCount * 19.99
    const totalTrials = trialCount + activeCount
    const conversionRate = totalTrials > 0 ? (activeCount / totalTrials) * 100 : 0
    const churnRate = (activeCount + cancelledThisMonth) > 0
      ? (cancelledThisMonth / (activeCount + cancelledThisMonth)) * 100
      : 0

    // Ingresos reales desde tabla purchases
    const revenueResult = await pool.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_revenue,
        COUNT(*) FILTER (WHERE status = 'completed' AND created_at >= $1) as purchases_this_month,
        COALESCE(SUM(amount) FILTER (WHERE status = 'refunded'), 0) as total_refunded,
        COUNT(*) FILTER (WHERE status = 'refunded' AND created_at >= $1) as refunds_this_month
      FROM purchases
    `, [startOfMonth.toISOString()])

    const rev = revenueResult.rows[0]
    const totalRevenue = parseFloat(rev.total_revenue)
    const totalRefunded = parseFloat(rev.total_refunded)
    const refundsThisMonth = parseInt(rev.refunds_this_month)

    // Ingresos mensuales (últimos 6 meses) desde purchases
    const monthlyResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month_key,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as revenue,
        COUNT(*) FILTER (WHERE status = 'completed') as transactions
      FROM purchases
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `)

    const monthlyRevenue = monthlyResult.rows.map(row => ({
      month: row.month,
      revenue: parseFloat(row.revenue),
      transactions: parseInt(row.transactions),
    }))

    // Si no hay datos en purchases, rellenar con meses vacíos
    if (monthlyRevenue.length === 0) {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
          month: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
          revenue: 0,
          transactions: 0,
        })
      }
      monthlyRevenue.push(...months)
    }

    // Transacciones recientes reales desde purchases
    const recentPurchasesResult = await pool.query(`
      SELECT id, transaction_id, user_email, user_name, test_type, amount, currency, status, created_at
      FROM purchases
      ORDER BY created_at DESC
      LIMIT 20
    `)

    const recentTransactions = recentPurchasesResult.rows.map(row => ({
      id: row.transaction_id || String(row.id),
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status === 'completed' ? 'succeeded' : row.status,
      customer_email: row.user_email,
      customer_name: row.user_name || 'N/A',
      test_type: row.test_type,
      created: row.created_at,
      description: row.test_type === 'iq' ? 'Test de IQ' : row.test_type === 'personality' ? 'Test de Personalidad' : `Test ${row.test_type}`,
    }))

    // Suscripciones activas
    const activeSubsList = await pool.query(`
      SELECT id, email, subscription_status, access_until, trial_end_date, created_at
      FROM users
      WHERE subscription_status IN ('active', 'trial')
      ORDER BY created_at DESC
      LIMIT 10
    `)

    const activeSubscriptionsList = activeSubsList.rows.map(row => ({
      id: row.id,
      customer_id: row.id,
      status: row.subscription_status,
      plan: 'MindMetric Premium',
      amount: 19.99,
      current_period_end: row.access_until || row.trial_end_date,
      trial_end: row.trial_end_date,
    }))

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          activeSubscriptions: activeCount,
          trialingSubscriptions: trialCount,
          cancelationsThisMonth: cancelledThisMonth,
          refundsThisMonth,
          mrr: Math.round(mrr * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalRefunded: Math.round(totalRefunded * 100) / 100,
          conversionRate: Math.round(conversionRate * 10) / 10,
          churnRate: Math.round(churnRate * 10) / 10,
          totalUsers,
        },
        charts: {
          monthlyRevenue,
        },
        tables: {
          recentTransactions,
          activeSubscriptions: activeSubscriptionsList,
        },
        aiMetrics: {
          totalRequests: 0,
          refundApproved: 0,
          refundDenied: 0,
          cancelationsProcessed: cancelledThisMonth,
          avgResponseTime: 0,
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
