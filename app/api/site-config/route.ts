import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// GET - Obtener configuración pública del sitio (precios, días de prueba, etc)
export async function GET() {
  try {
    console.log('🔍 [site-config] Obteniendo configuración pública...')
    
    const config = await db.getAllConfig()
    
    // Devolver solo información pública (NO credenciales)
    const publicConfig = {
      payment_provider: config.payment_provider || 'fastspring',
      payment_mode: config.payment_mode || 'production',
      trial_days: parseInt(config.trial_days || '2'),
      subscription_price: parseFloat(config.subscription_price || '9.99'),
      initial_payment: parseFloat(config.initial_payment || '0.50')
    }
    
    console.log('✅ [site-config] Configuración pública:', publicConfig)
    
    return NextResponse.json({
      success: true,
      config: publicConfig
    })
    
  } catch (error: any) {
    console.error('❌ [site-config] Error:', error)
    // Devolver valores por defecto si hay error
    return NextResponse.json({
      success: false,
      config: {
        payment_provider: 'fastspring',
        payment_mode: 'production',
        trial_days: 2,
        subscription_price: 9.99,
        initial_payment: 0.50
      },
      error: error.message
    })
  }
}

