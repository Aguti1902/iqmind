/**
 * Script de prueba para la integración de Sipay
 * 
 * Uso:
 *   node test-sipay-integration.js
 * 
 * Este script prueba todos los endpoints de Sipay:
 * 1. Crear sesión de pago
 * 2. Procesar pago con token
 * 3. Pago recurrente (MIT)
 * 4. Reembolso
 * 5. Consultar token
 * 6. Borrar token
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60) + '\n')
}

async function makeRequest(endpoint, method, body) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    }
  }
}

// Test 1: Crear sesión de pago
async function testCreatePayment() {
  logSection('Test 1: Crear Sesión de Pago')

  const payload = {
    email: 'test@mindmetric.io',
    userName: 'Test User',
    amount: 0.50,
    userIQ: 120,
    lang: 'es',
    testData: {
      answers: [1, 2, 3, 4, 5],
      timeElapsed: 600,
      correctAnswers: 35,
      categoryScores: {
        verbal: 85,
        numerical: 90,
        spatial: 80,
      }
    }
  }

  log('📤 Request:', 'cyan')
  log(`POST ${BASE_URL}/api/sipay/create-payment`)
  console.log(JSON.stringify(payload, null, 2))

  const result = await makeRequest('/api/sipay/create-payment', 'POST', payload)

  log('\n📥 Response:', 'cyan')
  console.log(JSON.stringify(result.data, null, 2))

  if (result.ok && result.data.success) {
    log('\n✅ Test PASSED', 'green')
    return result.data
  } else {
    log('\n❌ Test FAILED', 'red')
    return null
  }
}

// Test 2: Procesar pago con token (simulado)
async function testProcessPayment(orderId) {
  logSection('Test 2: Procesar Pago con Token')

  // Nota: Este test requiere un token real de Sipay
  // En un entorno de prueba, usarías un token de prueba
  const payload = {
    orderId: orderId || 'order_test_123',
    cardToken: 'token_test_456', // Token de prueba
    email: 'test@mindmetric.io',
    amount: 0.50,
    description: 'Test de pago MindMetric',
    lang: 'es'
  }

  log('📤 Request:', 'cyan')
  log(`POST ${BASE_URL}/api/sipay/process-payment`)
  console.log(JSON.stringify(payload, null, 2))

  const result = await makeRequest('/api/sipay/process-payment', 'POST', payload)

  log('\n📥 Response:', 'cyan')
  console.log(JSON.stringify(result.data, null, 2))

  if (result.ok) {
    log('\n✅ Test PASSED (o requiere credenciales reales)', 'green')
    return result.data
  } else {
    log('\n⚠️  Test requiere credenciales reales de Sipay', 'yellow')
    log(`   Error: ${result.data.error}`, 'yellow')
    return null
  }
}

// Test 3: Pago recurrente
async function testRecurringPayment() {
  logSection('Test 3: Pago Recurrente (MIT)')

  const payload = {
    email: 'test@mindmetric.io',
    amount: 9.99,
    description: 'Suscripción mensual MindMetric Premium'
  }

  log('📤 Request:', 'cyan')
  log(`POST ${BASE_URL}/api/sipay/recurring-payment`)
  console.log(JSON.stringify(payload, null, 2))

  const result = await makeRequest('/api/sipay/recurring-payment', 'POST', payload)

  log('\n📥 Response:', 'cyan')
  console.log(JSON.stringify(result.data, null, 2))

  if (result.ok) {
    log('\n✅ Test PASSED', 'green')
    return result.data
  } else {
    log('\n⚠️  Test requiere usuario con token guardado', 'yellow')
    log(`   Error: ${result.data.error}`, 'yellow')
    return null
  }
}

// Test 4: Reembolso
async function testRefund(transactionId) {
  logSection('Test 4: Reembolso (Refund)')

  const payload = {
    transactionId: transactionId || 'txn_test_789',
    amount: 0.50,
    reason: 'Test de reembolso',
    email: 'test@mindmetric.io'
  }

  log('📤 Request:', 'cyan')
  log(`POST ${BASE_URL}/api/sipay/refund`)
  console.log(JSON.stringify(payload, null, 2))

  const result = await makeRequest('/api/sipay/refund', 'POST', payload)

  log('\n📥 Response:', 'cyan')
  console.log(JSON.stringify(result.data, null, 2))

  if (result.ok) {
    log('\n✅ Test PASSED', 'green')
    return result.data
  } else {
    log('\n⚠️  Test requiere transactionId real', 'yellow')
    log(`   Error: ${result.data.error}`, 'yellow')
    return null
  }
}

// Test 5: Consultar información de token
async function testCardInfo() {
  logSection('Test 5: Consultar Información de Token')

  const payload = {
    cardToken: 'token_test_456',
    email: 'test@mindmetric.io'
  }

  log('📤 Request:', 'cyan')
  log(`POST ${BASE_URL}/api/sipay/card-info`)
  console.log(JSON.stringify(payload, null, 2))

  const result = await makeRequest('/api/sipay/card-info', 'POST', payload)

  log('\n📥 Response:', 'cyan')
  console.log(JSON.stringify(result.data, null, 2))

  if (result.ok) {
    log('\n✅ Test PASSED', 'green')
    return result.data
  } else {
    log('\n⚠️  Test requiere token real', 'yellow')
    log(`   Error: ${result.data.error}`, 'yellow')
    return null
  }
}

// Test 6: Borrar token
async function testDeleteCard() {
  logSection('Test 6: Borrar Token de Tarjeta')

  const payload = {
    cardToken: 'token_test_456',
    email: 'test@mindmetric.io'
  }

  log('📤 Request:', 'cyan')
  log(`POST ${BASE_URL}/api/sipay/delete-card`)
  console.log(JSON.stringify(payload, null, 2))

  const result = await makeRequest('/api/sipay/delete-card', 'POST', payload)

  log('\n📥 Response:', 'cyan')
  console.log(JSON.stringify(result.data, null, 2))

  if (result.ok) {
    log('\n✅ Test PASSED', 'green')
    return result.data
  } else {
    log('\n⚠️  Test requiere token real', 'yellow')
    log(`   Error: ${result.data.error}`, 'yellow')
    return null
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n🧪 INICIANDO TESTS DE INTEGRACIÓN SIPAY', 'bright')
  log(`🔗 Base URL: ${BASE_URL}`, 'blue')
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  }

  try {
    // Test 1: Crear sesión de pago
    const paymentSession = await testCreatePayment()
    if (paymentSession && paymentSession.success) {
      results.passed++
    } else if (paymentSession === null) {
      results.failed++
    } else {
      results.warnings++
    }

    // Test 2: Procesar pago (requiere token real)
    const orderId = paymentSession?.orderId
    const payment = await testProcessPayment(orderId)
    if (payment && payment.success) {
      results.passed++
    } else if (payment === null) {
      results.warnings++
    } else {
      results.failed++
    }

    // Test 3: Pago recurrente (requiere usuario con token)
    const recurring = await testRecurringPayment()
    if (recurring && recurring.success) {
      results.passed++
    } else if (recurring === null) {
      results.warnings++
    } else {
      results.failed++
    }

    // Test 4: Reembolso (requiere transactionId real)
    const transactionId = payment?.transactionId
    const refund = await testRefund(transactionId)
    if (refund && refund.success) {
      results.passed++
    } else if (refund === null) {
      results.warnings++
    } else {
      results.failed++
    }

    // Test 5: Consultar token (requiere token real)
    const cardInfo = await testCardInfo()
    if (cardInfo) {
      results.passed++
    } else {
      results.warnings++
    }

    // Test 6: Borrar token (requiere token real)
    const deleteCard = await testDeleteCard()
    if (deleteCard) {
      results.passed++
    } else {
      results.warnings++
    }

  } catch (error) {
    log(`\n❌ Error ejecutando tests: ${error.message}`, 'red')
    results.failed++
  }

  // Resumen
  logSection('📊 RESUMEN DE TESTS')
  log(`✅ Passed:   ${results.passed}`, results.passed > 0 ? 'green' : 'reset')
  log(`❌ Failed:   ${results.failed}`, results.failed > 0 ? 'red' : 'reset')
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'reset')

  if (results.warnings > 0) {
    log('\n💡 Nota: Algunos tests requieren credenciales reales de Sipay', 'blue')
    log('   Configura las variables de entorno y vuelve a ejecutar', 'blue')
  }

  console.log('\n')
}

// Ejecutar
runAllTests().catch(console.error)

