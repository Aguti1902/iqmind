// Script para crear usuario de prueba directamente en PostgreSQL
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

async function createTestUser() {
  console.log('🔧 Creando usuario de prueba...\n')

  // Leer DATABASE_URL de las variables de entorno de Vercel
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ No se encontró POSTGRES_URL o DATABASE_URL')
    console.log('💡 Configura la variable de entorno antes de ejecutar el script')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  const testUser = {
    email: 'test@iqmind.mobi',
    password: 'Test1234!',
    userName: 'Usuario Prueba'
  }

  try {
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(testUser.password, 12)

    // Verificar si el usuario ya existe
    const checkQuery = 'SELECT id, email FROM users WHERE email = $1'
    const checkResult = await pool.query(checkQuery, [testUser.email])

    if (checkResult.rows.length > 0) {
      console.log('⚠️  El usuario ya existe. Actualizando contraseña...\n')
      
      const updateQuery = `
        UPDATE users 
        SET password = $1, user_name = $2, updated_at = NOW()
        WHERE email = $3
      `
      await pool.query(updateQuery, [hashedPassword, testUser.userName, testUser.email])
      
      console.log('✅ Usuario actualizado correctamente!\n')
    } else {
      console.log('📝 Creando nuevo usuario...\n')
      
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const insertQuery = `
        INSERT INTO users (
          id, email, password, user_name, iq, 
          subscription_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `
      await pool.query(insertQuery, [
        id,
        testUser.email,
        hashedPassword,
        testUser.userName,
        0,
        'trial'
      ])
      
      console.log('✅ Usuario creado correctamente!\n')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 CREDENCIALES DE PRUEBA')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:      test@iqmind.mobi')
    console.log('Contraseña: Test1234!')
    console.log('Estado:     Trial (no premium)')
    console.log('Rol:        Usuario normal (NO admin)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('🌐 Puedes iniciar sesión en:')
    console.log('   https://iqmind.mobi/es/login\n')

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await pool.end()
    process.exit(1)
  }
}

createTestUser()

