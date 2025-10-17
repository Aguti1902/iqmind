import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// Endpoint temporal para forzar modo PRODUCTION
export async function POST() {
  try {
    console.log('🔄 Forzando modo PRODUCTION...')
    
    await db.setConfig('stripe_mode', 'production', 'system')
    
    console.log('✅ Modo cambiado a PRODUCTION')
    
    return NextResponse.json({
      success: true,
      message: '✅ Modo cambiado a PRODUCTION exitosamente',
      note: 'Ahora usa tarjetas REALES. Redeploy en 2 minutos.'
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}

