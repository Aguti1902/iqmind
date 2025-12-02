import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * API para crear un usuario de prueba con datos completos
 * GET /api/create-test-user
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Creando usuario de prueba...')

    // Datos del usuario de prueba
    const testEmail = 'test@mindmetric.io'
    const testPassword = 'Test1234!'
    const hashedPassword = await hashPassword(testPassword)
    
    // Verificar si ya existe
    const existingUser = await db.getUserByEmail(testEmail)
    
    let userId: string
    let isNew = false
    
    if (existingUser) {
      console.log('⚠️  Usuario ya existe, actualizando...')
      userId = existingUser.id
      
      // Actualizar usuario
      await db.updateUser(userId, {
        password: hashedPassword,
        userName: 'Usuario de Prueba',
        subscriptionStatus: 'active',
        trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        iq: 125
      })
    } else {
      console.log('✅ Creando nuevo usuario...')
      isNew = true
      
      // Crear nuevo usuario
      const newUser = await db.createUser({
        email: testEmail,
        password: hashedPassword,
        userName: 'Usuario de Prueba',
        subscriptionStatus: 'active',
        trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        iq: 125
      })
      
      userId = newUser.id
    }

    console.log(`✅ Usuario ${isNew ? 'creado' : 'actualizado'} con ID: ${userId}`)

    // Crear resultados de tests de IQ (varios a lo largo del tiempo)
    console.log('📊 Creando resultados de tests de IQ...')
    
    const iqTestResults = [
      { iq: 118, correctAnswers: 14, days: 60 },
      { iq: 122, correctAnswers: 16, days: 30 },
      { iq: 125, correctAnswers: 17, days: 7 },
    ]

    const createdTests = []

    for (const result of iqTestResults) {
      const testDate = new Date(Date.now() - result.days * 24 * 60 * 60 * 1000)
      
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await db.createTestResult({
        id: testId,
        userId: userId,
        iq: result.iq,
        correctAnswers: result.correctAnswers,
        timeElapsed: 1200 - (result.days * 5),
        answers: Array(20).fill(null).map((_, i) => 
          i < result.correctAnswers ? Math.floor(Math.random() * 6) : null
        ),
        categoryScores: {
          logical: 85 + result.days % 10,
          spatial: 90 - result.days % 5,
          numerical: 80 + result.days % 8,
          verbal: 88 + result.days % 6
        },
        completedAt: testDate.toISOString()
      })
      
      createdTests.push({
        iq: result.iq,
        daysAgo: result.days
      })
      
      console.log(`  ✓ Test de IQ ${result.iq} (hace ${result.days} días)`)
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: isNew ? 'Usuario de prueba creado exitosamente' : 'Usuario de prueba actualizado exitosamente',
      user: {
        email: testEmail,
        password: testPassword,
        id: userId,
        iq: 125,
        subscriptionStatus: 'active',
        testsCreated: createdTests.length
      },
      instructions: {
        email: 'test@mindmetric.io',
        password: 'Test1234!',
        loginUrl: '/es/login',
        dashboardUrl: '/es/cuenta',
        subscriptionExpires: '1 año desde hoy',
        testsCompletados: createdTests.length
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('❌ Error creando usuario de prueba:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Error interno del servidor',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

