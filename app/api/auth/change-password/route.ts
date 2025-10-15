import { NextRequest, NextResponse } from 'next/server'
import { changePassword, requireAuth } from '@/lib/auth'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const authData = requireAuth(token)
    
    if (!authData) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva contraseña requeridas' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const success = await changePassword(authData.userId, currentPassword, newPassword)

    if (!success) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña cambiada exitosamente',
    })

  } catch (error: any) {
    console.error('Error cambiando contraseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
