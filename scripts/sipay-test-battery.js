/**
 * Script de Batería de Pruebas de Sipay
 * Ejecutar con: node scripts/sipay-test-battery.js
 */

const crypto = require('crypto')
const fs = require('fs')

// Configuración de Sipay (sandbox)
const SIPAY_CONFIG = {
  key: 'clicklabsdigital',
  secret: '3KsWEtN9J0z',
  resource: 'clicklabsdigital',
  endpoint: 'https://sandbox.sipay.es',
}

// Tarjeta de prueba
const TEST_CARD = {
  pan: '4548810000000003',
  expiry_month: '12',
  expiry_year: '49',
  cvv: '123',
}

// Resultados de las pruebas
const testResults = []

// Generar firma HMAC SHA-256
function generateSignature(payload) {
  return crypto.createHmac('sha256', SIPAY_CONFIG.secret).update(payload).digest('hex')
}

// Hacer petición a Sipay con formato correcto
async function sipayRequest(endpoint, payload) {
  const url = `${SIPAY_CONFIG.endpoint}${endpoint}`
  
  // Formato correcto de Sipay: key, resource, nonce, mode, payload
  const body = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    nonce: Date.now().toString(),
    mode: 'sha256',
    payload: payload,
  }
  
  const bodyString = JSON.stringify(body)
  const signature = generateSignature(bodyString)
  
  console.log(`\n📤 POST ${endpoint}`)
  console.log('Body:', JSON.stringify(body, null, 2))

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

// Generar número de ticket único (solo numérico)
function generateTicket() {
  return Date.now().toString().slice(-10)
}

// ===== PRUEBAS =====

// TEST 1.1: Venta CIT con guardado de token
async function test_1_1(testId = '1.1') {
  console.log('\n' + '='.repeat(60))
  console.log(`TEST ${testId}: Venta CIT con guardado de token (0.01€)`)
  console.log('='.repeat(60))

  const ticket = generateTicket()
  const tokenId = `token${ticket}`
  
  const payload = {
    amount: '1',  // En céntimos: 1 = 0.01€
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    operation: 'all-in-one',
    pan: TEST_CARD.pan,
    expiry_month: TEST_CARD.expiry_month,
    expiry_year: TEST_CARD.expiry_year,
    cvc: TEST_CARD.cvv,
    token: tokenId,
    backup: '1',
  }

  const result = await sipayRequest('/mdwr/v1/all-in-one', payload)
  
  testResults.push({
    id: testId,
    tipo: 'Venta CIT + token',
    ticket,
    token: tokenId,
    importe: '0.01€',
    request_id: result.request_id,
    code: result.code,
    description: result.description || result.detail,
    url_3ds: result.payload?.url,
    transaction_id: result.payload?.transaction_id,
  })

  return { ticket, result, token: tokenId, transaction_id: result.payload?.transaction_id }
}

// TEST: Cancelación/Refund
async function test_cancelacion(transactionId, ticket, testId) {
  console.log('\n' + '='.repeat(60))
  console.log(`TEST ${testId}: Cancelación operación anterior`)
  console.log('='.repeat(60))

  const payload = {
    transaction_id: transactionId,
  }

  const result = await sipayRequest('/mdwr/v1/refund', payload)
  
  testResults.push({
    id: testId,
    tipo: 'Cancelación',
    ticket,
    transaction_id: transactionId,
    code: result.code,
    description: result.description || result.detail,
  })

  return result
}

// TEST: Venta MIT (Merchant Initiated Transaction)
async function test_MIT(cardToken, testId, mitReason, tipo) {
  console.log('\n' + '='.repeat(60))
  console.log(`TEST ${testId}: ${tipo}`)
  console.log('='.repeat(60))

  const ticket = generateTicket()
  
  const payload = {
    amount: '1',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    card_token: cardToken,
    sca_exemptions: 'MIT',
    mit_reason: mitReason,
  }

  const result = await sipayRequest('/mdwr/v1/authorization', payload)
  
  testResults.push({
    id: testId,
    tipo,
    ticket,
    token: cardToken,
    importe: '0.01€',
    code: result.code,
    description: result.description || result.detail,
    transaction_id: result.payload?.transaction_id,
  })

  return { ticket, result, transaction_id: result.payload?.transaction_id }
}

