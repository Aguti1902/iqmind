// lib/lemonsqueezy-config.ts
import { db } from './database-postgres'

export async function getLemonSqueezyConfig() {
  try {
    console.log('🍋 [lemonsqueezy-config] Iniciando getLemonSqueezyConfig...')
    
    const dbConfig = await db.getAllConfig()
    const currentMode = dbConfig.payment_mode || 'test'
    console.log('📊 [lemonsqueezy-config] Modo desde BD:', currentMode)
    
    const isTestMode = currentMode === 'test'
    console.log('🔀 [lemonsqueezy-config] isTestMode:', isTestMode)
    
    const config = {
      mode: currentMode,
      apiKey: isTestMode 
        ? dbConfig.lemonsqueezy_test_api_key
        : dbConfig.lemonsqueezy_live_api_key,
      storeId: isTestMode 
        ? dbConfig.lemonsqueezy_test_store_id
        : dbConfig.lemonsqueezy_live_store_id,
      variantId: isTestMode 
        ? dbConfig.lemonsqueezy_test_variant_id
        : dbConfig.lemonsqueezy_live_variant_id,
      webhookSecret: isTestMode 
        ? dbConfig.lemonsqueezy_test_webhook_secret
        : dbConfig.lemonsqueezy_live_webhook_secret,
    }
    
    console.log(`🔑 [lemonsqueezy-config] Configuración desde BD:`)
    console.log(`   - Modo: ${currentMode.toUpperCase()}`)
    console.log(`   - API Key: ${config.apiKey?.substring(0, 20)}... (${config.apiKey ? 'OK' : 'VACÍO'})`)
    console.log(`   - Store ID: ${config.storeId || 'VACÍO'}`)
    console.log(`   - Variant ID: ${config.variantId || 'VACÍO'}`)
    console.log(`   - Webhook Secret: ${config.webhookSecret?.substring(0, 10)}... (${config.webhookSecret ? 'OK' : 'VACÍO'})`)
    
    if (!config.apiKey || !config.storeId || !config.variantId) {
      console.error('❌ [lemonsqueezy-config] Faltan credenciales en la BD')
      throw new Error('Credenciales de Lemon Squeezy no configuradas en la base de datos')
    }
    
    return config
  } catch (error) {
    console.error('❌ [lemonsqueezy-config] Error obteniendo configuración de Lemon Squeezy:', error)
    throw error
  }
}

export async function getPaymentProvider() {
  try {
    const dbConfig = await db.getAllConfig()
    return dbConfig.payment_provider || 'lemonsqueezy'
  } catch (error) {
    console.error('❌ Error obteniendo payment provider:', error)
    return 'lemonsqueezy' // Default
  }
}

