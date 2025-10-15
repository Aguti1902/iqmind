import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'
import { verifyPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🔍 Debugging usuario:', email)
    
    // Buscar usuario
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado',
        email,
        exists: false
      })
    }

    // Verificar contraseña si se proporciona
    const testPassword = searchParams.get('password')
    let passwordValid = null
    
    if (testPassword && user.password) {
      passwordValid = await verifyPassword(testPassword, user.password)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        iq: user.iq,
        subscriptionStatus: user.subscriptionStatus,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      },
      passwordValid,
      testPassword: testPassword ? 'provided' : 'not provided'
    })

  } catch (error: any) {
    console.error('❌ Error en debug-user:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
