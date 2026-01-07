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

    console.log('🔑 Plan ID:', config.planId)
    console.log('🏢 Company ID:', config.companyId)

    // NOTA IMPORTANTE: Whop requiere que primero crees un producto en su dashboard
    // La URL correcta depende de cómo hayas configurado tu producto
    
    // Opción 1: URL directa al plan (si el plan está público)
    let checkoutUrl = `https://whop.com/${config.companyId}/${config.planId}`
    
    // Opción 2: Si tienes un enlace de afiliado o checkout personalizado
    // checkoutUrl = `https://whop.com/buy/${config.planId}`
    
    // Añadir email como parámetro si está disponible
    if (email) {
      checkoutUrl += `?email=${encodeURIComponent(email)}`
    }

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

