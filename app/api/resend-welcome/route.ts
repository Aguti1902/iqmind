import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Obtener usuario
    const user = await db.getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('📧 Reenviando email de bienvenida a:', email)

    // Usar el template paymentSuccess que ya existe
    const lang = 'es'
    const emailData = emailTemplates.paymentSuccess(
      user.email,
      user.userName,
      user.iq || 0,
      lang
    )

    // Enviar email
    const result = await sendEmail(emailData)

    if (!result.success) {
      throw new Error(result.error || 'Error al enviar email')
    }

    console.log('✅ Email reenviado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Email de bienvenida enviado',
      email: user.email
    })

  } catch (error: any) {
    console.error('❌ Error reenviando email:', error)
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}

