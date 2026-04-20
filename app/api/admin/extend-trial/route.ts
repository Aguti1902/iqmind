import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

export async function POST(request: NextRequest) {
  const pool = getPool()
  try {
    const { email, days = 7 } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

    const newDate = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000)
    const result = await pool.query(
      `UPDATE users
       SET subscription_status = 'trial',
           access_until = $1,
           trial_end_date = $1,
           updated_at = NOW()
       WHERE email = $2
       RETURNING id, email, access_until`,
      [newDate.toISOString(), email]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log(`✅ [extend-trial] ${email} → acceso hasta ${newDate.toISOString()}`)
    return NextResponse.json({
      success: true,
      email,
      accessUntil: newDate.toISOString(),
      days,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
