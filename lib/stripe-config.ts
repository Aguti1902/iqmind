import { db } from './database-postgres'

/**
 * Obtiene las credenciales de Stripe según el modo configurado (test o production)
 * Intenta leer de la base de datos primero, si falla usa variables de entorno
 */
export async function getStripeConfig() {
  try {
    console.log('🔍 [stripe-config] Iniciando getStripeConfig...')
    
    let config: any = {}
    let currentMode = 'test'
    
    // INTENTO 1: Leer desde la base de datos
    try {
      const dbConfig = await db.getAllConfig()
      currentMode = dbConfig.stripe_mode || process.env.STRIPE_MODE || 'test'
      console.log('📊 [stripe-config] Modo desde BD:', currentMode)
      
      const isTestMode = currentMode === 'test'
      
      config = {
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
        // Usar suscripción MENSUAL por defecto (19,99€/mes)
        priceId: isTestMode 
          ? (dbConfig.stripe_test_price_id_mensual || dbConfig.stripe_test_price_id)
          : (dbConfig.stripe_live_price_id_mensual || dbConfig.stripe_live_price_id),
      }
      
      if (config.publishableKey && config.secretKey) {
        console.log('✅ [stripe-config] Credenciales encontradas en BD')
      }
    } catch (dbError: any) {
      console.warn('⚠️ [stripe-config] No se pudo leer de BD:', dbError.message)
    }
    
    // INTENTO 2: Fallback a variables de entorno (si faltan credenciales)
    if (!config.publishableKey || !config.secretKey) {
      console.log('🔄 [stripe-config] Usando variables de entorno como fallback')
      currentMode = process.env.STRIPE_MODE || 'test'
      
      config = {
        mode: currentMode,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        // Leer priceId desde variables de entorno (prioridad: mensual)
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSUAL || process.env.STRIPE_PRICE_ID,
      }
      
      if (config.publishableKey && config.secretKey) {
        console.log('✅ [stripe-config] Credenciales encontradas en variables de entorno')
      }
    }
    
    // INTENTO 3: Si el priceId sigue siendo null, intentar leerlo de variables de entorno
    if (!config.priceId) {
      console.log('🔄 [stripe-config] PriceId no encontrado en BD, intentando variables de entorno...')
      config.priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSUAL || process.env.STRIPE_PRICE_ID
      if (config.priceId) {
        console.log('✅ [stripe-config] PriceId encontrado en variables de entorno')
      }
    }
    
    console.log(`🔑 [stripe-config] Configuración final:`)
    console.log(`   - Modo: ${currentMode.toUpperCase()}`)
    console.log(`   - PublishableKey: ${config.publishableKey?.substring(0, 20)}... (${config.publishableKey ? 'OK' : 'VACÍO'})`)
    console.log(`   - SecretKey: ${config.secretKey?.substring(0, 10)}... (${config.secretKey ? 'OK' : 'VACÍO'})`)
    console.log(`   - PriceId: ${config.priceId?.substring(0, 20)}... (${config.priceId ? 'OK' : 'VACÍO - CRÍTICO'})`)
    
    if (!config.publishableKey || !config.secretKey) {
      console.error('❌ [stripe-config] Faltan credenciales en BD y variables de entorno')
      throw new Error('Credenciales de Stripe no configuradas. Añade NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY y STRIPE_SECRET_KEY en Vercel')
    }
    
    if (!config.priceId) {
      console.warn('⚠️ [stripe-config] PriceId no configurado. Las suscripciones NO se crearán sin él.')
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

