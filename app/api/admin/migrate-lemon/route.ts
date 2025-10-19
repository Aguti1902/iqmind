// app/api/admin/migrate-lemon/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userData = verifyToken(token)
    
    if (!userData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar si es administrador
    const isAdmin = await db.isAdmin(userData.email)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    console.log('🔧 Iniciando migración a Lemon Squeezy...')

    // Obtener conexión a la base de datos
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('No se encontró POSTGRES_URL o DATABASE_URL')
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })

    // Insertar configuraciones de Lemon Squeezy
    const sqlStatements = [
      // Configuración general
      `INSERT INTO site_config (key, value, description) VALUES
        ('payment_provider', 'lemonsqueezy', 'Proveedor de pagos: stripe o lemonsqueezy')
       ON CONFLICT (key) DO NOTHING`,
      
      `INSERT INTO site_config (key, value, description) VALUES
        ('payment_mode', 'test', 'Modo de pago: test o production')
       ON CONFLICT (key) DO NOTHING`,
      
      // Lemon Squeezy Test
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_test_api_key', '', 'API Key de Lemon Squeezy (test)')
       ON CONFLICT (key) DO NOTHING`,
      
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_test_store_id', '', 'Store ID de Lemon Squeezy (test)')
       ON CONFLICT (key) DO NOTHING`,
      
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_test_variant_id', '', 'Variant ID del producto/suscripción (test)')
       ON CONFLICT (key) DO NOTHING`,
      
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_test_webhook_secret', '', 'Webhook secret de Lemon Squeezy (test)')
       ON CONFLICT (key) DO NOTHING`,
      
      // Lemon Squeezy Production
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_live_api_key', '', 'API Key de Lemon Squeezy (production)')
       ON CONFLICT (key) DO NOTHING`,
      
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_live_store_id', '', 'Store ID de Lemon Squeezy (production)')
       ON CONFLICT (key) DO NOTHING`,
      
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_live_variant_id', '', 'Variant ID del producto/suscripción (production)')
       ON CONFLICT (key) DO NOTHING`,
      
      `INSERT INTO site_config (key, value, description) VALUES
        ('lemonsqueezy_live_webhook_secret', '', 'Webhook secret de Lemon Squeezy (production)')
       ON CONFLICT (key) DO NOTHING`,
    ]

    const results = []
    for (const sql of sqlStatements) {
      try {
        await pool.query(sql)
        results.push('✅')
      } catch (error: any) {
        console.error('Error ejecutando SQL:', error.message)
        results.push('❌ ' + error.message)
      }
    }

    await pool.end()

    console.log('✅ Migración completada')

    return NextResponse.json({
      success: true,
      message: 'Migración a Lemon Squeezy completada exitosamente',
      results,
      note: 'Ahora puedes configurar tus credenciales de Lemon Squeezy en el panel de admin'
    }, { status: 200 })

  } catch (error: any) {
    console.error('❌ Error en migración:', error)
    return NextResponse.json({
      error: 'Error ejecutando migración',
      details: error.message
    }, { status: 500 })
  }
}

