import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeConfig } from '@/lib/stripe-config'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userIQ, userName, lang, testData } = body

    console.log('=== CREATE PAYMENT INTENT - INICIO ===')
    console.log('Email:', email)
    console.log('UserIQ:', userIQ)
    console.log('Test Data:', testData ? 'Present ✅' : 'Missing ⚠️')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Obtener configuración de Stripe según el modo actual
    console.log('🔍 Obteniendo configuración de Stripe...')
    const stripeConfig = await getStripeConfig()
    console.log('📋 Configuración obtenida:', {
      mode: stripeConfig.mode,
      secretKeyPrefix: stripeConfig.secretKey?.substring(0, 10) + '...',
      publishableKeyPrefix: stripeConfig.publishableKey?.substring(0, 20) + '...',
      hasPriceId: !!stripeConfig.priceId
    })
    
    if (!stripeConfig.secretKey) {
      console.error('❌ No hay secretKey en la configuración')
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    console.log('✅ Inicializando Stripe con modo:', stripeConfig.mode)
    const stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2023-10-16',
    })

    // Buscar o crear customer con información completa
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
      // Actualizar customer con nueva información si es necesario
      if (!customer.name && userName) {
        customer = await stripe.customers.update(customer.id, {
          name: userName,
          metadata: {
            userIQ: userIQ?.toString() || '',
            lang: lang || 'es',
            lastUpdated: new Date().toISOString(),
          },
        })
      }
    } else {
      customer = await stripe.customers.create({
        email,
        name: userName || email.split('@')[0], // Usar parte del email si no hay nombre
        description: `Cliente MindMetric - IQ: ${userIQ || 'Pendiente'}`,
        metadata: {
          userIQ: userIQ?.toString() || '',
          lang: lang || 'es',
          createdAt: new Date().toISOString(),
        },
      })
    }
    
    console.log('👤 Customer:', customer.id, '-', customer.name, '-', customer.email)

    // ESTRATEGIA DE DOBLE PAGO: Crear 2 Payment Intents de €0.50 cada uno
    // Total: €1.00 pero procesado como 2 transacciones separadas
    // Beneficios: Más ventas en Stripe + Menor tasa de disputas
    
    const metadata = {
      userEmail: email,
      userIQ: userIQ || '',
      userName: userName || '',
      lang: lang || 'es',
      testAnswers: testData?.answers ? JSON.stringify(testData.answers) : '',
      testTimeElapsed: testData?.timeElapsed?.toString() || '',
      testCorrectAnswers: testData?.correctAnswers?.toString() || '',
      testCategoryScores: testData?.categoryScores ? JSON.stringify(testData.categoryScores) : '',
      testCompletedAt: testData?.completedAt || '',
    }

    // Primer pago de €0.50
    const paymentIntent1 = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: 50, // €0.50 en centavos
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      description: `${userName || customer.name || email.split('@')[0]} - Desbloqueo Test IQ (1/2)`,
      statement_descriptor_suffix: 'IQ Test 1/2',
      receipt_email: email,
      metadata: {
        ...metadata,
        paymentPart: '1',
        totalParts: '2',
        customerName: userName || customer.name || '',
      },
      setup_future_usage: 'off_session',
    })

    // Segundo pago de €0.50
    const paymentIntent2 = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: 50, // €0.50 en centavos
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      description: `${userName || customer.name || email.split('@')[0]} - Desbloqueo Test IQ (2/2)`,
      statement_descriptor_suffix: 'IQ Test 2/2',
      receipt_email: email,
      metadata: {
        ...metadata,
        paymentPart: '2',
        totalParts: '2',
        linkedPayment: paymentIntent1.id, // Vincular ambos pagos
        customerName: userName || customer.name || '',
      },
      setup_future_usage: 'off_session',
    })

    console.log('✅ Dos Payment Intents creados:')
    console.log('   💳 Pago 1:', paymentIntent1.id)
    console.log('   💳 Pago 2:', paymentIntent2.id)

    return NextResponse.json({
      clientSecret: paymentIntent1.client_secret,
      clientSecret2: paymentIntent2.client_secret,
      customerId: customer.id,
      paymentIntentId1: paymentIntent1.id,
      paymentIntentId2: paymentIntent2.id,
    })

  } catch (error: any) {
    console.error('Error al crear payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

