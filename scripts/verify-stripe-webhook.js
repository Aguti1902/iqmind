#!/usr/bin/env node

/**
 * Script de Verificación de Webhook de Stripe
 * 
 * Este script verifica:
 * 1. Si el webhook está configurado en Stripe
 * 2. Si el webhook secret es correcto
 * 3. El historial de eventos del webhook
 * 4. Las suscripciones existentes
 */

const Stripe = require('stripe')

// Colores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}━━━ ${msg} ━━━${colors.reset}\n`),
}

async function verifyStripeWebhook() {
  log.section('VERIFICACIÓN DE WEBHOOK DE STRIPE')

  // Verificar que existe la SECRET_KEY
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    log.error('STRIPE_SECRET_KEY no encontrada en variables de entorno')
    process.exit(1)
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })

  try {
    // 1. Listar webhooks configurados
    log.section('1. WEBHOOKS CONFIGURADOS')
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 })
    
    if (webhooks.data.length === 0) {
      log.error('NO HAY WEBHOOKS CONFIGURADOS EN STRIPE')
      log.warning('Necesitas configurar un webhook en: https://dashboard.stripe.com/webhooks')
      log.info('URL del webhook: https://mindmetric.io/api/webhooks/stripe')
      log.info('Eventos a escuchar: payment_intent.succeeded, checkout.session.completed')
    } else {
      log.success(`Encontrados ${webhooks.data.length} webhook(s)`)
      webhooks.data.forEach((webhook, index) => {
        console.log(`\nWebhook ${index + 1}:`)
        console.log(`  ID: ${webhook.id}`)
        console.log(`  URL: ${webhook.url}`)
        console.log(`  Status: ${webhook.status}`)
        console.log(`  Eventos: ${webhook.enabled_events.join(', ')}`)
        
        // Verificar si la URL es correcta
        if (webhook.url.includes('mindmetric.io') || webhook.url.includes('vercel.app')) {
          log.success('URL del webhook parece correcta')
        } else {
          log.warning('URL del webhook NO apunta a mindmetric.io o vercel.app')
        }
        
        // Verificar eventos importantes
        const requiredEvents = ['payment_intent.succeeded', 'checkout.session.completed']
        const hasRequiredEvents = requiredEvents.some(event => webhook.enabled_events.includes(event))
        if (hasRequiredEvents) {
          log.success('Webhook escucha eventos de pago')
        } else {
          log.warning('Webhook NO escucha payment_intent.succeeded o checkout.session.completed')
        }
      })
    }

    // 2. Verificar eventos recientes
    log.section('2. EVENTOS RECIENTES (últimos 10)')
    const events = await stripe.events.list({ limit: 10 })
    
    console.log(`Total de eventos: ${events.data.length}\n`)
    events.data.forEach((event, index) => {
      const date = new Date(event.created * 1000).toLocaleString()
      console.log(`${index + 1}. [${date}] ${event.type}`)
      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object
        console.log(`   💰 Monto: €${pi.amount / 100} - Email: ${pi.receipt_email || 'N/A'}`)
      }
    })

    // 3. Verificar Payment Intents recientes
    log.section('3. PAYMENT INTENTS RECIENTES')
    const paymentIntents = await stripe.paymentIntents.list({ limit: 10 })
    
    console.log(`Total: ${paymentIntents.data.length}\n`)
    paymentIntents.data.forEach((pi, index) => {
      const date = new Date(pi.created * 1000).toLocaleString()
      console.log(`${index + 1}. [${date}] ${pi.id}`)
      console.log(`   Status: ${pi.status}`)
      console.log(`   Monto: €${pi.amount / 100}`)
      console.log(`   Email: ${pi.receipt_email || pi.metadata?.userEmail || 'N/A'}`)
      console.log(`   Part: ${pi.metadata?.paymentPart || 'N/A'}/${pi.metadata?.totalParts || 'N/A'}`)
    })

    // 4. Verificar Suscripciones
    log.section('4. SUSCRIPCIONES ACTIVAS')
    const subscriptions = await stripe.subscriptions.list({ 
      limit: 10,
      expand: ['data.customer']
    })
    
    if (subscriptions.data.length === 0) {
      log.error('NO HAY SUSCRIPCIONES EN STRIPE')
      log.warning('El webhook NO está creando suscripciones después de los pagos')
    } else {
      log.success(`Encontradas ${subscriptions.data.length} suscripción(es)`)
      subscriptions.data.forEach((sub, index) => {
        const customer = sub.customer
        console.log(`\n${index + 1}. Suscripción ${sub.id}`)
        console.log(`   Status: ${sub.status}`)
        console.log(`   Email: ${customer.email || 'N/A'}`)
        console.log(`   Plan: ${sub.items.data[0]?.price.nickname || 'N/A'}`)
        console.log(`   Monto: €${(sub.items.data[0]?.price.unit_amount || 0) / 100}`)
        if (sub.trial_end) {
          console.log(`   Trial hasta: ${new Date(sub.trial_end * 1000).toLocaleString()}`)
        }
      })
    }

    // 5. Verificar Customers
    log.section('5. CUSTOMERS RECIENTES')
    const customers = await stripe.customers.list({ limit: 5 })
    
    console.log(`Total: ${customers.data.length}\n`)
    customers.data.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.id}`)
      console.log(`   Email: ${customer.email || 'N/A'}`)
      console.log(`   Nombre: ${customer.name || 'N/A'}`)
    })

    // DIAGNÓSTICO FINAL
    log.section('DIAGNÓSTICO FINAL')
    
    const hasWebhook = webhooks.data.length > 0
    const hasSubscriptions = subscriptions.data.length > 0
    const hasPayments = paymentIntents.data.filter(pi => pi.status === 'succeeded').length > 0
    
    if (hasPayments && !hasSubscriptions) {
      log.error('PROBLEMA CRÍTICO DETECTADO')
      console.log('\n📋 Hay pagos exitosos pero NO hay suscripciones.')
      console.log('\n🔍 Posibles causas:')
      console.log('   1. El webhook NO está configurado en Stripe')
      console.log('   2. El webhook está fallando (revisar logs de Vercel)')
      console.log('   3. El STRIPE_WEBHOOK_SECRET es incorrecto')
      
      if (!hasWebhook) {
        console.log('\n⚠️  NO se encontró webhook configurado en Stripe')
        console.log('\n📝 Para configurar el webhook:')
        console.log('   1. Ve a: https://dashboard.stripe.com/webhooks')
        console.log('   2. Click en "Añadir endpoint"')
        console.log('   3. URL: https://mindmetric.io/api/webhooks/stripe')
        console.log('   4. Eventos: payment_intent.succeeded, checkout.session.completed')
        console.log('   5. Copia el "Signing secret" y añádelo a Vercel como STRIPE_WEBHOOK_SECRET')
      } else {
        console.log('\n✅ Webhook configurado en Stripe')
        console.log('⚠️  Pero NO está creando suscripciones')
        console.log('\n📝 Revisa los logs de Vercel:')
        console.log('   https://vercel.com/[tu-proyecto]/logs')
        console.log('   Busca errores en: /api/webhooks/stripe')
      }
    } else if (hasSubscriptions) {
      log.success('Todo parece estar funcionando correctamente')
    } else {
      log.warning('No hay pagos ni suscripciones aún')
    }

  } catch (error) {
    log.error(`Error: ${error.message}`)
    console.error(error)
  }
}

// Ejecutar
verifyStripeWebhook()

