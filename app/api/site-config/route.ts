import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

// GET - Obtener configuración pública del sitio (precios, días de prueba, etc)
export async function GET() {
  try {
    console.log('🔍 [site-config] Obteniendo configuración pública...')
    
    const config = await db.getAllConfig()
    
    // Devolver solo información pública (NO credenciales)
    const publicConfig = {
      payment_provider: 'stripe', // Siempre Stripe
      payment_mode: config.payment_mode || 'test',
      trial_days: parseInt(config.trial_days || '15'),
      subscription_price: parseFloat(config.subscription_price || '19.99'),
      initial_payment: parseFloat(config.initial_payment || '0.50'),
      stripe_mode: config.stripe_mode || 'production' // Mantener por compatibilidad
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
        payment_provider: 'stripe',
        payment_mode: 'test',
        trial_days: 15,
        subscription_price: 19.99,
        initial_payment: 0.50,
        stripe_mode: 'production'
      },
      error: error.message
    })
  }
}

