import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: NextRequest) {
  try {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    
    if (!connectionString) {
      return NextResponse.json({ 
        error: 'No se encontró DATABASE_URL' 
      }, { status: 500 })
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })

    // Crear tabla de configuración
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(255)
      )
    `)

    // Insertar valores por defecto
    await pool.query(`
      INSERT INTO site_config (key, value, description) VALUES
        ('stripe_mode', 'test', 'Modo de Stripe: test o production'),
        ('stripe_test_publishable_key', '', 'Clave pública de Stripe (test)'),
        ('stripe_test_secret_key', '', 'Clave secreta de Stripe (test)'),
        ('stripe_live_publishable_key', '', 'Clave pública de Stripe (live)'),
        ('stripe_live_secret_key', '', 'Clave secreta de Stripe (live)'),
        ('stripe_test_price_id', '', 'Price ID del producto (test)'),
        ('stripe_live_price_id', '', 'Price ID del producto (live)'),
        ('subscription_price', '9.99', 'Precio de la suscripción mensual'),
        ('trial_days', '7', 'Días de prueba gratuita'),
        ('initial_payment', '0.50', 'Pago inicial para acceder al resultado'),
        ('admin_emails', '', 'Emails de administradores separados por coma')
      ON CONFLICT (key) DO NOTHING
    `)

    // Crear índice
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key)
    `)

    await pool.end()

    return NextResponse.json({ 
      message: 'Migración completada exitosamente',
      success: true
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error en migración:', error)
    return NextResponse.json({ 
      error: 'Error ejecutando migración',
      details: error.message
    }, { status: 500 })
  }
}

