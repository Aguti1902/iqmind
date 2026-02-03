/**
 * Cliente de Sipay para MindMetric
 * 
 * Documentación: https://developer.sipay.es/docs/
 * Sandbox: https://sandbox.sipay.es
 */

import { createHmac } from 'crypto'

// Tipos de Sipay
export interface SipayConfig {
  key: string
  secret: string
  resource: string
  endpoint: string
}

export interface SipayAuthResponse {
  code: number
  description: string
  id_transaction?: string
  id_order?: string
  amount?: number
  currency?: string
  card_token?: string
  card_mask?: string
  card_brand?: string
  authorization_code?: string
  transaction_status?: string
}

export interface SipayRefundResponse {
  code: number
  description: string
  id_refund?: string
  id_transaction?: string
  amount?: number
}

export interface SipayCardTokenResponse {
  code: number
  description: string
  card_token?: string
  card_mask?: string
  card_brand?: string
  expiry_date?: string
}

/**
 * Cliente de Sipay
 */
export class SipayClient {
  private config: SipayConfig

  constructor(config: SipayConfig) {
    this.config = config
  }

  /**
   * Generar firma HMAC SHA-256 para las peticiones
   */
  private generateSignature(payload: string): string {
    const hmac = createHmac('sha256', this.config.secret)
    return hmac.update(payload).digest('hex')
  }

  /**
   * Hacer petición a la API de Sipay
   */
  private async makeRequest(
    endpoint: string,
    method: string,
    data: any
  ): Promise<any> {
    const url = `${this.config.endpoint}${endpoint}`
    const payload = JSON.stringify(data)
    const signature = this.generateSignature(payload)

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.key}`,
        'X-Sipay-Signature': signature,
      },
      body: payload,
    })

    if (!response.ok) {
      throw new Error(`Sipay API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Autorización con autenticación y tokenización (primer pago)
   * https://developer.sipay.es/docs/api/mdwr/allinone#2-autorizaci%C3%B3n-con-autenticaci%C3%B3n-con-almacenamiento-de-tarjeta-tokenizaci%C3%B3n
   * 
   * Nota: Si viene de FastPay (iframe), el requestId se usa con el parámetro 'fastpay'
   * Si ya tenemos un card_token permanente, se usa 'card_token'
   */
  async authorizeWithTokenization(params: {
    amount: number
    currency: string
    orderId: string
    description: string
    cardToken: string // Puede ser requestId de FastPay o cardToken permanente
    customerEmail: string
    returnUrl: string
    cancelUrl: string
    isRequestId?: boolean // true si cardToken es en realidad un requestId de FastPay
  }): Promise<SipayAuthResponse> {
    // Determinar si es un request_id de FastPay o un card_token permanente
    // request_id de FastPay suele ser un hash hexadecimal de 32 caracteres
    const isFastPayRequestId = params.isRequestId || 
      (params.cardToken && params.cardToken.length === 32 && /^[a-f0-9]+$/i.test(params.cardToken))
    
    const data: Record<string, any> = {
      key: this.config.key,
      resource: this.config.resource,
      amount: params.amount,
      currency: params.currency,
      order: params.orderId,
      reconciliation: params.orderId, // ID de conciliación
      custom_01: params.customerEmail,
    }
    
    // Añadir el token correcto según el tipo
    if (isFastPayRequestId) {
      // Es un request_id de FastPay - usar el parámetro 'fastpay'
      data.fastpay = params.cardToken
      data.mode = 'sha' // Modo de autenticación con tokenización
    } else {
      // Es un card_token permanente (de un pago anterior)
      data.card_token = params.cardToken
    }

    console.log('📤 Datos enviados a Sipay:', { ...data, key: '***' })
    
    return this.makeRequest('/mdwr/v1/authorization', 'POST', data)
  }

  /**
   * Autorización con exención MIT (Merchant Initiated Transaction)
   * Para pagos recurrentes sin la presencia del cliente
   * https://developer.sipay.es/docs/api/mdwr/allinone#4-autorizaci%C3%B3n-con-exenci%C3%B3n-mit-r
   */
  async authorizeRecurring(params: {
    amount: number
    currency: string
    orderId: string
    description: string
    cardToken: string
    customerEmail: string
  }): Promise<SipayAuthResponse> {
    const data = {
      amount: params.amount,
      currency: params.currency,
      order: params.orderId,
      description: params.description,
      card_token: params.cardToken,
      customer_email: params.customerEmail,
      mit_exemption: true,
      resource: this.config.resource,
    }

    return this.makeRequest('/api/v1/mdwr/allinone', 'POST', data)
  }

  /**
   * Realizar devolución (refund)
   * https://developer.sipay.es/docs/api/mdwr/refund
   */
  async refund(params: {
    transactionId: string
    amount?: number
    reason?: string
  }): Promise<SipayRefundResponse> {
    const data = {
      id_transaction: params.transactionId,
      amount: params.amount,
      reason: params.reason,
      resource: this.config.resource,
    }

    return this.makeRequest('/api/v1/mdwr/refund', 'POST', data)
  }

  /**
   * Consultar información de un token de tarjeta
   * https://developer.sipay.es/docs/api/mdwr/card
   */
  async getCardInfo(cardToken: string): Promise<SipayCardTokenResponse> {
    const data = {
      card_token: cardToken,
      resource: this.config.resource,
    }

    return this.makeRequest('/api/v1/mdwr/card', 'POST', data)
  }

  /**
   * Borrar un token de tarjeta
   * https://developer.sipay.es/docs/api/mdwr/unregister
   */
  async deleteCardToken(cardToken: string): Promise<{ code: number; description: string }> {
    const data = {
      card_token: cardToken,
      resource: this.config.resource,
    }

    return this.makeRequest('/api/v1/mdwr/unregister', 'POST', data)
  }

  /**
   * Iniciar flujo de pago con Apple Pay
   */
  async authorizeApplePay(params: {
    amount: number
    currency: string
    orderId: string
    description: string
    applePayToken: string
    customerEmail: string
  }): Promise<SipayAuthResponse> {
    const data = {
      amount: params.amount,
      currency: params.currency,
      order: params.orderId,
      description: params.description,
      apple_pay_token: params.applePayToken,
      customer_email: params.customerEmail,
      resource: this.config.resource,
    }

    return this.makeRequest('/api/v1/mdwr/allinone', 'POST', data)
  }

  /**
   * Iniciar flujo de pago con Google Pay
   */
  async authorizeGooglePay(params: {
    amount: number
    currency: string
    orderId: string
    description: string
    googlePayToken: string
    customerEmail: string
  }): Promise<SipayAuthResponse> {
    const data = {
      amount: params.amount,
      currency: params.currency,
      order: params.orderId,
      description: params.description,
      google_pay_token: params.googlePayToken,
      customer_email: params.customerEmail,
      resource: this.config.resource,
    }

    return this.makeRequest('/api/v1/mdwr/allinone', 'POST', data)
  }
}

/**
 * Obtener instancia del cliente de Sipay
 */
export function getSipayClient(): SipayClient {
  const config: SipayConfig = {
    key: process.env.SIPAY_API_KEY || '',
    secret: process.env.SIPAY_API_SECRET || '',
    resource: process.env.SIPAY_RESOURCE || '',
    endpoint: process.env.SIPAY_ENDPOINT || 'https://sandbox.sipay.es',
  }

  if (!config.key || !config.secret || !config.resource) {
    throw new Error('Sipay configuration is missing. Please set SIPAY_API_KEY, SIPAY_API_SECRET, and SIPAY_RESOURCE environment variables.')
  }

  return new SipayClient(config)
}

