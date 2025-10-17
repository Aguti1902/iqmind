import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// GET - Obtener la clave pública de Stripe según el modo actual
export async function GET() {
  try {
    // Obtener el modo actual de la base de datos
    const currentMode = await db.getConfigByKey('stripe_mode') || 'test'
    
    // Devolver la clave pública correspondiente
    const publishableKey = currentMode === 'test'
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      return NextResponse.json(
        { error: 'Stripe no configurado correctamente' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      publishableKey,
      mode: currentMode
    })
  } catch (error: any) {
    console.error('Error obteniendo configuración de Stripe:', error)
    // En caso de error, usar modo test por defecto
    return NextResponse.json({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || '',
      mode: 'test'
    })
  }
}

