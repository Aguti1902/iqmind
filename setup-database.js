#!/usr/bin/env node

/**
 * Script de configuración automática de la base de datos
 * Crea todas las tablas y el usuario admin
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres:ceBbFkVimnxRTPQAYtxNgYBGXWUVquxT@switchback.proxy.rlwy.net:58127/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de base de datos...\n');

  try {
    // 1. Crear tablas
    console.log('📊 Paso 1: Creando tablas...');
    
    await pool.query(`
      -- Tabla de usuarios
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
      );
    `);
    console.log('   ✅ Tabla users creada');

    await pool.query(`
      -- Tabla de resultados de tests
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
      );
    `);
    console.log('   ✅ Tabla test_results creada');

    await pool.query(`
      -- Tabla de tokens de reseteo de contraseña
      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✅ Tabla password_resets creada');

    await pool.query(`
      -- Tabla de configuración del sitio
      CREATE TABLE IF NOT EXISTS site_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(255)
      );
    `);
    console.log('   ✅ Tabla site_config creada');

    // 2. Insertar configuración por defecto
    console.log('\n⚙️  Paso 2: Insertando configuración por defecto...');
    
    await pool.query(`
      INSERT INTO site_config (key, value, description) VALUES
        ('payment_mode', 'test', 'Modo de pago: test o production'),
        ('stripe_test_publishable_key', '', 'Clave pública de Stripe (test)'),
        ('stripe_test_secret_key', '', 'Clave secreta de Stripe (test)'),
        ('stripe_test_webhook_secret', '', 'Webhook secret de Stripe (test)'),
        ('stripe_live_publishable_key', '', 'Clave pública de Stripe (live)'),
        ('stripe_live_secret_key', '', 'Clave secreta de Stripe (live)'),
        ('stripe_live_webhook_secret', '', 'Webhook secret de Stripe (live)'),
        ('stripe_test_price_id', '', 'Price ID del producto (test)'),
        ('stripe_live_price_id', '', 'Price ID del producto (live)'),
        ('stripe_test_price_id_quincenal', '', 'Price ID quincenal (test)'),
        ('stripe_live_price_id_quincenal', '', 'Price ID quincenal (live)'),
        ('stripe_test_price_id_mensual', '', 'Price ID mensual (test)'),
        ('stripe_live_price_id_mensual', '', 'Price ID mensual (live)'),
        ('subscription_price', '9.99', 'Precio de la suscripción mensual'),
        ('trial_days', '30', 'Días de prueba gratuita'),
        ('initial_payment', '0.50', 'Pago único para acceder al resultado del test'),
        ('admin_emails', '', 'Emails de administradores separados por coma')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('   ✅ Configuración insertada');

    // 3. Crear índices
    console.log('\n🔍 Paso 3: Creando índices...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
      CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at);
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
      CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
      CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);
    `);
    console.log('   ✅ Índices creados');

    // 4. Verificar tablas
    console.log('\n🔎 Paso 4: Verificando tablas creadas...');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('   📋 Tablas encontradas:');
    result.rows.forEach(row => {
      console.log(`      ✅ ${row.table_name}`);
    });

    // 5. Crear usuario admin
    console.log('\n👤 Paso 5: Creando usuario admin...');
    
    const adminEmail = 'admin@mindmetric.io';
    const adminPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminId = `user_admin_${Date.now()}`;

    // Verificar si ya existe
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('   ℹ️  Usuario admin ya existe, actualizando contraseña...');
      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, adminEmail]
      );
    } else {
      console.log('   ✅ Creando nuevo usuario admin...');
      await pool.query(`
        INSERT INTO users (id, email, password, user_name, subscription_status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [adminId, adminEmail, hashedPassword, 'Admin', 'active']);
    }

    // Actualizar admin_emails en site_config
    await pool.query(`
      INSERT INTO site_config (key, value, description)
      VALUES ('admin_emails', $1, 'Emails de administradores separados por coma')
      ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
    `, [adminEmail]);

    console.log('   ✅ Usuario admin configurado');

    // 6. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('✅ ¡BASE DE DATOS CONFIGURADA EXITOSAMENTE!');
    console.log('='.repeat(60));
    console.log('\n📊 RESUMEN:');
    console.log('   ✅ 4 tablas creadas');
    console.log('   ✅ 17 configuraciones insertadas');
    console.log('   ✅ 6 índices creados');
    console.log('   ✅ Usuario admin configurado');
    
    console.log('\n👤 CREDENCIALES DE ADMIN:');
    console.log('   📧 Email:    admin@mindmetric.io');
    console.log('   🔑 Password: Admin123!');
    console.log('   🌐 URL:      https://mindmetric.io/admin');
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Actualizar POSTGRES_URL en Vercel con:');
    console.log('      postgresql://postgres:ceBbFkVimnxRTPQAYtxNgYBGXWUVquxT@switchback.proxy.rlwy.net:58127/railway');
    console.log('   2. Redeploy en Vercel');
    console.log('   3. Acceder a https://mindmetric.io/admin');
    console.log('   4. Configurar claves de Stripe');
    console.log('   5. ¡Probar el flujo completo!');
    
    console.log('\n🎉 ¡Todo listo para comenzar!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar setup
setupDatabase();

