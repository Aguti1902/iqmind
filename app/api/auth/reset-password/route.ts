import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/lib/auth'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña requeridos' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Verificar el token
    const passwordReset = await db.getPasswordResetByToken(token)

    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Verificar si el token ha expirado
    const now = new Date()
    const expiresAt = new Date(passwordReset.expiresAt)

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Resetear la contraseña
    const success = await resetPassword(passwordReset.email, newPassword)

    if (!success) {
      return NextResponse.json(
        { error: 'Error al restablecer la contraseña' },
        { status: 500 }
      )
    }

    // Marcar el token como usado
    await db.markPasswordResetAsUsed(token)

    return NextResponse.json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
    })

  } catch (error: any) {
    console.error('Error reseteando contraseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
