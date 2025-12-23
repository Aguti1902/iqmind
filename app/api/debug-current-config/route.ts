import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Debug: Leyendo configuración actual de la BD...')
    
    // Leer toda la configuración
    const config = await db.getAllConfig()
    
    const currentMode = config.stripe_mode || 'production'
    
    // Mostrar qué credenciales están disponibles
    const debug = {
      modo_actual: currentMode,
      credenciales_test: {
        publishable_key: config.stripe_test_publishable_key 
          ? `${config.stripe_test_publishable_key.substring(0, 20)}... (${config.stripe_test_publishable_key.length} chars)`
          : '❌ VACÍO',
        secret_key: config.stripe_test_secret_key 
          ? `${config.stripe_test_secret_key.substring(0, 15)}... (${config.stripe_test_secret_key.length} chars)`
          : '❌ VACÍO',
        price_id: config.stripe_test_price_id || '❌ VACÍO',
        webhook_secret: config.stripe_test_webhook_secret 
          ? `${config.stripe_test_webhook_secret.substring(0, 15)}...`
          : '❌ VACÍO'
      },
      credenciales_production: {
        publishable_key: config.stripe_live_publishable_key 
          ? `${config.stripe_live_publishable_key.substring(0, 20)}... (${config.stripe_live_publishable_key.length} chars)`
          : '❌ VACÍO',
        secret_key: config.stripe_live_secret_key 
          ? `${config.stripe_live_secret_key.substring(0, 15)}... (${config.stripe_live_secret_key.length} chars)`
          : '❌ VACÍO',
        price_id: config.stripe_live_price_id || '❌ VACÍO',
        webhook_secret: config.stripe_live_webhook_secret 
          ? `${config.stripe_live_webhook_secret.substring(0, 15)}...`
          : '❌ VACÍO'
      },
      credenciales_activas: currentMode === 'test' ? 'credenciales_test' : 'credenciales_production',
      todas_las_keys_disponibles: Object.keys(config)
    }
    
    return NextResponse.json({
      success: true,
      debug,
      mensaje: `Modo actual: ${currentMode.toUpperCase()}. Usando: ${debug.credenciales_activas}`
    })
    
  } catch (error: any) {
    console.error('Error en debug:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

