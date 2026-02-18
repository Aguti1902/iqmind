/**
 * Simular flujo completo: all-in-one → 3DS (auto) → confirm
 * Para obtener el transaction_id real
 */

const crypto = require('crypto')

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
  console.log('Payload:', JSON.stringify(payloadData, null, 2))

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
}

function generateTicket() {
  return 'Test' + Date.now().toString().slice(-8)
}

async function main() {
  console.log('\n🚀 FLUJO COMPLETO: Tarjeta directa → all-in-one → confirm')
  console.log('Fecha:', new Date().toLocaleString('es-ES'))

  const ticket = generateTicket()

  // ==================================================
  // PASO 1: all-in-one con datos de tarjeta directos
  // (Esto simula lo que haría FastPay + all-in-one)
  // ==================================================
  console.log('\n' + '='.repeat(60))
  console.log('PASO 1: /all-in-one con tarjeta directa + tokenización')
  console.log('='.repeat(60))

  const allinoneResult = await sipayRequest('/mdwr/v1/all-in-one', {
    amount: '1',
    currency: 'EUR',
    pan: TEST_CARD.pan,
    month: TEST_CARD.month,
    year: TEST_CARD.year,
    cvv: TEST_CARD.cvv,
    operation: 'all-in-one',
    order: ticket,
    reconciliation: ticket,
    token: 'mindmetric_' + ticket,
    url_ok: 'https://mindmetric.io/api/sipay/confirm-payment',
    url_ko: 'https://mindmetric.io/es/checkout-payment?error=true',
  })

  const threeDSUrl = allinoneResult?.payload?.url
  const requestId = allinoneResult?.request_id || allinoneResult?.payload?.request_id

  console.log('\n🔗 URL 3DS:', threeDSUrl)
  console.log('🔑 request_id:', requestId)

  if (!requestId) {
    console.log('❌ No se obtuvo request_id, abortando')
    return
  }

  // ==================================================
  // PASO 2: Confirm (después de 3DS - en sandbox auto)
  // ==================================================
  console.log('\n' + '='.repeat(60))
  console.log('PASO 2: /all-in-one/confirm')
  console.log('Esperando 3 segundos para que 3DS se procese...')
  console.log('='.repeat(60))

  await new Promise(r => setTimeout(r, 3000))

  const confirmResult = await sipayRequest('/mdwr/v1/all-in-one/confirm', {
    request_id: requestId,
  })

  if (confirmResult.type === 'success') {
    console.log('\n✅ ¡TRANSACCIÓN CONFIRMADA!')
    console.log('🧾 transaction_id:', confirmResult.payload?.transaction_id)
    console.log('💳 token:', confirmResult.payload?.token)
    console.log('💰 amount:', confirmResult.payload?.amount)
    console.log('🃏 masked_card:', confirmResult.payload?.masked_card)
    console.log('🏦 authorizator:', confirmResult.payload?.authorizator)
    console.log('✅ approval:', confirmResult.payload?.approval)

    const transactionId = confirmResult.payload?.transaction_id
    const cardToken = confirmResult.payload?.token

    // ==================================================
    // PASO 3: Refund (cancelación)
    // ==================================================
    if (transactionId) {
      console.log('\n' + '='.repeat(60))
      console.log('PASO 3: /refund (cancelación)')
      console.log('='.repeat(60))

      const refundTicket = generateTicket()
      const refundResult = await sipayRequest('/mdwr/v1/refund', {
        amount: '1',
        currency: 'EUR',
        order: refundTicket,
        reconciliation: refundTicket,
        transaction_id: transactionId,
      })

      if (refundResult.type === 'success') {
        console.log('\n✅ ¡REFUND EXITOSO!')
        console.log('🧾 refund transaction_id:', refundResult.payload?.transaction_id)
      }
    }

    // ==================================================
    // PASO 4: Consulta de token
    // ==================================================
    if (cardToken) {
      console.log('\n' + '='.repeat(60))
      console.log('PASO 4: /card (consulta token)')
      console.log('='.repeat(60))

      await sipayRequest('/mdwr/v1/card', {
        token: cardToken,
      })
    }

    // ==================================================
    // PASO 5: MIT Recurrente
    // ==================================================
    if (cardToken) {
      console.log('\n' + '='.repeat(60))
      console.log('PASO 5: MIT Recurrente')
      console.log('='.repeat(60))

      const mitTicket = generateTicket()
      const mitResult = await sipayRequest('/mdwr/v1/authorization', {
        amount: '1',
        currency: 'EUR',
        order: mitTicket,
        reconciliation: mitTicket,
        card_token: cardToken,
        sca_exemptions: 'MIT',
        mit_reason: 'R',
      })

      if (mitResult.type === 'success' && mitResult.payload?.transaction_id) {
        // Cancelar MIT
        console.log('\n' + '='.repeat(60))
        console.log('PASO 5b: Cancelación MIT Recurrente')
        console.log('='.repeat(60))

        const mitRefundTicket = generateTicket()
        await sipayRequest('/mdwr/v1/refund', {
          amount: '1',
          currency: 'EUR',
          order: mitRefundTicket,
          reconciliation: mitRefundTicket,
          transaction_id: mitResult.payload.transaction_id,
        })
      }
    }

    // ==================================================
    // PASO 6: MIT Compra única
    // ==================================================
    if (cardToken) {
      console.log('\n' + '='.repeat(60))
      console.log('PASO 6: MIT Compra única')
      console.log('='.repeat(60))

      const mitTicket2 = generateTicket()
      const mitResult2 = await sipayRequest('/mdwr/v1/authorization', {
        amount: '1',
        currency: 'EUR',
        order: mitTicket2,
        reconciliation: mitTicket2,
        card_token: cardToken,
        sca_exemptions: 'MIT',
        mit_reason: 'C',
      })

      if (mitResult2.type === 'success' && mitResult2.payload?.transaction_id) {
        console.log('\n' + '='.repeat(60))
        console.log('PASO 6b: Cancelación MIT Compra única')
        console.log('='.repeat(60))

        const mitRefundTicket2 = generateTicket()
        await sipayRequest('/mdwr/v1/refund', {
          amount: '1',
          currency: 'EUR',
          order: mitRefundTicket2,
          reconciliation: mitRefundTicket2,
          transaction_id: mitResult2.payload.transaction_id,
        })
      }
    }

    // ==================================================
    // PASO 7: Unregister token
    // ==================================================
    if (cardToken) {
      console.log('\n' + '='.repeat(60))
      console.log('PASO 7: Unregister token')
      console.log('='.repeat(60))

      await sipayRequest('/mdwr/v1/unregister', {
        token: cardToken,
      })
    }

  } else {
    console.log('\n❌ Confirm falló:', confirmResult.detail)
    console.log('Puede que la 3DS no se haya completado automáticamente en sandbox')
    console.log('El request_id para confirm manual es:', requestId)
  }
}

main().catch(console.error)
