// lib/whop-config.ts
import { Whop } from '@whop/sdk'

/**
 * Configuración centralizada de Whop
 * Lee credenciales desde variables de entorno
 */

export interface WhopConfig {
  apiKey: string
  companyId: string
  planId: string
  webhookSecret: string
  mode: 'test' | 'production'
}

/**
 * Obtiene la configuración de Whop desde variables de entorno
 */
export async function getWhopConfig(): Promise<WhopConfig> {
  const apiKey = process.env.WHOP_API_KEY || ''
  const companyId = process.env.WHOP_COMPANY_ID || ''
  const planId = process.env.WHOP_PLAN_ID || ''
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET || ''
  const mode = (process.env.WHOP_MODE as 'test' | 'production') || 'test'

  if (!apiKey) {
    throw new Error('WHOP_API_KEY no configurada en variables de entorno')
  }

  if (!companyId) {
    throw new Error('WHOP_COMPANY_ID no configurada en variables de entorno')
  }

  if (!planId) {
    throw new Error('WHOP_PLAN_ID no configurada en variables de entorno')
  }

  console.log('🔑 [whop-config] Configuración cargada:')
  console.log('  - Modo:', mode)
  console.log('  - API Key:', apiKey.substring(0, 20) + '...')
  console.log('  - Company ID:', companyId)
  console.log('  - Plan ID:', planId)

  return {
    apiKey,
    companyId,
    planId,
    webhookSecret,
    mode,
  }
}

/**
 * Inicializa el cliente de Whop
 */
export async function getWhopClient() {
  const config = await getWhopConfig()
  
  const client = new Whop({
    apiKey: config.apiKey,
  })

  console.log('✅ [whop-config] Cliente de Whop inicializado')
  
  return client
}

/**
 * URLs de checkout según el modo
 */
export function getWhopUrls() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return {
    successUrl: `${baseUrl}/resultado`,
    cancelUrl: `${baseUrl}/resultado-estimado`,
    webhookUrl: `${baseUrl}/api/whop/webhook`,
  }
}

/**
 * Configuración de la suscripción
 */
export const SUBSCRIPTION_CONFIG = {
  trialDays: 2, // ⚡ 2 días de trial
  initialPayment: 1.00, // €1.00 pago inicial (mínimo de Whop)
  currency: 'EUR',
  interval: 'month', // Intervalo de la suscripción
}

export default {
  getWhopConfig,
  getWhopClient,
  getWhopUrls,
  SUBSCRIPTION_CONFIG,
}

