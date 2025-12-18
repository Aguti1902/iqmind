#!/usr/bin/env node

/**
 * 🧪 Script de Prueba: Integración Stripe para Reembolsos
 * 
 * Este script prueba la lógica de reembolsos ANTES de implementarla en n8n.
 * 
 * USO:
 *   node test-stripe-refund.js <email-cliente>
 * 
 * EJEMPLO:
 *   node test-stripe-refund.js test@example.com
 */

const https = require('https');

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
const TEST_MODE = true; // Cambiar a false para producción

// ═══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

/**
 * Hacer petición a la API de Stripe
 */
function stripeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(json);
          } else {
            resolve(json);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

/**
 * Buscar cliente en Stripe por email
 */
async function buscarCliente(email) {
  console.log(`\n🔍 Buscando cliente: ${email}`);
  
  try {
    const query = encodeURIComponent(`email:'${email}'`);
    const result = await stripeRequest('GET', `/v1/customers/search?query=${query}`);
    
    if (result.data && result.data.length > 0) {
      const customer = result.data[0];
      console.log(`✅ Cliente encontrado: ${customer.id}`);
      console.log(`   - Email: ${customer.email}`);
      console.log(`   - Creado: ${new Date(customer.created * 1000).toLocaleDateString()}`);
      return customer;
    } else {
      console.log(`❌ Cliente NO encontrado`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error buscando cliente:`, error.message);
    return null;
  }
}

/**
 * Obtener todos los cargos de un cliente
 */
async function obtenerCargos(customerId) {
  console.log(`\n💳 Obteniendo cargos del cliente...`);
  
  try {
    const result = await stripeRequest('GET', `/v1/charges?customer=${customerId}&limit=100`);
    console.log(`✅ ${result.data.length} cargos encontrados`);
    
    // Mostrar detalles
    result.data.forEach((charge, index) => {
      const monto = (charge.amount / 100).toFixed(2);
      const fecha = new Date(charge.created * 1000).toLocaleDateString();
      const estado = charge.status === 'succeeded' ? '✅' : '❌';
      const reembolsado = charge.refunded ? '🔄 REEMBOLSADO' : '';
      
      console.log(`   ${index + 1}. ${estado} ${monto}€ - ${fecha} - ${charge.id} ${reembolsado}`);
    });
    
    return result.data;
  } catch (error) {
    console.error(`❌ Error obteniendo cargos:`, error.message);
    return [];
  }
}

/**
 * Obtener suscripciones activas
 */
async function obtenerSuscripciones(customerId) {
  console.log(`\n📅 Obteniendo suscripciones...`);
  
  try {
    const result = await stripeRequest('GET', `/v1/subscriptions?customer=${customerId}&status=all&limit=100`);
    console.log(`✅ ${result.data.length} suscripciones encontradas`);
    
    // Mostrar detalles
    result.data.forEach((sub, index) => {
      const estado = sub.status === 'active' ? '✅ ACTIVA' : 
                     sub.status === 'trialing' ? '🆓 TRIAL' : 
                     sub.status === 'canceled' ? '❌ CANCELADA' : sub.status;
      const plan = (sub.plan.amount / 100).toFixed(2);
      const intervalo = sub.plan.interval === 'month' ? 'mensual' : 'quincenal';
      
      console.log(`   ${index + 1}. ${estado} - ${plan}€ ${intervalo} - ${sub.id}`);
    });
    
    return result.data;
  } catch (error) {
    console.error(`❌ Error obteniendo suscripciones:`, error.message);
    return [];
  }
}

/**
 * Evaluar si cumple con la política de reembolsos
 */
function evaluarPolitica(customer, charges, subscriptions) {
  console.log(`\n⚖️  EVALUANDO POLÍTICA DE REEMBOLSOS\n${'═'.repeat(50)}`);
  
  const ahora = Math.floor(Date.now() / 1000);
  const hace30Dias = ahora - (30 * 24 * 60 * 60);
  
  // Buscar pagos iniciales (0.50€ cada uno)
  const pagosIniciales = charges.filter(c => 
    c.amount === 50 && 
    c.status === 'succeeded'
  );
  
  // Buscar suscripción activa
  const suscripcionActiva = subscriptions.find(s => 
    s.status === 'active' || s.status === 'trialing'
  );
  
  // EVALUACIÓN: PAGO INICIAL (1€) - NO REEMBOLSABLE
  if (pagosIniciales.length >= 2) {
    const primerPago = pagosIniciales.sort((a, b) => a.created - b.created)[0];
    const diasDesdeCompra = Math.floor((ahora - primerPago.created) / (24 * 60 * 60));
    
    console.log(`\n📋 PAGO INICIAL (1€):`);
    console.log(`   - Pagos de 0.50€ encontrados: ${pagosIniciales.length}`);
    console.log(`   - Primer pago hace: ${diasDesdeCompra} días`);
    console.log(`   - ❌ POLÍTICA: El pago inicial de 1€ NO es reembolsable`);
    console.log(`   - Razón: Contenido digital ya entregado (resultado del test)`);
    console.log(`   - Acción: Explicar política + ofrecer soporte técnico`);
    
    // El pago inicial NUNCA es reembolsable
    return {
      cumple: false,
      tipo: 'REEMBOLSO_INICIAL',
      razon: 'El pago inicial de 1€ NO es reembolsable - es contenido digital ya entregado (resultado del test)',
      accion_sugerida: 'Explicar política de forma empática + ofrecer soporte técnico si hubo problemas con el test'
    };
  }
  
  // EVALUACIÓN: SUSCRIPCIÓN
  const cargosSuscripcion = charges.filter(c => 
    c.amount >= 999 && 
    c.status === 'succeeded'
  );
  
  if (cargosSuscripcion.length > 0) {
    const ultimoCargo = cargosSuscripcion.sort((a, b) => b.created - a.created)[0];
    const dentroDeVentana = ultimoCargo.created > hace30Dias;
    const diasDesdeUltimoCargo = Math.floor((ahora - ultimoCargo.created) / (24 * 60 * 60));
    
    console.log(`\n📅 SUSCRIPCIÓN:`);
    console.log(`   - Cargos de suscripción: ${cargosSuscripcion.length}`);
    console.log(`   - Último cargo hace: ${diasDesdeUltimoCargo} días`);
    console.log(`   - Monto: ${(ultimoCargo.amount / 100).toFixed(2)}€`);
    console.log(`   - Dentro de ventana 30 días: ${dentroDeVentana ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   - Suscripción activa: ${suscripcionActiva ? '✅ SÍ (' + suscripcionActiva.id + ')' : '❌ NO'}`);
    
    console.log(`\n⚠️  NOTA: Para reembolso de suscripción, se requiere:`);
    console.log(`   - Indisponibilidad del servicio > 24h`);
    console.log(`   - Problemas técnicos documentados`);
    console.log(`   - Errores de facturación (doble cargo, etc.)`);
    console.log(`\n   ❌ NO reembolsable por:`);
    console.log(`   - Cambio de opinión`);
    console.log(`   - "Olvidé cancelar"`);
    console.log(`   - "Es muy caro"`);
    
    // Por ahora, asumimos que NO cumple (requiere evaluación manual del motivo)
    return {
      cumple: false,
      tipo: 'REEMBOLSO_SUSCRIPCION',
      razon: 'Requiere evaluación manual del motivo (problemas técnicos, etc.)',
      charge_ids: [ultimoCargo.id],
      subscription_id: suscripcionActiva?.id,
      monto_total: ultimoCargo.amount,
      nota: 'Este caso requiere que un humano o la IA evalúe el motivo específico'
    };
  }
  
  // NO HAY PAGOS REEMBOLSABLES
  return {
    cumple: false,
    tipo: 'SIN_PAGOS',
    razon: 'No se encontraron pagos elegibles para reembolso'
  };
}

/**
 * Crear reembolso en Stripe (MODO DE PRUEBA)
 */
async function crearReembolso(chargeId, amount, testMode = true) {
  if (testMode) {
    console.log(`\n🧪 MODO PRUEBA - NO se creará reembolso real`);
    console.log(`   Charge: ${chargeId}`);
    console.log(`   Monto: ${(amount / 100).toFixed(2)}€`);
    return { id: 're_test_xxx', status: 'succeeded' };
  }
  
  console.log(`\n💰 Creando reembolso...`);
  
  try {
    const data = `charge=${chargeId}&amount=${amount}&reason=requested_by_customer`;
    const result = await stripeRequest('POST', '/v1/refunds', data);
    
    console.log(`✅ Reembolso creado: ${result.id}`);
    console.log(`   - Estado: ${result.status}`);
    console.log(`   - Monto: ${(result.amount / 100).toFixed(2)}€`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error creando reembolso:`, error.message);
    throw error;
  }
}

/**
 * Cancelar suscripción en Stripe (MODO DE PRUEBA)
 */
async function cancelarSuscripcion(subscriptionId, testMode = true) {
  if (testMode) {
    console.log(`\n🧪 MODO PRUEBA - NO se cancelará suscripción real`);
    console.log(`   Subscription: ${subscriptionId}`);
    return { id: subscriptionId, status: 'canceled' };
  }
  
  console.log(`\n🚫 Cancelando suscripción...`);
  
  try {
    const result = await stripeRequest('DELETE', `/v1/subscriptions/${subscriptionId}`);
    
    console.log(`✅ Suscripción cancelada: ${result.id}`);
    console.log(`   - Estado: ${result.status}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error cancelando suscripción:`, error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🤖 TEST: AGENTE DE REEMBOLSOS MINDMETRIC`);
  console.log(`${'═'.repeat(60)}`);
  
  // Validar argumentos
  const email = process.argv[2];
  
  if (!email) {
    console.error(`\n❌ Error: Debes proporcionar un email`);
    console.log(`\n📖 Uso: node test-stripe-refund.js <email-cliente>`);
    console.log(`📖 Ejemplo: node test-stripe-refund.js test@example.com\n`);
    process.exit(1);
  }
  
  // Validar Stripe Key
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_...') {
    console.error(`\n❌ Error: STRIPE_SECRET_KEY no configurada`);
    console.log(`\n📖 Configura tu clave:`);
    console.log(`   export STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx`);
    console.log(`   node test-stripe-refund.js ${email}\n`);
    process.exit(1);
  }
  
  console.log(`\n📧 Email: ${email}`);
  console.log(`🔑 Stripe Key: ${STRIPE_SECRET_KEY.substring(0, 15)}...`);
  console.log(`🧪 Modo: ${TEST_MODE ? 'PRUEBA (no se harán cambios reales)' : 'PRODUCCIÓN'}`);
  
  try {
    // 1. Buscar cliente
    const customer = await buscarCliente(email);
    if (!customer) {
      console.log(`\n❌ RESULTADO: Cliente no encontrado en Stripe`);
      console.log(`   Acción: Enviar email solicitando verificación de datos`);
      return;
    }
    
    // 2. Obtener cargos
    const charges = await obtenerCargos(customer.id);
    
    // 3. Obtener suscripciones
    const subscriptions = await obtenerSuscripciones(customer.id);
    
    // 4. Evaluar política
    const evaluacion = evaluarPolitica(customer, charges, subscriptions);
    
    // 5. Mostrar resultado
    console.log(`\n\n${'═'.repeat(60)}`);
    console.log(`📊 RESULTADO FINAL`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`\nTipo: ${evaluacion.tipo}`);
    console.log(`Cumple política: ${evaluacion.cumple ? '✅ SÍ' : '❌ NO'}`);
    console.log(`Razón: ${evaluacion.razon}`);
    
    if (evaluacion.nota) {
      console.log(`\n⚠️  Nota: ${evaluacion.nota}`);
    }
    
    // 6. Simular acciones
    if (evaluacion.cumple) {
      console.log(`\n\n${'═'.repeat(60)}`);
      console.log(`💰 ACCIONES A REALIZAR`);
      console.log(`${'═'.repeat(60)}`);
      
      // Crear reembolsos
      for (const chargeId of evaluacion.charge_ids || []) {
        const monto = evaluacion.tipo === 'REEMBOLSO_INICIAL' ? 50 : evaluacion.monto_total;
        await crearReembolso(chargeId, monto, TEST_MODE);
      }
      
      // Cancelar suscripción si existe
      if (evaluacion.subscription_id) {
        await cancelarSuscripcion(evaluacion.subscription_id, TEST_MODE);
      }
      
      console.log(`\n✅ Email a enviar: "Reembolso Procesado Exitosamente"`);
      console.log(`   - Monto: ${(evaluacion.monto_total / 100).toFixed(2)}€`);
      console.log(`   - Tiempo estimado: 3-5 días hábiles`);
      
    } else {
      console.log(`\n\n${'═'.repeat(60)}`);
      console.log(`📧 ACCIONES A REALIZAR`);
      console.log(`${'═'.repeat(60)}`);
      console.log(`\n❌ Email a enviar: "Reembolso No Aprobado"`);
      console.log(`   - Razón: ${evaluacion.razon}`);
      console.log(`   - Ofrecer: Cancelación sin reembolso (si aplica)`);
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`\n✅ Test completado\n`);
    
  } catch (error) {
    console.error(`\n❌ Error en el test:`, error);
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  main();
}

module.exports = {
  buscarCliente,
  obtenerCargos,
  obtenerSuscripciones,
  evaluarPolitica,
  crearReembolso,
  cancelarSuscripcion
};

