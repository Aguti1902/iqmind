import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// GET - Obtener la clave pública de Stripe según el modo actual
export async function GET() {
  try {
    console.log('🔍 [stripe-config API] Obteniendo configuración...')
    
    let publishableKey: string | undefined
    let currentMode = 'test'
    
    // INTENTO 1: Leer desde la BD (si está disponible)
    try {
      const config = await db.getAllConfig()
      currentMode = config.stripe_mode || process.env.STRIPE_MODE || 'test'
      
      console.log('📊 [stripe-config API] Modo desde BD:', currentMode)
      
      publishableKey = currentMode === 'test'
        ? config.stripe_test_publishable_key
        : config.stripe_live_publishable_key
      
      if (publishableKey) {
        console.log('✅ [stripe-config API] Clave encontrada en BD')
      }
    } catch (dbError: any) {
      console.warn('⚠️ [stripe-config API] No se pudo leer de BD:', dbError.message)
    }
    
    // INTENTO 2: Fallback a variables de entorno de Vercel
    if (!publishableKey) {
      console.log('🔄 [stripe-config API] Usando variables de entorno como fallback')
      currentMode = process.env.STRIPE_MODE || 'test'
      publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      
      if (publishableKey) {
        console.log('✅ [stripe-config API] Clave encontrada en variables de entorno')
      }
    }
    
    console.log('🔑 [stripe-config API] Publishable Key:', publishableKey?.substring(0, 20) + '...')
    
    if (!publishableKey) {
      console.error('❌ [stripe-config API] No hay publishable key en BD ni en variables de entorno')
      return NextResponse.json(
        { error: 'Stripe no configurado. Añade NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en Vercel' },
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

