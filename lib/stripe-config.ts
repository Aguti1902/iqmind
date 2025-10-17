import { db } from './database-postgres'

/**
 * Obtiene las credenciales de Stripe según el modo configurado (test o production)
 * Lee el modo de la base de datos y devuelve las variables de entorno correspondientes
 */
export async function getStripeConfig() {
  try {
    // Obtener el modo actual de la base de datos
    const currentMode = await db.getConfigByKey('stripe_mode') || 'test'
    
    // Seleccionar las variables de entorno según el modo
    const isTestMode = currentMode === 'test'
    
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
    
    console.log(`🔑 Stripe Config: Modo ${currentMode.toUpperCase()}`)
    console.log(`📌 Using publishableKey: ${config.publishableKey?.substring(0, 20)}...`)
    console.log(`📌 Using priceId: ${config.priceId}`)
    
    return config
  } catch (error) {
    console.error('Error obteniendo configuración de Stripe:', error)
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

