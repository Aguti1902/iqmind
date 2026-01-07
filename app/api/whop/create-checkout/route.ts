// app/api/whop/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getWhopClient, getWhopConfig, getWhopUrls, SUBSCRIPTION_CONFIG } from '@/lib/whop-config'

export const dynamic = 'force-dynamic'

/**
 * Crea una sesión de checkout en Whop
 * POST /api/whop/create-checkout
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🛒 [create-checkout] Iniciando creación de checkout en Whop...')
    
    const body = await request.json()
    const { email, userName, testType = 'iq' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    console.log('📧 Email:', email)
    console.log('👤 Usuario:', userName)
    console.log('📊 Tipo de test:', testType)

    // Obtener configuración de Whop
    const config = await getWhopConfig()
    const urls = getWhopUrls()
    const client = await getWhopClient()

    console.log('🔑 Plan ID:', config.planId)
    console.log('🏢 Company ID:', config.companyId)

    // Crear checkout en Whop
    // Nota: Whop maneja la creación de membresías automáticamente
    // cuando el usuario completa el pago
    
    const checkoutUrl = `https://whop.com/checkout/${config.planId}?email=${encodeURIComponent(email)}`

    console.log('✅ [create-checkout] URL de checkout generada:', checkoutUrl)

    return NextResponse.json({
      success: true,
      checkoutUrl,
      planId: config.planId,
      trialDays: SUBSCRIPTION_CONFIG.trialDays,
      initialPayment: SUBSCRIPTION_CONFIG.initialPayment,
    })

  } catch (error: any) {
    console.error('❌ [create-checkout] Error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Error al crear checkout',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}

