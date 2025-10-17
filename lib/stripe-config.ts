import { db } from './database-postgres'

/**
 * Obtiene las credenciales de Stripe según el modo configurado (test o production)
 * Lee el modo de la base de datos y devuelve las variables de entorno correspondientes
 */
export async function getStripeConfig() {
  try {
    console.log('🔍 [stripe-config] Iniciando getStripeConfig...')
    
    // Obtener el modo actual de la base de datos
    const currentMode = await db.getConfigByKey('stripe_mode') || 'test'
    console.log('📊 [stripe-config] Modo desde BD:', currentMode)
    
    // Seleccionar las variables de entorno según el modo
    const isTestMode = currentMode === 'test'
    console.log('🔀 [stripe-config] isTestMode:', isTestMode)
    
    // Log de variables disponibles
    console.log('📦 [stripe-config] Variables de entorno disponibles:', {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST ? 'SÍ' : 'NO',
      STRIPE_SECRET_KEY_TEST: process.env.STRIPE_SECRET_KEY_TEST ? 'SÍ' : 'NO',
      STRIPE_WEBHOOK_SECRET_TEST: process.env.STRIPE_WEBHOOK_SECRET_TEST ? 'SÍ' : 'NO',
      STRIPE_PRICE_ID_TEST: process.env.STRIPE_PRICE_ID_TEST ? 'SÍ' : 'NO',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SÍ' : 'NO',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SÍ' : 'NO',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'SÍ' : 'NO',
      STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID ? 'SÍ' : 'NO',
    })
    
    const config = {
      mode: currentMode,
      publishableKey: isTestMode 
        ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST 
        : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: isTestMode 
        ? process.env.STRIPE_SECRET_KEY_TEST 
        : process.env.STRIPE_SECRET_KEY,
      webhookSecret: isTestMode 
        ? process.env.STRIPE_WEBHOOK_SECRET_TEST 
        : process.env.STRIPE_WEBHOOK_SECRET,
      priceId: isTestMode 
        ? process.env.STRIPE_PRICE_ID_TEST 
        : process.env.STRIPE_PRICE_ID,
    }
    
    console.log(`🔑 [stripe-config] Configuración seleccionada:`)
    console.log(`   - Modo: ${currentMode.toUpperCase()}`)
    console.log(`   - PublishableKey: ${config.publishableKey?.substring(0, 20)}...`)
    console.log(`   - SecretKey: ${config.secretKey?.substring(0, 10)}...`)
    console.log(`   - PriceId: ${config.priceId}`)
    
    return config
  } catch (error) {
    console.error('❌ [stripe-config] Error obteniendo configuración de Stripe:', error)
    // Por defecto, usar modo test si hay error
    return {
      mode: 'test',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST,
      secretKey: process.env.STRIPE_SECRET_KEY_TEST,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST,
      priceId: process.env.STRIPE_PRICE_ID_TEST,
    }
  }
}

/**
 * Obtiene las credenciales de Stripe de forma síncrona
 * NOTA: Solo usar en contextos donde no se pueda hacer async (middleware, etc)
 * Por defecto usará modo test si no se especifica STRIPE_MODE
 */
export function getStripeConfigSync() {
  const mode = process.env.STRIPE_MODE || 'test'
  const isTestMode = mode === 'test'
  
  return {
    mode,
    publishableKey: isTestMode 
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST 
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: isTestMode 
      ? process.env.STRIPE_SECRET_KEY_TEST 
      : process.env.STRIPE_SECRET_KEY,
    webhookSecret: isTestMode 
      ? process.env.STRIPE_WEBHOOK_SECRET_TEST 
      : process.env.STRIPE_WEBHOOK_SECRET,
    priceId: isTestMode 
      ? process.env.STRIPE_PRICE_ID_TEST 
      : process.env.STRIPE_PRICE_ID,
  }
}

