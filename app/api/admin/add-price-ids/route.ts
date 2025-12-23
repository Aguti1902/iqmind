import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

/**
 * Migración para añadir campos de Price IDs separados para planes quincenal y mensual
 */
export async function GET() {
  try {
    console.log('🔄 Añadiendo campos de Price IDs...')

    // Añadir campos para plan quincenal (cada 2 semanas - €9.99)
    await db.setConfig('stripe_test_price_id_quincenal', '', 'Price ID plan quincenal TEST (€9.99 cada 2 semanas)')
    await db.setConfig('stripe_live_price_id_quincenal', '', 'Price ID plan quincenal LIVE (€9.99 cada 2 semanas)')
    
    // Añadir campos para plan mensual (€19.99)
    await db.setConfig('stripe_test_price_id_mensual', '', 'Price ID plan mensual TEST (€19.99 al mes)')
    await db.setConfig('stripe_live_price_id_mensual', '', 'Price ID plan mensual LIVE (€19.99 al mes)')
    
    console.log('✅ Campos añadidos correctamente')

    return NextResponse.json({
      success: true,
      message: 'Price IDs añadidos correctamente',
      fields: [
        'stripe_test_price_id_quincenal',
        'stripe_live_price_id_quincenal',
        'stripe_test_price_id_mensual',
        'stripe_live_price_id_mensual'
      ]
    })

  } catch (error: any) {
    console.error('❌ Error añadiendo Price IDs:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

