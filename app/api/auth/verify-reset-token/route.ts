import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      )
    }

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

    return NextResponse.json({
      success: true,
      email: passwordReset.email,
    })

  } catch (error: any) {
    console.error('Error verificando token:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
