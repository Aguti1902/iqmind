import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// GET - Obtener la clave pública de Stripe según el modo actual
export async function GET() {
  try {
    console.log('🔍 [stripe-config API] Obteniendo configuración...')
    
    // Obtener TODA la configuración desde la BD
    const config = await db.getAllConfig()
    const currentMode = config.stripe_mode || 'test'
    
    console.log('📊 [stripe-config API] Modo:', currentMode)
    
    // Leer la clave pública desde la BD (NO de variables de entorno)
    const publishableKey = currentMode === 'test'
      ? config.stripe_test_publishable_key
      : config.stripe_live_publishable_key
    
    console.log('🔑 [stripe-config API] Publishable Key:', publishableKey?.substring(0, 20) + '...')
    
    if (!publishableKey) {
      console.error('❌ [stripe-config API] No hay publishable key en la BD')
      return NextResponse.json(
        { error: 'Stripe no configurado correctamente en la base de datos' },
        { status: 500 }
      )
    }

    console.log('✅ [stripe-config API] Devolviendo configuración')
    return NextResponse.json({
      publishableKey,
      mode: currentMode
    })
  } catch (error: any) {
    console.error('❌ [stripe-config API] Error:', error)
    return NextResponse.json({
      error: 'Error obteniendo configuración de Stripe',
      details: error.message
    }, { status: 500 })
  }
}

