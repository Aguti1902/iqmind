import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { hashPassword } from '@/lib/auth'
export const dynamic = 'force-dynamic'

/**
 * Endpoint simple para crear usuario de prueba
 * Solo ejecutar una vez para crear el usuario
 */
export async function GET(request: NextRequest) {
  try {
    const testUser = {
      email: 'test@iqmind.mobi',
      password: 'Test1234!',
      userName: 'Usuario Prueba'
    }

    // Verificar si ya existe
    const existing = await db.getUserByEmail(testUser.email)
    
    if (existing) {
      // Actualizar contraseña
      const hashedPassword = await hashPassword(testUser.password)
      
      await db.updateUser(existing.id, {
        password: hashedPassword,
        userName: testUser.userName
      })
      
      return NextResponse.json({
        success: true,
        message: 'Usuario de prueba actualizado',
        credentials: {
          email: testUser.email,
          password: testUser.password,
          loginUrl: 'https://iqmind.mobi/es/login'
        },
        note: 'Este usuario NO es admin y está en estado trial (sin premium)'
      })
    }

    // Crear nuevo usuario
    const hashedPassword = await hashPassword(testUser.password)
    
    await db.createUser({
      email: testUser.email,
      password: hashedPassword,
      userName: testUser.userName,
      iq: 0,
      subscriptionStatus: 'trial',
      subscriptionId: undefined,
      trialEndDate: undefined,
      accessUntil: undefined
    })
    
    return NextResponse.json({
      success: true,
      message: 'Usuario de prueba creado exitosamente',
      credentials: {
        email: testUser.email,
        password: testUser.password,
        loginUrl: 'https://iqmind.mobi/es/login'
      },
      note: 'Este usuario NO es admin y está en estado trial (sin premium)'
    })

  } catch (error: any) {
    console.error('❌ Error creando usuario de prueba:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario de prueba', details: error.message },
      { status: 500 }
    )
  }
}

