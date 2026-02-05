/**
 * Script de Batería de Pruebas de Sipay
 * Ejecutar con: npx ts-node scripts/sipay-test-battery.ts
 */

import { createHmac } from 'crypto'

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
const testResults: any[] = []

// Generar firma HMAC SHA-256
function generateSignature(payload: string): string {
  const hmac = createHmac('sha256', SIPAY_CONFIG.secret)
  return hmac.update(payload).digest('hex')
}

// Hacer petición a Sipay
async function sipayRequest(endpoint: string, data: any): Promise<any> {
  const url = `${SIPAY_CONFIG.endpoint}${endpoint}`
  const payload = JSON.stringify(data)
  const signature = generateSignature(payload)

  console.log(`\n📤 Request to ${endpoint}:`, JSON.stringify(data, null, 2))

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  })

  const result = await response.json()
  console.log(`📥 Response:`, JSON.stringify(result, null, 2))
  
  return result
}

// Generar número de ticket único
function generateTicket(): string {
  return `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}

// ===== PRUEBAS =====

async function test_1_1_VentaCIT_AVS(): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 1.1: Venta CIT con guardado de token importe 0€ (AVS)')
  console.log('='.repeat(60))

  const ticket = generateTicket()
  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    amount: 1, // 0.01€ en céntimos
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    pan: TEST_CARD.pan,
    expiry_month: TEST_CARD.expiry_month,
    expiry_year: TEST_CARD.expiry_year,
    cvc: TEST_CARD.cvv,
    token: `token_${ticket}`, // Solicitar tokenización
    backup: '1', // Backup token
  }

  const result = await sipayRequest('/mdwr/v1/all-in-one', data)
  
  testResults.push({
    id: '1.1',
    tipo: 'Venta CIT + token (AVS)',
    ticket,
    importe: '0.01€',
    resultado: result,
  })

  return { ticket, result, token: `token_${ticket}` }
}

async function test_1_2_Cancelacion(transactionId: string, ticket: string): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 1.2: Cancelación operación anterior')
  console.log('='.repeat(60))

  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    order: ticket,
    transaction_id: transactionId,
  }

  const result = await sipayRequest('/mdwr/v1/refund', data)
  
  testResults.push({
    id: '1.2',
    tipo: 'Cancelación',
    ticket,
    importe: '0.01€',
    resultado: result,
  })

  return result
}

async function test_1_3_VentaCIT(): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 1.3: Venta CIT con guardado de token importe >0€')
  console.log('='.repeat(60))

  const ticket = generateTicket()
  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    amount: 1, // 0.01€ en céntimos
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    pan: TEST_CARD.pan,
    expiry_month: TEST_CARD.expiry_month,
    expiry_year: TEST_CARD.expiry_year,
    cvc: TEST_CARD.cvv,
    token: `token_${ticket}`,
    backup: '1',
  }

  const result = await sipayRequest('/mdwr/v1/all-in-one', data)
  
  testResults.push({
    id: '1.3',
    tipo: 'Venta CIT + token',
    ticket,
    importe: '0.01€',
    resultado: result,
  })

  return { ticket, result, token: `token_${ticket}` }
}

async function test_2_1_VentaConToken(): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 2.1: Venta con guardado de token')
  console.log('='.repeat(60))

  const ticket = generateTicket()
  const tokenId = `mstk_${Date.now()}`
  
  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    amount: 1,
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    pan: TEST_CARD.pan,
    expiry_month: TEST_CARD.expiry_month,
    expiry_year: TEST_CARD.expiry_year,
    cvc: TEST_CARD.cvv,
    token: tokenId,
    backup: '1',
  }

  const result = await sipayRequest('/mdwr/v1/all-in-one', data)
  
  testResults.push({
    id: '2.1',
    tipo: 'Venta + token para MIT',
    ticket,
    token: tokenId,
    importe: '0.01€',
    resultado: result,
  })

  return { ticket, result, token: tokenId }
}

async function test_2_3_VentaMIT_Recurrente(cardToken: string): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 2.3: Venta MIT Recurrente')
  console.log('='.repeat(60))

  const ticket = generateTicket()
  
  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    amount: 1,
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    card_token: cardToken,
    sca_exemptions: 'MIT',
    mit_reason: 'R', // Recurrente
  }

  const result = await sipayRequest('/mdwr/v1/authorization', data)
  
  testResults.push({
    id: '2.3',
    tipo: 'Venta MIT Recurrente',
    ticket,
    token: cardToken,
    importe: '0.01€',
    resultado: result,
  })

  return { ticket, result }
}

async function test_2_5_VentaMIT_CompraUnica(cardToken: string): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 2.5: Venta MIT Compra Única')
  console.log('='.repeat(60))

  const ticket = generateTicket()
  
  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    amount: 1,
    currency: 'EUR',
    order: ticket,
    reconciliation: ticket,
    card_token: cardToken,
    sca_exemptions: 'MIT',
    mit_reason: 'C', // Compra única
  }

  const result = await sipayRequest('/mdwr/v1/authorization', data)
  
  testResults.push({
    id: '2.5',
    tipo: 'Venta MIT Compra Única',
    ticket,
    token: cardToken,
    importe: '0.01€',
    resultado: result,
  })

  return { ticket, result }
}

async function test_3_1_Unregister(cardToken: string): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 3.1: Unregister - baja de un token')
  console.log('='.repeat(60))

  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    token: cardToken,
  }

  const result = await sipayRequest('/mdwr/v1/unregister', data)
  
  testResults.push({
    id: '3.1',
    tipo: 'Unregister token',
    token: cardToken,
    resultado: result,
  })

  return result
}

async function test_3_2_ConsultaToken(cardToken: string): Promise<any> {
  console.log('\n' + '='.repeat(60))
  console.log('TEST 3.2: Consulta de un token')
  console.log('='.repeat(60))

  const data = {
    key: SIPAY_CONFIG.key,
    resource: SIPAY_CONFIG.resource,
    mode: 'sha',
    nonce: Date.now().toString(),
    token: cardToken,
  }

  const result = await sipayRequest('/mdwr/v1/card', data)
  
  testResults.push({
    id: '3.2',
    tipo: 'Consulta token',
    token: cardToken,
    resultado: result,
  })

  return result
}

// ===== EJECUTAR TODAS LAS PRUEBAS =====

async function runAllTests() {
  console.log('\n' + '🚀'.repeat(30))
  console.log('INICIANDO BATERÍA DE PRUEBAS SIPAY')
  console.log('Fecha:', new Date().toISOString())
  console.log('Entorno: SANDBOX')
  console.log('🚀'.repeat(30))

  try {
    // TEST 1.1 - Venta CIT + token (AVS)
    const test1_1 = await test_1_1_VentaCIT_AVS()
    
    // TEST 1.2 - Cancelación (si la venta fue exitosa)
    if (test1_1.result?.payload?.transaction_id) {
      await test_1_2_Cancelacion(test1_1.result.payload.transaction_id, test1_1.ticket)
    }

    // TEST 1.3 - Venta CIT + token
    const test1_3 = await test_1_3_VentaCIT()
    
    // TEST 1.4 - Cancelación
    if (test1_3.result?.payload?.transaction_id) {
      await test_1_2_Cancelacion(test1_3.result.payload.transaction_id, test1_3.ticket)
    }

    // TEST 2.1 - Venta con guardado de token (para MIT)
    const test2_1 = await test_2_1_VentaConToken()
    const savedToken = test2_1.result?.payload?.token || test2_1.token

    // TEST 2.2 - Cancelación
    if (test2_1.result?.payload?.transaction_id) {
      await test_1_2_Cancelacion(test2_1.result.payload.transaction_id, test2_1.ticket)
    }

    // TEST 2.3 - Venta MIT Recurrente (usando token de 2.1)
    if (savedToken) {
      const test2_3 = await test_2_3_VentaMIT_Recurrente(savedToken)
      
      // TEST 2.4 - Cancelación
      if (test2_3.result?.payload?.transaction_id) {
        await test_1_2_Cancelacion(test2_3.result.payload.transaction_id, test2_3.ticket)
      }
    }

    // TEST 2.5 - Venta MIT Compra única (usando token de 2.1)
    if (savedToken) {
      const test2_5 = await test_2_5_VentaMIT_CompraUnica(savedToken)
      
      // TEST 2.6 - Cancelación
      if (test2_5.result?.payload?.transaction_id) {
        await test_1_2_Cancelacion(test2_5.result.payload.transaction_id, test2_5.ticket)
      }
    }

    // TEST 3.2 - Consulta token (antes de borrarlo)
    if (savedToken) {
      await test_3_2_ConsultaToken(savedToken)
    }

    // TEST 3.1 - Unregister token
    if (savedToken) {
      await test_3_1_Unregister(savedToken)
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  }

  // Mostrar resumen
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE RESULTADOS')
  console.log('='.repeat(60))
  
  testResults.forEach(test => {
    const status = test.resultado?.code === 0 || test.resultado?.code === '0' ? '✅' : '❌'
    console.log(`${status} ${test.id}: ${test.tipo}`)
    console.log(`   Ticket: ${test.ticket || 'N/A'}`)
    console.log(`   Code: ${test.resultado?.code}`)
    console.log(`   Description: ${test.resultado?.description || test.resultado?.detail}`)
    if (test.resultado?.payload?.transaction_id) {
      console.log(`   Transaction ID: ${test.resultado.payload.transaction_id}`)
    }
    console.log('')
  })

  // Guardar resultados en archivo
  const fs = require('fs')
  fs.writeFileSync(
    '/Users/guti/Desktop/CURSOR WEBS/IQLEVEL/scripts/test-results.json',
    JSON.stringify(testResults, null, 2)
  )
  console.log('\n💾 Resultados guardados en scripts/test-results.json')
}

// Ejecutar
runAllTests()
