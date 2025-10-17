import { db } from './database-postgres'

/**
 * Obtiene las credenciales de Stripe según el modo configurado (test o production)
 * Lee el modo de la base de datos y devuelve las variables de entorno correspondientes
 */
export async function getStripeConfig() {
  try {
    console.log('🔍 [stripe-config] Iniciando getStripeConfig...')
    
    // Obtener TODA la configuración desde la base de datos
    const dbConfig = await db.getAllConfig()
    const currentMode = dbConfig.stripe_mode || 'production'
    console.log('📊 [stripe-config] Modo desde BD:', currentMode)
    
    const isTestMode = currentMode === 'test'
    console.log('🔀 [stripe-config] isTestMode:', isTestMode)
    
    // Leer SIEMPRE de la base de datos (NO de variables de entorno)
    const config = {
      mode: currentMode,
      publishableKey: isTestMode 
        ? dbConfig.stripe_test_publishable_key
        : dbConfig.stripe_live_publishable_key,
      secretKey: isTestMode 
        ? dbConfig.stripe_test_secret_key
        : dbConfig.stripe_live_secret_key,
      webhookSecret: isTestMode 
        ? dbConfig.stripe_test_webhook_secret
        : dbConfig.stripe_live_webhook_secret,
      priceId: isTestMode 
        ? dbConfig.stripe_test_price_id
        : dbConfig.stripe_live_price_id,
    }
    
    console.log(`🔑 [stripe-config] Configuración desde BD:`)
    console.log(`   - Modo: ${currentMode.toUpperCase()}`)
    console.log(`   - PublishableKey: ${config.publishableKey?.substring(0, 20)}... (${config.publishableKey ? 'OK' : 'VACÍO'})`)
    console.log(`   - SecretKey: ${config.secretKey?.substring(0, 10)}... (${config.secretKey ? 'OK' : 'VACÍO'})`)
    console.log(`   - PriceId: ${config.priceId || 'VACÍO'}`)
    
    if (!config.publishableKey || !config.secretKey) {
      console.error('❌ [stripe-config] Faltan credenciales en la BD')
      throw new Error('Credenciales de Stripe no configuradas en la base de datos')
    }
    
    return config
  } catch (error) {
    console.error('❌ [stripe-config] Error obteniendo configuración de Stripe:', error)
    throw error
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