// TEST 3.2: Consulta de token
async function test_consulta(cardToken) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 3.2: Consulta de token')
  console.log('='.repeat(60))

  const payload = {
    token: cardToken,
  }

  const result = await sipayRequest('/mdwr/v1/card', payload)
  
  testResults.push({
    id: '3.2',
    tipo: 'Consulta token',
    token: cardToken,
    code: result.code,
    description: result.description || result.detail,
    card_mask: result.payload?.card_mask,
    card_brand: result.payload?.card_brand,
  })

  return result
}

// TEST 3.1: Unregister token
async function test_unregister(cardToken) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 3.1: Unregister token')
  console.log('='.repeat(60))

  const payload = {
    token: cardToken,
  }

  const result = await sipayRequest('/mdwr/v1/unregister', payload)
  
  testResults.push({
    id: '3.1',
    tipo: 'Unregister token',
    token: cardToken,
    code: result.code,
    description: result.description || result.detail,
  })

  return result
}

// ===== EJECUTAR BATERÍA COMPLETA =====

async function main() {
  console.log('\n🚀 BATERÍA DE PRUEBAS SIPAY - MINDMETRIC')
  console.log('Fecha:', new Date().toLocaleString('es-ES'))
  console.log('Entorno: SANDBOX')
  console.log('Tarjeta: ****' + TEST_CARD.pan.slice(-4))

  // ========================================
  // BLOQUE 1: CIT + Tokenización
  // ========================================
  
  // Test 1.1: Venta CIT con guardado de token
  const t1_1 = await test_1_1('1.1')
  
  // Test 1.2: Cancelación de la operación anterior (si hay transaction_id)
  if (t1_1.transaction_id) {
    await test_cancelacion(t1_1.transaction_id, t1_1.ticket, '1.2')
  }

  // Test 1.3: Venta CIT con token >0€
  const t1_3 = await test_1_1('1.3')
  
  // Test 1.4: Cancelación
  if (t1_3.transaction_id) {
    await test_cancelacion(t1_3.transaction_id, t1_3.ticket, '1.4')
  }

  // ========================================
  // BLOQUE 2: MIT (Merchant Initiated Transaction)
  // ========================================
  
  // Test 2.1: Venta CIT con guardado de token para MIT
  const t2_1 = await test_1_1('2.1')
  const savedToken = t2_1.token
  
  // Test 2.2: Cancelación
  if (t2_1.transaction_id) {
    await test_cancelacion(t2_1.transaction_id, t2_1.ticket, '2.2')
  }
  
  // Test 2.3: Venta MIT Recurrente
  const t2_3 = await test_MIT(savedToken, '2.3', 'R', 'Venta MIT Recurrente')
  
  // Test 2.4: Cancelación MIT
  if (t2_3.transaction_id) {
    await test_cancelacion(t2_3.transaction_id, t2_3.ticket, '2.4')
  }
  
  // Test 2.5: Venta MIT Compra única
  const t2_5 = await test_MIT(savedToken, '2.5', 'C', 'Venta MIT Compra única')
  
  // Test 2.6: Cancelación MIT
  if (t2_5.transaction_id) {
    await test_cancelacion(t2_5.transaction_id, t2_5.ticket, '2.6')
  }

  // ========================================
  // BLOQUE 3: Gestión de Tokens
  // ========================================
  
  // Test 3.2: Consulta de token
  await test_consulta(savedToken)

  // Test 3.1: Unregister token
  await test_unregister(savedToken)

  // ========================================
  // RESUMEN
  // ========================================
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE RESULTADOS')
  console.log('='.repeat(60))
  
  testResults.forEach(t => {
    const ok = t.code === 0 || t.code === '0'
    console.log(`${ok ? '✅' : '⚠️'} ${t.id}: ${t.tipo}`)
    console.log(`   Code: ${t.code} - ${t.description}`)
    if (t.ticket) console.log(`   Ticket: ${t.ticket}`)
    if (t.token) console.log(`   Token: ${t.token}`)
    if (t.transaction_id) console.log(`   Transaction: ${t.transaction_id}`)
    if (t.url_3ds) console.log(`   🔗 URL 3DS: ${t.url_3ds}`)
    console.log('')
  })

  // Guardar resultados
  fs.writeFileSync(
    './scripts/test-results.json',
    JSON.stringify(testResults, null, 2)
  )
  console.log('💾 Guardado en scripts/test-results.json')
}

main().catch(console.error)
