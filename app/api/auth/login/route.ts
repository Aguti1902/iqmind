import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Intento de login:', { email, passwordLength: password?.length })

    if (!email || !password) {
      console.log('❌ Faltan credenciales')
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      )
    }

    const result = await authenticateUser(email, password)

    if (!result) {
      console.log('❌ Credenciales inválidas para:', email)
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    console.log('✅ Login exitoso para:', email)

    // No enviar la contraseña hasheada en la respuesta
    const { password: _, ...userWithoutPassword } = result.user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: result.token,
    })

  } catch (error: any) {
    console.error('❌ Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
