import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email-service'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/database-postgres'

export async function POST(request: NextRequest) {
  // Email de aviso de trial desactivado
  return NextResponse.json({ success: false, message: 'Trial ending emails disabled' }, { status: 410 })
}
