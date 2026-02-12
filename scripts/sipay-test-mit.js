/**
 * Script para probar MIT y gestión de tokens con Sipay
 * Usa el token obtenido de FastPay
 */

const crypto = require('crypto')

// Configuración de Sipay (sandbox)
const SIPAY_CONFIG = {
  key: 'clicklabsdigital',
  secret: '3KsWEtN9J0z',
  resource: 'clicklabsdigital',
  endpoint: 'https://sandbox.sipay.es',
}

// Token obtenido de FastPay
const FASTPAY_TOKEN = 'b2249ff4aae3470eaffc7aaf81b43c93'

// Generar firma HMAC SHA-256
function generateSignature(payload) {
  return crypto.createHmac('sha256', SIPAY_CONFIG.secret).update(payload).digest('hex')
}

// Hacer petición a Sipay con formato MDWR 2.0
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
        'X-Sipay-Signature': signature,
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

// Generar ticket único
function generateTicket() {
  return Date.now().toString().slice(-10)
}

async function main() {
  console.log('\n🚀 PRUEBAS MIT Y TOKENS - SIPAY')
  console.log('Fecha:', new Date().toLocaleString('es-ES'))
  console.log('Token FastPay:', FASTPAY_TOKEN)
  console.log('')

  // TEST 3.2: Consulta de token
  console.log('='.repeat(60))
  console.log('TEST 3.2: Consulta de token')
  console.log('='.repeat(60))
  
  const consultaResult = await sipayRequest('/mdwr/v1/card', {
    token: FASTPAY_TOKEN,
  })

  // TEST 2.3: Venta MIT Recurrente
  console.log('\n' + '='.repeat(60))
  console.log('TEST 2.3: Venta MIT Recurrente (0.01€)')
  console.log('='.repeat(60))
  
  const ticket = generateTicket()
  const mitResult = await sipayRequest('/mdwr/v1/authorization', {
    amount: '1',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    card_token: FASTPAY_TOKEN,
    sca_exemptions: 'MIT',
    mit_reason: 'R',
  })

  // Resumen
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN')
  console.log('='.repeat(60))
  console.log('TEST 3.2 Consulta:', consultaResult.type === 'success' ? '✅ OK' : `❌ ${consultaResult.detail}`)
  console.log('TEST 2.3 MIT:', mitResult.type === 'success' ? '✅ OK' : `❌ ${mitResult.detail}`)
}

main().catch(console.error)
