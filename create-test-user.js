const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// URL de conexión a Railway PostgreSQL
const connectionString = 'postgresql://postgres:ceBbFkVimnxRTPQAYtxNgYBGXWUVquxT@switchback.proxy.rlwy.net:58127/railway'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function createTestUser() {
  try {
    console.log('🔄 Conectando a la base de datos...')
    
    // Datos del usuario de prueba
    const testEmail = 'test@mindmetric.io'
    const testPassword = 'Test1234!'
    const testName = 'Usuario de Prueba'
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    // Verificar si ya existe
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    )
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  El usuario de prueba ya existe')
      console.log('📧 Email:', testEmail)
      console.log('🔑 Contraseña:', testPassword)
      console.log('\n✅ Puedes usarlo para probar la cancelación')
      return
    }
    
    // Crear el usuario
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const trialEndDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 días
    
    await pool.query(
      `INSERT INTO users (
        id, 
        email, 
        password, 
        user_name, 
        iq, 
        subscription_status,
        subscription_id, 
        trial_end_date, 
        access_until, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        testEmail,
        hashedPassword,
        testName,
        125, // IQ de ejemplo
        'trialing', // Estado trial
        'sub_test_' + Date.now(), // ID de suscripción de prueba
        trialEndDate,
        trialEndDate,
        now,
        now
      ]
    )
    
    console.log('\n✅ Usuario de prueba creado exitosamente!\n')
    console.log('📧 Email:', testEmail)
    console.log('🔑 Contraseña:', testPassword)
    console.log('👤 Nombre:', testName)
    console.log('🎯 Estado:', 'Trial (15 días)')
    console.log('📅 Trial hasta:', new Date(trialEndDate).toLocaleDateString('es-ES'))
    console.log('\n🔗 Puedes iniciar sesión en: https://mindmetric.io/es/login')
    console.log('🔗 O ir directo a cancelar: https://mindmetric.io/es/cancelar-suscripcion')
    console.log('\n💡 Tip: Usa este usuario para probar el flujo completo de cancelación')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

// Ejecutar
createTestUser()

