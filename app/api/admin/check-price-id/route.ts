import { NextRequest, NextResponse } from 'next/server'
import { getStripeConfig } from '@/lib/stripe-config'

export const dynamic = 'force-dynamic'

// GET - Verificar si el priceId está configurado correctamente
export async function GET(request: NextRequest) {
  try {
    const stripeConfig = await getStripeConfig()
    
    const result = {
      has_price_id: !!stripeConfig.priceId,
      price_id: stripeConfig.priceId || 'NO CONFIGURADO',
      mode: stripeConfig.mode,
      has_secret_key: !!stripeConfig.secretKey,
      has_publishable_key: !!stripeConfig.publishableKey,
      has_webhook_secret: !!stripeConfig.webhookSecret,
      message: stripeConfig.priceId 
        ? '✅ Price ID configurado correctamente' 
        : '❌ CRÍTICO: Price ID NO está configurado. Las suscripciones NO se crearán sin él.',
      recommendation: stripeConfig.priceId 
        ? 'Todo está bien configurado' 
        : 'Añade stripe_test_price_id_mensual o stripe_live_price_id_mensual en la base de datos según el modo actual'
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

