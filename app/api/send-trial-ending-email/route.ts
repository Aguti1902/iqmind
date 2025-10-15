import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { db } from '@/lib/database-postgres'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Buscar usuario en la base de datos
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario tenga trial activo
    if (user.subscriptionStatus !== 'trial') {
      return NextResponse.json({ error: 'Usuario no tiene trial activo' }, { status: 400 })
    }

    // Enviar email de trial ending
    const emailData = emailTemplates.trialEndingTomorrow(email, user.userName, 'es')
    const result = await sendEmail(emailData)

    if (result.success) {
      console.log(`✅ Email de trial ending enviado a ${email}`)
      return NextResponse.json({ success: true, message: 'Email enviado correctamente' })
    } else {
      console.error(`❌ Error enviando email de trial ending:`, result.error)
      return NextResponse.json({ error: 'Error enviando email' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Error en send-trial-ending-email:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
