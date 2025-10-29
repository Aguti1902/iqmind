import { db } from './database-postgres'

/**
 * Obtiene las credenciales de FastSpring desde la base de datos
 */
export async function getFastSpringConfig() {
  try {
    console.log('🔍 [fastspring-config] Obteniendo configuración de FastSpring...')
    
    // Obtener configuración desde la base de datos
    const dbConfig = await db.getAllConfig()
    
    const config = {
      storefront: dbConfig.fastspring_storefront || process.env.NEXT_PUBLIC_FASTSPRING_STOREFRONT,
      apiUsername: dbConfig.fastspring_api_username || process.env.FASTSPRING_API_USERNAME,
      apiPassword: dbConfig.fastspring_api_password || process.env.FASTSPRING_API_PASSWORD,
      webhookSecret: dbConfig.fastspring_webhook_secret || process.env.FASTSPRING_WEBHOOK_SECRET,
      productPath: dbConfig.fastspring_product_path || 'iqmind-premium-access',
    }
    
    console.log('📋 [fastspring-config] Configuración obtenida:')
    console.log(`   - Storefront: ${config.storefront ? '✓' : '✗'}`)
    console.log(`   - API Username: ${config.apiUsername ? '✓' : '✗'}`)
    console.log(`   - API Password: ${config.apiPassword ? '✓' : '✗'}`)
    console.log(`   - Product Path: ${config.productPath}`)
    
    if (!config.storefront || !config.apiUsername || !config.apiPassword) {
      console.error('❌ [fastspring-config] Faltan credenciales de FastSpring')
      throw new Error('Credenciales de FastSpring no configuradas')
    }
    
    return config
  } catch (error) {
    console.error('❌ [fastspring-config] Error obteniendo configuración:', error)
    throw error
  }
}

/**
 * Verifica si FastSpring está correctamente configurado
 */
export async function isFastSpringConfigured(): Promise<boolean> {
  try {
    const config = await getFastSpringConfig()
    return !!(config.storefront && config.apiUsername && config.apiPassword)
  } catch (error) {
    return false
  }
}

