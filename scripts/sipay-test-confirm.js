/**
 * Script para completar el flujo Sipay con FastPay
 * Header correcto: Content-Signature (según documentación)
 * 
 * Flujo:
 * 1. FastPay (iframe) → devuelve request_id
 * 2. POST /all-in-one con fastpay.request_id → devuelve URL 3DS
 * 3. POST /all-in-one/confirm con request_id → confirma y captura fondos
 */

const crypto = require('crypto')

const SIPAY_CONFIG = {
  key: 'clicklabsdigital',
  secret: '3KsWEtN9J0z',
  resource: 'clicklabsdigital',
  endpoint: 'https://sandbox.sipay.es',
}

// Tokens de FastPay obtenidos en las pruebas
const FASTPAY_TOKENS = {
  test_1_1: '38f3879fc49445228a809ed304d0ee5c',
  test_1_3: 'a51145669c0f445b80c9dd1cef3602e1',
  test_2_1: 'b2249ff4aae3470eaffc7aaf81b43c93',
}

function generateSignature(bodyString) {
  return crypto.createHmac('sha256', SIPAY_CONFIG.secret).update(bodyString).digest('hex')
}

async function sipayRequest(endpoint, payloadData) {
  const url = `${SIPAY_CONFIG.endpoint}${endpoint}`
  
  const requestBody = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    nonce: Date.now().toString(),
    mode: 'sha256',
    payload: payloadData,
  }
  
  const bodyString = JSON.stringify(requestBody)
  const signature = generateSignature(bodyString)

  console.log(`\n📤 POST ${endpoint}`)
  console.log('Body:', JSON.stringify(requestBody, null, 2))

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Signature': signature,
      },
      body: bodyString,
    })

    const result = await response.json()
    console.log('📥 Response:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
    return { error: error.message }
  }
}

function generateTicket() {
  return 'Psd2' + Date.now().toString().slice(-8)
}

async function main() {
  console.log('\n🚀 PRUEBAS SIPAY - Header Content-Signature')
  console.log('Fecha:', new Date().toLocaleString('es-ES'))
  console.log('')

  // ===========================================
  // TEST: Probar /all-in-one con FastPay request_id
  // ===========================================
  console.log('='.repeat(60))
  console.log('TEST: /all-in-one con FastPay request_id (test_2_1)')
  console.log('='.repeat(60))
  
  const ticket = generateTicket()
  const allinoneResult = await sipayRequest('/mdwr/v1/all-in-one', {
    amount: '50',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    operation: 'all-in-one',
    url_ok: 'https://mindmetric.io/es/resultado',
    url_ko: 'https://mindmetric.io/es/checkout-payment?error=true',
    fastpay: {
      request_id: FASTPAY_TOKENS.test_2_1,
    },
  })

  // Si tiene éxito, intentar confirm
  if (allinoneResult.type === 'success' && allinoneResult.payload?.request_id) {
    console.log('\n' + '='.repeat(60))
    console.log('TEST: /all-in-one/confirm')
    console.log('='.repeat(60))
    
    const confirmResult = await sipayRequest('/mdwr/v1/all-in-one/confirm', {
      request_id: allinoneResult.payload.request_id || allinoneResult.request_id,
    })

    if (confirmResult.type === 'success') {
      console.log('\n✅ ¡Transacción confirmada!')
      console.log('transaction_id:', confirmResult.payload?.transaction_id)
      console.log('card_token:', confirmResult.payload?.token)
      console.log('masked_card:', confirmResult.payload?.masked_card)
    }
  }

  // ===========================================
  // TEST: Probar /all-in-one/confirm directamente
  // ===========================================
  console.log('\n' + '='.repeat(60))
  console.log('TEST: /all-in-one/confirm directo con FastPay token')
  console.log('='.repeat(60))
  
  const confirmDirectResult = await sipayRequest('/mdwr/v1/all-in-one/confirm', {
    request_id: FASTPAY_TOKENS.test_2_1,
  })

  // ===========================================
  // TEST: Consulta de token
  // ===========================================
  console.log('\n' + '='.repeat(60))
  console.log('TEST: Consulta de token /card')
  console.log('='.repeat(60))
  
  await sipayRequest('/mdwr/v1/card', {
    token: FASTPAY_TOKENS.test_2_1,
  })

  // ===========================================
  // TEST: Refund
  // ===========================================
  console.log('\n' + '='.repeat(60))
  console.log('TEST: Refund /refund')
  console.log('='.repeat(60))
  
  const refundTicket = generateTicket()
  await sipayRequest('/mdwr/v1/refund', {
    amount: '50',
    currency: 'EUR',
    order: refundTicket,
    reconciliation: refundTicket,
    transaction_id: FASTPAY_TOKENS.test_2_1,
  })
}

main().catch(console.error)
