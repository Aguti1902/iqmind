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
   * Hacer petición a la API de Sipay con formato MDWR 2.0
   */
  private async makeRequest(
    endpoint: string,
    method: string,
    payloadData: any
  ): Promise<any> {
    const url = `${this.config.endpoint}${endpoint}`
    
    // Formato MDWR 2.0: key, resource, nonce, mode, payload
    const requestBody = {
      key: this.config.key,
      resource: this.config.resource,
      nonce: Date.now().toString(),
      mode: 'sha256',
      payload: payloadData,
    }
    
    const bodyString = JSON.stringify(requestBody)
    const signature = this.generateSignature(bodyString)

    console.log('📤 Sipay request:', { endpoint, payload: payloadData })

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Signature': signature,
      },
      body: bodyString,
    })

    const result = await response.json()
    console.log('📥 Sipay response:', result)

    if (result.type === 'error') {
      throw new Error(`Sipay error: ${result.detail} - ${result.description}`)
    }

    return result
  }

  /**
   * Autorización con FastPay request_id (primer pago desde iframe)
   * Usa el endpoint all-in-one según documentación Sipay
   */
  async authorizeWithFastPay(params: {
    amount: number
    currency: string
    orderId: string
    requestId: string
    customerEmail: string
    urlOk?: string
    urlKo?: string
  }): Promise<any> {
    // reconciliation DEBE ser numérico
    const reconciliation = Date.now().toString().slice(-10)
    // Token para guardar tarjeta (necesario para MIT/recurrente)
    const tokenId = 'mndmtrc_' + Date.now().toString().slice(-10)
    
    const payload: any = {
      amount: params.amount.toString(),
      currency: params.currency,
      order: params.orderId,
      reconciliation: reconciliation,
      operation: 'all-in-one',
      token: tokenId,
      url_ok: params.urlOk || 'https://mindmetric.io/es/resultado',
      url_ko: params.urlKo || 'https://mindmetric.io/es/checkout-payment?error=true',
      fastpay: {
        request_id: params.requestId,
      },
    }

    console.log('📤 Sipay authorize FastPay:', { ...payload, fastpay: { request_id: params.requestId.slice(0, 8) + '...' } })
    return this.makeRequest('/mdwr/v1/all-in-one', 'POST', payload)
  }

  /**
   * Confirmar y capturar fondos después de autenticación
   */
  async confirmPayment(requestId: string): Promise<any> {
    const payload = {
      request_id: requestId,
    }

    console.log('📤 Sipay confirm payment:', payload)
    return this.makeRequest('/mdwr/v1/all-in-one/confirm', 'POST', payload)
  }

  /**
   * Autorización con card_token (pagos recurrentes)
   */
  async authorizeWithTokenization(params: {
    amount: number
    currency: string
    orderId: string
    description: string
    cardToken: string
    customerEmail: string
    returnUrl: string
    cancelUrl: string
  }): Promise<SipayAuthResponse> {
    const data = {
      key: this.config.key,
      resource: this.config.resource,
      amount: params.amount,
      currency: params.currency,
      order: params.orderId,
      card_token: params.cardToken,
      reconciliation: params.orderId,
    }

    console.log('📤 Sipay tokenized:', { ...data, key: '***' })
    return this.makeRequest('/mdwr/v1/authorization', 'POST', data)
  }

  /**
   * Autorización con exención MIT (Merchant Initiated Transaction)
   * Para pagos recurrentes sin la presencia del cliente
   * 
   * IMPORTANTE: Sipay usa 'token' (no 'card_token') y 'reconciliation' debe ser numérico
   */
  async authorizeRecurring(params: {
    amount: number
    currency: string
    orderId: string
    cardToken: string
    mitReason?: string  // 'R' = Recurrente, 'C' = Credential on file
  }): Promise<SipayAuthResponse> {
    const reconciliation = Date.now().toString().slice(-10)
    const data = {
      amount: params.amount.toString(),
      currency: params.currency,
      order: params.orderId,
      reconciliation: reconciliation,
      token: params.cardToken,
      sca_exemptions: 'MIT',
      mit_reason: params.mitReason || 'R',
    }

    console.log('📤 Sipay MIT:', { ...data, token: data.token.slice(0, 10) + '...' })
    return this.makeRequest('/mdwr/v1/authorization', 'POST', data)
  }

  /**
   * Realizar devolución (refund)
   * https://developer.sipay.es/docs/api/mdwr/refund
   */
  async refund(params: {
    transactionId: string
    amount: number
    currency?: string
  }): Promise<SipayRefundResponse> {
    const reconciliation = Date.now().toString().slice(-10)
    const data = {
      amount: params.amount.toString(),
      currency: params.currency || 'EUR',
      order: reconciliation,
      reconciliation: reconciliation,
      transaction_id: params.transactionId,
    }

    console.log('📤 Sipay refund:', { ...data })
    return this.makeRequest('/mdwr/v1/refund', 'POST', data)
  }

  /**
   * Consultar información de un token de tarjeta
   * https://developer.sipay.es/docs/api/mdwr/card
   */
  async getCardInfo(cardToken: string): Promise<SipayCardTokenResponse> {
    const data = {
      token: cardToken,
    }

    return this.makeRequest('/mdwr/v1/card', 'POST', data)
  }

  /**
   * Borrar un token de tarjeta
   * https://developer.sipay.es/docs/api/mdwr/unregister
   */
  async deleteCardToken(cardToken: string): Promise<{ code: number; description: string }> {
    const data = {
      token: cardToken,
    }

    return this.makeRequest('/mdwr/v1/unregister', 'POST', data)
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

