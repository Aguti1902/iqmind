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

    console.log('🔄 Verificando/Creando usuario:', { email, userName, iq })

    // Verificar si el usuario ya existe
    const existingUser = await db.getUserByEmail(email)
    
    if (existingUser) {
      console.log(`✅ Usuario ya existe: ${existingUser.email}`)
      // Usuario ya existe, devolver sus datos
      return NextResponse.json({
        success: true,
        message: 'Usuario encontrado',
        userId: existingUser.id,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          userName: existingUser.userName,
          iq: existingUser.iq,
          subscriptionStatus: existingUser.subscriptionStatus
        },
        existing: true
      })
    }

    // Usuario no existe, crear uno nuevo
    console.log('➕ Creando nuevo usuario...')
    
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
      subscriptionId: undefined,
      trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      accessUntil: undefined,
      lastLogin: undefined
    })

    console.log(`✅ Usuario creado: ${user.email}`)
    console.log(`🔑 Contraseña: ${finalPassword}`)

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        iq: user.iq,
        subscriptionStatus: user.subscriptionStatus
      },
      password: finalPassword,
      existing: false
    })

  } catch (error: any) {
    console.error('❌ Error creando usuario:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
