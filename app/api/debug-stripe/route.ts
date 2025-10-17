import { NextResponse } from 'next/server'
import { getStripeConfig } from '@/lib/stripe-config'
import Stripe from 'stripe'

export async function GET() {
  try {
    console.log('🔍 INICIANDO DEBUG DE STRIPE...')
    
    // 1. Obtener configuración
    const config = await getStripeConfig()
    console.log('📦 Config obtenida:', {
      mode: config.mode,
      hasPublishableKey: !!config.publishableKey,
      hasSecretKey: !!config.secretKey,
      publishableKeyPrefix: config.publishableKey?.substring(0, 20),
      secretKeyPrefix: config.secretKey?.substring(0, 15),
      priceId: config.priceId
    })

    if (!config.secretKey) {
      return NextResponse.json({
        error: 'No hay secretKey configurada',
        config: {
          mode: config.mode,
          hasPublishableKey: !!config.publishableKey,
          hasSecretKey: false
        }
      }, { status: 500 })
    }

    // 2. Inicializar Stripe
    const stripe = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16',
    })
    console.log('✅ Stripe inicializado')

    // 3. Intentar crear un PaymentIntent de prueba
    try {
      console.log('💳 Intentando crear PaymentIntent de prueba...')
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 50,
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          test: 'debug',
          timestamp: new Date().toISOString()
        }
      })

      console.log('✅ PaymentIntent creado exitosamente:', paymentIntent.id)

      // 4. Verificar que el PaymentIntent es compatible con la publishable key
      const piIdPrefix = paymentIntent.id.substring(0, 8)
      const isTestPI = paymentIntent.livemode === false
      const isTestPK = config.publishableKey?.startsWith('pk_test_')

      return NextResponse.json({
        success: true,
        message: '✅ Las credenciales de Stripe funcionan correctamente',
        details: {
          mode: config.mode,
          publishableKey: config.publishableKey?.substring(0, 20) + '...',
          secretKeyType: config.secretKey?.startsWith('sk_test_') ? 'TEST' : 'LIVE',
          paymentIntentCreated: true,
          paymentIntentId: paymentIntent.id,
          paymentIntentMode: isTestPI ? 'TEST' : 'LIVE',
          publishableKeyMode: isTestPK ? 'TEST' : 'LIVE',
          keysMatch: isTestPI === isTestPK,
          priceId: config.priceId,
          clientSecret: paymentIntent.client_secret?.substring(0, 30) + '...',
        },
        recommendation: isTestPI === isTestPK 
          ? '✅ Las claves coinciden. El problema debe ser otro.'
          : '❌ PROBLEMA: Las claves no coinciden. El PaymentIntent es ' + (isTestPI ? 'TEST' : 'LIVE') + ' pero la publishable key es ' + (isTestPK ? 'TEST' : 'LIVE')
      })

    } catch (stripeError: any) {
      console.error('❌ Error creando PaymentIntent:', stripeError)
      return NextResponse.json({
        error: 'Error al crear PaymentIntent de prueba',
        details: {
          message: stripeError.message,
          type: stripeError.type,
          code: stripeError.code,
          secretKeyType: config.secretKey?.startsWith('sk_test_') ? 'TEST' : 'LIVE',
        },
        recommendation: 'Las credenciales de Stripe no son válidas o no tienen permisos'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Error general:', error)
    return NextResponse.json({
      error: 'Error en el debug',
      details: error.message
    }, { status: 500 })
  }
}

