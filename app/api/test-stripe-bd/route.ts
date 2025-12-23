import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🧪 TEST: Leyendo credenciales TEST de la BD...')
    
    const config = await db.getAllConfig()
    
    const testPublishableKey = config.stripe_test_publishable_key
    const testSecretKey = config.stripe_test_secret_key
    
    console.log('📋 Credenciales leídas:')
    console.log('  - Publishable:', testPublishableKey?.substring(0, 30) + '...')
    console.log('  - Secret:', testSecretKey?.substring(0, 20) + '...')
    console.log('  - Longitud PK:', testPublishableKey?.length)
    console.log('  - Longitud SK:', testSecretKey?.length)
    
    if (!testSecretKey) {
      return NextResponse.json({
        error: 'No hay secret key en la BD'
      }, { status: 500 })
    }
    
    // Verificar si hay espacios o caracteres raros
    const hasLeadingSpace = testSecretKey[0] === ' '
    const hasTrailingSpace = testSecretKey[testSecretKey.length - 1] === ' '
    const hasNewlines = testSecretKey.includes('\n')
    const hasReturns = testSecretKey.includes('\r')
    
    console.log('🔍 Verificación de formato:')
    console.log('  - Empieza con espacio:', hasLeadingSpace)
    console.log('  - Termina con espacio:', hasTrailingSpace)
    console.log('  - Tiene saltos de línea:', hasNewlines)
    console.log('  - Tiene retornos:', hasReturns)
    
    // Limpiar la clave (por si acaso)
    const cleanedSecretKey = testSecretKey.trim()
    
    console.log('🧹 Clave limpia:', cleanedSecretKey.substring(0, 20) + '...')
    console.log('  - Longitud después de limpiar:', cleanedSecretKey.length)
    
    // Intentar inicializar Stripe
    console.log('🔧 Inicializando Stripe...')
    const stripe = new Stripe(cleanedSecretKey, {
      apiVersion: '2023-10-16',
    })
    
    // Intentar crear un PaymentIntent de prueba
    console.log('💳 Intentando crear PaymentIntent...')
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 50,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        test: 'true',
        source: 'test-stripe-bd'
      }
    })
    
    console.log('✅ PaymentIntent creado:', paymentIntent.id)
    
    // Verificar compatibilidad con la publishable key
    const piIsTest = paymentIntent.livemode === false
    const pkIsTest = testPublishableKey?.startsWith('pk_test_')
    
    return NextResponse.json({
      success: true,
      message: '✅ Las credenciales de la BD funcionan correctamente',
      test_results: {
        secret_key_format: {
          longitud_original: testSecretKey.length,
          longitud_limpia: cleanedSecretKey.length,
          tiene_espacios_inicio: hasLeadingSpace,
          tiene_espacios_final: hasTrailingSpace,
          tiene_saltos_linea: hasNewlines,
          claves_diferentes: testSecretKey !== cleanedSecretKey
        },
        payment_intent: {
          id: paymentIntent.id,
          modo: piIsTest ? 'TEST' : 'LIVE',
          client_secret: paymentIntent.client_secret?.substring(0, 30) + '...'
        },
        compatibilidad: {
          pi_es_test: piIsTest,
          pk_es_test: pkIsTest,
          coinciden: piIsTest === pkIsTest
        }
      },
      recommendation: (piIsTest === pkIsTest)
        ? '✅ Todo correcto. Las claves coinciden.'
        : '❌ PROBLEMA: El PaymentIntent es ' + (piIsTest ? 'TEST' : 'LIVE') + ' pero la PK es ' + (pkIsTest ? 'TEST' : 'LIVE')
    })
    
  } catch (error: any) {
    console.error('❌ Error en test:', error)
    return NextResponse.json({
      error: 'Error al probar credenciales',
      details: {
        message: error.message,
        type: error.type,
        code: error.code,
        raw_message: error.raw?.message
      }
    }, { status: 500 })
  }
}

