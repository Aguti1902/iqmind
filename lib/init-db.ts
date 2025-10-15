import { sql } from '@vercel/postgres'

export async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...')
    
    // Crear tabla users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        iq INTEGER DEFAULT 0,
        subscription_status VARCHAR(50) DEFAULT 'trial',
        subscription_id VARCHAR(255),
        trial_end_date TIMESTAMP,
        access_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `
    console.log('✅ Tabla users creada')
    
    // Crear tabla test_results
    await sql`
      CREATE TABLE IF NOT EXISTS test_results (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        iq INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        time_elapsed INTEGER NOT NULL,
        answers JSONB,
        category_scores JSONB,
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
    console.log('✅ Tabla test_results creada')
    
    // Crear tabla password_resets
    await sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Tabla password_resets creada')
    
    // Crear índices
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)`
    await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)`
    console.log('✅ Índices creados')
    
    console.log('✅ Base de datos inicializada correctamente')
    return { success: true }
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error)
    return { success: false, error }
  }
}

