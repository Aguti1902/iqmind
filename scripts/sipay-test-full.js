/**
 * Batería de pruebas Sipay COMPLETA
 * Con header Content-Signature correcto
 */

const crypto = require('crypto')
const fs = require('fs')

const SIPAY_CONFIG = {
  key: 'clicklabsdigital',
  secret: '3KsWEtN9J0z',
  resource: 'clicklabsdigital',
  endpoint: 'https://sandbox.sipay.es',
}

const testResults = []

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
    return { type: 'error', detail: error.message }
  }
}

function generateTicket() {
  return 'Psd2' + Date.now().toString().slice(-8)
}

// =============================================
// TESTS
// =============================================

// TEST 1.2: Cancelación (refund) del test 1.1
async function test_refund(transactionId, testId, amount) {
  console.log('\n' + '='.repeat(60))
  console.log(`TEST ${testId}: Cancelación/Refund`)
  console.log('='.repeat(60))
  
  const ticket = generateTicket()
  const result = await sipayRequest('/mdwr/v1/refund', {
    amount: amount || '50',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    transaction_id: transactionId,
  })
  
  testResults.push({
    id: testId,
    tipo: 'Cancelación/Refund',
    ticket,
    transaction_id: transactionId,
    result_code: result.code,
    result_detail: result.detail,
    result_description: result.description,
    response_transaction_id: result.payload?.transaction_id,
    full_response: result,
  })
  
  return result
}

// TEST 2.3: MIT Recurrente con card_token
async function test_MIT(cardToken, testId, mitReason, tipo) {
  console.log('\n' + '='.repeat(60))
  console.log(`TEST ${testId}: ${tipo}`)
  console.log('='.repeat(60))
  
  const ticket = generateTicket()
  const result = await sipayRequest('/mdwr/v1/authorization', {
    amount: '1',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    card_token: cardToken,
    sca_exemptions: 'MIT',
    mit_reason: mitReason,
  })
  
  testResults.push({
    id: testId,
    tipo,
    ticket,
    token: cardToken,
    result_code: result.code,
    result_detail: result.detail,
    result_description: result.description,
    transaction_id: result.payload?.transaction_id,
    full_response: result,
  })
  
  return result
}

// TEST 3.2: Consulta de token
async function test_consulta(cardToken) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 3.2: Consulta de token')
  console.log('='.repeat(60))
  
  const result = await sipayRequest('/mdwr/v1/card', {
    token: cardToken,
  })
  
  testResults.push({
    id: '3.2',
    tipo: 'Consulta token',
    token: cardToken,
    result_code: result.code,
    result_detail: result.detail,
    card_mask: result.payload?.masked_card,
    card_brand: result.payload?.card_brand,
    full_response: result,
  })
  
  return result
}

// TEST 3.1: Unregister token
async function test_unregister(cardToken) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 3.1: Unregister token')
  console.log('='.repeat(60))
  
  const result = await sipayRequest('/mdwr/v1/unregister', {
    token: cardToken,
  })
  
  testResults.push({
    id: '3.1',
    tipo: 'Unregister token',
    token: cardToken,
    result_code: result.code,
    result_detail: result.detail,
    full_response: result,
  })
  
  return result
}

// =============================================
// MAIN
// =============================================

async function main() {
  console.log('\n🚀 BATERÍA DE PRUEBAS SIPAY - MINDMETRIC')
  console.log('Fecha:', new Date().toLocaleString('es-ES'))
  console.log('Header: Content-Signature (correcto)')
  console.log('')

  // ==========================================
  // DATOS DEL TEST 1.1 (ya realizado en web)
  // ==========================================
  // Probar con diferentes formatos de transaction_id
  const TEST_1_1_TRANSACTION_ID = '000000000012906956'  // Formato largo con ceros
  // No tenemos el card_token aún, lo obtendremos del confirm
  
  // ==========================================
  // TEST 1.2: Cancelación del Test 1.1
  // ==========================================
  const refund1 = await test_refund(TEST_1_1_TRANSACTION_ID, '1.2', '50')

  // ==========================================
  // RESUMEN
  // ==========================================
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE RESULTADOS')
  console.log('='.repeat(60))
  
  testResults.forEach(t => {
    const ok = t.result_code === '0' || t.result_code === 0
    console.log(`${ok ? '✅' : '❌'} ${t.id}: ${t.tipo}`)
    console.log(`   Code: ${t.result_code} - ${t.result_detail}`)
    console.log(`   Description: ${t.result_description}`)
    if (t.ticket) console.log(`   Ticket: ${t.ticket}`)
    if (t.transaction_id) console.log(`   Transaction: ${t.transaction_id}`)
    console.log('')
  })

  // Guardar
  fs.writeFileSync(
    './scripts/test-results-full.json',
    JSON.stringify(testResults, null, 2)
  )
  console.log('💾 Guardado en scripts/test-results-full.json')
}

main().catch(console.error)
