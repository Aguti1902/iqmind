/**
 * Batería de pruebas Sipay - MDWR 2.0 PSD2
 * 
 * Ejecutar con: node scripts/sipay-test-battery.js <test>
 * 
 * Tests disponibles:
 *   refund <transaction_id>        - Test 1.2: Cancelación CIT
 *   mit-r <card_token>             - Test 2.1+2.2: MIT Recurrente + Cancelación
 *   mit-c <card_token>             - Test 3.1+3.2: MIT Compra única + Cancelación (si aplica)
 *   card <card_token>              - Consulta de token
 *   unregister <card_token>        - Baja de token
 *   all <transaction_id> <token>   - Ejecutar todos los tests
 *   new-cit                        - Nueva CIT con tarjeta directa (requiere 3DS manual)
 */

const crypto = require('crypto')
const fs = require('fs')

const SIPAY_CONFIG = {
  key: 'clicklabsdigital',
  secret: '3KsWEtN9J0z',
  resource: 'clicklabsdigital',
  endpoint: 'https://sandbox.sipay.es',
}

const TEST_CARD = {
  pan: '4548810000000003',
  month: '12',
  year: '2049',
  cvv: '123',
}

// Resultados de los tests
const results = []

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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Signature': signature,
    },
    body: bodyString,
  })

  const result = await response.json()
  return result
}

function generateTicket() {
  return 'Test' + Date.now().toString().slice(-8)
}

function logResult(testId, testName, result, details = {}) {
  const success = result.type === 'success'
  const entry = {
    testId,
    testName,
    success,
    code: result.code,
    detail: result.detail,
    description: result.description,
    transactionId: result.payload?.transaction_id || null,
    token: result.payload?.token || result.payload?.card_token || null,
    amount: result.payload?.amount || null,
    approval: result.payload?.approval || null,
    ...details,
    timestamp: new Date().toISOString(),
  }
  results.push(entry)
  
  console.log(`\n${success ? '✅' : '❌'} [${testId}] ${testName}`)
  console.log(`   Code: ${result.code} | Detail: ${result.detail}`)
  console.log(`   Description: ${result.description}`)
  if (entry.transactionId) console.log(`   Transaction ID: ${entry.transactionId}`)
  if (entry.token) console.log(`   Token: ${entry.token}`)
  if (entry.amount) console.log(`   Amount: ${entry.amount}`)
  if (entry.approval) console.log(`   Approval: ${entry.approval}`)
  
  return entry
}

// ============================
// TEST 1.2: Refund (Cancelación CIT)
// ============================
async function testRefund(transactionId) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 1.2: Cancelación CIT (Refund)')
  console.log('='.repeat(60))

  const ticket = Date.now().toString().slice(-10)
  const result = await sipayRequest('/mdwr/v1/refund', {
    amount: '50',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    transaction_id: transactionId,
  })

  return logResult('1.2', 'Cancelación CIT (Refund)', result, { originalTransactionId: transactionId })
}

// ============================
// TEST 2.1: MIT Recurrente (Venta)
// ============================
async function testMitRecurrentSale(cardToken) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 2.1: MIT Recurrente - Venta')
  console.log('='.repeat(60))

  const ticket = Date.now().toString().slice(-10)
  const result = await sipayRequest('/mdwr/v1/authorization', {
    amount: '999',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    token: cardToken,
    sca_exemptions: 'MIT',
    mit_reason: 'R',
  })

  return logResult('2.1', 'MIT Recurrente - Venta (9.99€)', result)
}

// ============================
// TEST 2.2: MIT Recurrente (Cancelación)
// ============================
async function testMitRecurrentRefund(transactionId) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 2.2: MIT Recurrente - Cancelación')
  console.log('='.repeat(60))

  const ticket = Date.now().toString().slice(-10)
  const result = await sipayRequest('/mdwr/v1/refund', {
    amount: '999',
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    transaction_id: transactionId,
  })

  return logResult('2.2', 'MIT Recurrente - Cancelación', result, { originalTransactionId: transactionId })
}

// ============================
// TEST: Consulta de token
// ============================
async function testCardConsult(cardToken) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST: Consulta de token')
  console.log('='.repeat(60))

  const result = await sipayRequest('/mdwr/v1/card', {
    token: cardToken,
  })

  return logResult('CARD', 'Consulta de token', result)
}

// ============================
// TEST: Baja de token (Unregister)
// ============================
async function testUnregister(cardToken) {
  console.log('\n' + '='.repeat(60))
  console.log('TEST: Baja de token (Unregister)')
  console.log('='.repeat(60))

  const result = await sipayRequest('/mdwr/v1/unregister', {
    token: cardToken,
  })

  return logResult('UNREG', 'Baja de token (Unregister)', result)
}

// ============================
// Nueva CIT con tokenización (requiere 3DS manual)
// ============================
async function testNewCIT() {
  console.log('\n' + '='.repeat(60))
  console.log('NUEVA CIT con tokenización')
  console.log('='.repeat(60))

  const ticket = generateTicket()
  const tokenId = 'mndmtrc_' + ticket

  const result = await sipayRequest('/mdwr/v1/all-in-one', {
    amount: '50',
    currency: 'EUR',
    pan: TEST_CARD.pan,
    month: TEST_CARD.month,
    year: TEST_CARD.year,
    cvv: TEST_CARD.cvv,
    operation: 'all-in-one',
    order: ticket,
    reconciliation: ticket,
    token: tokenId,
    url_ok: 'https://mindmetric.io/api/sipay/confirm-payment',
    url_ko: 'https://mindmetric.io/es/checkout-payment?error=true',
  })

  const entry = logResult('1.1-NEW', 'Nueva CIT + Tokenización', result)
  
  const requestId = result?.payload?.request_id || result?.request_id
  const threeDSUrl = result?.payload?.url
  
  if (threeDSUrl) {
    console.log(`\n🔗 URL 3DS: ${threeDSUrl}`)
    console.log(`🔑 request_id: ${requestId}`)
    console.log(`🏷️ token solicitado: ${tokenId}`)
    console.log(`\n⚠️  Abre la URL 3DS en el navegador, completa la autenticación,`)
    console.log(`    y luego ejecuta: node scripts/sipay-test-battery.js confirm ${requestId}`)
  }
  
  return { ...entry, requestId, threeDSUrl, tokenId }
}

