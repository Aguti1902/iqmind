import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, iq, password } = body

    if (!email || !userName || !iq) {
      return NextResponse.json({ 
        error: 'Email, userName e iq son requeridos' 
      }, { status: 400 })
    }

    console.log('🔄 Creando usuario simple:', { email, userName, iq })

    // Generar contraseña si no se proporciona
    const finalPassword = password || 'TempPass123!'
    const hashedPassword = await hashPassword(finalPassword)

    // Crear usuario directamente
    const user = await db.createUser({
      email,
      userName,
      iq: parseInt(iq),
      password: hashedPassword,
      subscriptionStatus: 'trial',
      trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    })

    console.log(`✅ Usuario creado: ${user.email}`)
    console.log(`🔑 Contraseña: ${finalPassword}`)

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        iq: user.iq,
        subscriptionStatus: user.subscriptionStatus
      },
      password: finalPassword
    })

  } catch (error: any) {
    console.error('❌ Error creando usuario:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
