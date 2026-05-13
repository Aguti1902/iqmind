import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) {
    return NextResponse.json({ success: false, error: 'No DB URL' }, { status: 500 })
  }

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 3 })

  try {
    const email = 'admin@mindmetric.io'
    const newPassword = 'Admin2024!MindMetric'
    const hashed = await bcrypt.hash(newPassword, 10)

    const result = await pool.query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email`,
      [hashed, email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' })
    }

    // Asegurarse de que está en admin_emails
    const configResult = await pool.query(
      `SELECT value FROM site_config WHERE key = 'admin_emails' LIMIT 1`
    )
    const currentList: string = configResult.rows[0]?.value || ''
    if (!currentList.includes(email)) {
      const newList = currentList ? `${currentList},${email}` : email
      await pool.query(
        `INSERT INTO site_config (key, value, updated_at)
         VALUES ('admin_emails', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
        [newList]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña reseteada correctamente',
      credentials: { email, password: newPassword },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