// ============================
// Confirm (después de 3DS manual)
// ============================
async function testConfirm(requestId) {
  console.log('\n' + '='.repeat(60))
  console.log('CONFIRM después de 3DS')
  console.log('='.repeat(60))

  const result = await sipayRequest('/mdwr/v1/all-in-one/confirm', {
    request_id: requestId,
  })

  const entry = logResult('CONFIRM', 'Confirm después de 3DS', result)
  
  if (result.type === 'success') {
    console.log('\n🎉 ¡TRANSACCIÓN CONFIRMADA!')
    console.log(`   Transaction ID: ${result.payload?.transaction_id}`)
    console.log(`   Card Token: ${result.payload?.token}`)
    console.log(`   Masked Card: ${result.payload?.masked_card}`)
    console.log(`\n📋 Ahora puedes ejecutar el resto de tests con:`)
    console.log(`   node scripts/sipay-test-battery.js all ${result.payload?.transaction_id} ${result.payload?.token}`)
  }
  
  return entry
}

// ============================
// Ejecutar TODOS los tests
// ============================
async function runAll(transactionId, cardToken) {
  console.log('\n🚀 EJECUTANDO BATERÍA COMPLETA DE PRUEBAS')
  console.log(`   Transaction ID: ${transactionId}`)
  console.log(`   Card Token: ${cardToken}`)
  console.log('='.repeat(60))

  // 1.2: Refund CIT
  await testRefund(transactionId)
  await sleep(1000)

  // 2.1: MIT Recurrente Venta
  const mitResult = await testMitRecurrentSale(cardToken)
  await sleep(1000)

  // 2.2: MIT Recurrente Cancelación
  if (mitResult.transactionId) {
    await testMitRecurrentRefund(mitResult.transactionId)
    await sleep(1000)
  } else {
    console.log('\n⚠️  Saltando test 2.2 (MIT no generó transaction_id)')
  }

  // Consulta de token
  await testCardConsult(cardToken)
  await sleep(1000)

  // Baja de token
  await testUnregister(cardToken)

  // Resumen
  printSummary()
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function printSummary() {
  console.log('\n\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE RESULTADOS')
  console.log('='.repeat(60))
  
  const tableData = results.map(r => ({
    Test: r.testId,
    Nombre: r.testName.substring(0, 35),
    Resultado: r.success ? '✅ OK' : '❌ FAIL',
    'Transaction ID': r.transactionId || '-',
    Detalle: r.detail,
  }))
  
  console.table(tableData)
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  console.log(`\n✅ Pasaron: ${passed} | ❌ Fallaron: ${failed} | Total: ${results.length}`)
  
  // Guardar resultados
  const outputPath = './scripts/test-battery-results.json'
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\n💾 Resultados guardados en: ${outputPath}`)
}

// ============================
// MAIN
// ============================
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('🧪 Sipay Test Battery - MDWR 2.0 PSD2')
  console.log('Fecha:', new Date().toLocaleString('es-ES'))
  console.log('Entorno: SANDBOX')

  switch (command) {
    case 'refund':
      if (!args[1]) { console.log('Uso: refund <transaction_id>'); return }
      await testRefund(args[1])
      break

    case 'mit-r':
      if (!args[1]) { console.log('Uso: mit-r <card_token>'); return }
      const mitResult = await testMitRecurrentSale(args[1])
      if (mitResult.transactionId) {
        await sleep(1000)
        await testMitRecurrentRefund(mitResult.transactionId)
      }
      break

    case 'card':
      if (!args[1]) { console.log('Uso: card <card_token>'); return }
      await testCardConsult(args[1])
      break

    case 'unregister':
      if (!args[1]) { console.log('Uso: unregister <card_token>'); return }
      await testUnregister(args[1])
      break

    case 'new-cit':
      await testNewCIT()
      break

    case 'confirm':
      if (!args[1]) { console.log('Uso: confirm <request_id>'); return }
      await testConfirm(args[1])
      break

    case 'all':
      if (!args[1] || !args[2]) { console.log('Uso: all <transaction_id> <card_token>'); return }
      await runAll(args[1], args[2])
      break

    default:
      console.log(`
Uso: node scripts/sipay-test-battery.js <comando> [args]

Comandos:
  new-cit                          Nueva CIT + tokenización (inicia 3DS)
  confirm <request_id>             Confirmar después de 3DS
  refund <transaction_id>          Refund de una transacción
  mit-r <card_token>               MIT Recurrente (venta + cancelación)
  card <card_token>                Consulta de token
  unregister <card_token>          Baja de token
  all <transaction_id> <token>     Todos los tests

Flujo recomendado:
  1. node scripts/sipay-test-battery.js new-cit
  2. Abrir URL 3DS en navegador y completar autenticación
  3. node scripts/sipay-test-battery.js confirm <request_id>
  4. node scripts/sipay-test-battery.js all <transaction_id> <card_token>
      `)
  }
  
  if (results.length > 0) printSummary()
}

main().catch(console.error)
