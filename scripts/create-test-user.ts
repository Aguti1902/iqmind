/**
 * Script para crear un usuario de prueba con datos completos
 * 
 * Usuario de prueba:
 * Email: test@mindmetric.io
 * Password: Test1234!
 */

import { db } from '../lib/database-postgres'
import { hashPassword } from '../lib/auth'

async function createTestUser() {
  console.log('🔧 Creando usuario de prueba...\n')

  try {
    // 1. Datos del usuario de prueba
    const testEmail = 'test@mindmetric.io'
    const testPassword = 'Test1234!'
    const hashedPassword = await hashPassword(testPassword)
    
    // Verificar si ya existe
    const existingUser = await db.getUserByEmail(testEmail)
    
    let userId: string
    
    if (existingUser) {
      console.log('⚠️  Usuario ya existe, actualizando...')
      userId = existingUser.id
      
      // Actualizar usuario
      await db.updateUser(userId, {
        password: hashedPassword,
        userName: 'Usuario de Prueba',
        subscriptionStatus: 'active',
        trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
        accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        iq: 125
      })
    } else {
      console.log('✅ Creando nuevo usuario...')
      
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

    console.log(`\n✅ Usuario creado/actualizado con ID: ${userId}`)

    // 2. Crear resultados de tests de IQ (varios a lo largo del tiempo)
    console.log('\n📊 Creando resultados de tests de IQ...')
    
    const iqTestResults = [
      { iq: 118, correctAnswers: 14, days: 60 },
      { iq: 122, correctAnswers: 16, days: 30 },
      { iq: 125, correctAnswers: 17, days: 7 },
    ]

    for (const result of iqTestResults) {
      const testDate = new Date(Date.now() - result.days * 24 * 60 * 60 * 1000)
      
      await db.createTestResult({
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        iq: result.iq,
        correctAnswers: result.correctAnswers,
        timeElapsed: 1200 - (result.days * 5), // Simulado
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
      
      console.log(`  ✓ Test de IQ ${result.iq} (hace ${result.days} días)`)
    }

    // 3. Mensaje final
    console.log('\n' + '='.repeat(60))
    console.log('🎉 ¡USUARIO DE PRUEBA CREADO EXITOSAMENTE!')
    console.log('='.repeat(60))
    console.log('\n📧 Email:    test@mindmetric.io')
    console.log('🔑 Password: Test1234!')
    console.log('\n✅ Suscripción: ACTIVA (válida por 1 año)')
    console.log('🧠 IQ Actual: 125')
    console.log('📊 Tests completados: 3 tests de IQ')
    console.log('\n🌐 URL Login: http://localhost:3000/es/login')
    console.log('\n' + '='.repeat(60))
    
  } catch (error: any) {
    console.error('❌ Error creando usuario de prueba:', error)
    console.error('Stack:', error.stack)
    throw error
  }
}

// Ejecutar
createTestUser()
  .then(() => {
    console.log('\n✨ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  })

