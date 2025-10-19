// app/api/admin/set-stripe/route.ts
// Endpoint temporal para forzar Stripe como proveedor

import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Forzar Stripe como proveedor
    await db.setConfig('payment_provider', 'stripe', 'system')
    
    console.log('✅ Proveedor cambiado a Stripe')
    
    return NextResponse.json({
      success: true,
      message: 'Proveedor cambiado a Stripe exitosamente',
      provider: 'stripe'
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      error: 'Error cambiando proveedor',
      details: error.message
    }, { status: 500 })
  }
}

