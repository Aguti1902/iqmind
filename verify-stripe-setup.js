#!/usr/bin/env node

/**
 * Script de Verificación de Configuración de Stripe
 * 
 * Este script verifica que todas las variables de entorno necesarias
 * estén configuradas correctamente para el sistema de suscripciones.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 VERIFICANDO CONFIGURACIÓN DE STRIPE\n');
console.log('=' .repeat(60));

// Cargar variables de entorno manualmente desde .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
  console.log('✅ Archivo .env.local encontrado\n');
} else {
  console.log('⚠️  Archivo .env.local NO encontrado\n');
  console.log('Crea un archivo .env.local en la raíz del proyecto con tus variables de Stripe.\n');
}

const requiredVars = {
  'STRIPE_SECRET_KEY': {
    description: 'Clave secreta de Stripe (empieza con sk_)',
    pattern: /^sk_(test|live)_/,
    critical: true
  },
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
    description: 'Clave pública de Stripe (empieza con pk_)',
    pattern: /^pk_(test|live)_/,
    critical: true
  },
  'STRIPE_PRICE_ID': {
    description: 'ID del precio de 19.99€/mes (empieza con price_)',
    pattern: /^price_/,
    critical: true
  },
  'STRIPE_WEBHOOK_SECRET': {
    description: 'Secret del webhook (empieza con whsec_)',
    pattern: /^whsec_/,
    critical: false
  }
};

let allConfigured = true;
let criticalMissing = false;

console.log('\n📋 Variables de Entorno:\n');

for (const [varName, config] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  const status = value ? '✅' : (config.critical ? '❌' : '⚠️ ');
  
  console.log(`${status} ${varName}`);
  console.log(`   ${config.description}`);
  
  if (!value) {
    if (config.critical) {
      console.log(`   ❗ FALTA - Es obligatorio configurarla`);
      criticalMissing = true;
    } else {
      console.log(`   ⚠️  FALTA - Recomendado para producción`);
    }
    allConfigured = false;
  } else {
    if (config.pattern && !config.pattern.test(value)) {
      console.log(`   ⚠️  Formato incorrecto: ${value.substring(0, 20)}...`);
      console.log(`   💡 Debe empezar con: ${config.pattern.source}`);
      allConfigured = false;
    } else {
      console.log(`   ✓ Configurado: ${value.substring(0, 20)}...`);
    }
  }
  console.log('');
}

console.log('=' .repeat(60));

if (criticalMissing) {
  console.log('\n❌ CONFIGURACIÓN INCOMPLETA\n');
  console.log('Faltan variables críticas. La aplicación NO funcionará correctamente.');
  console.log('\n📝 Para configurar:');
  console.log('1. Crea un archivo .env.local en la raíz del proyecto');
  console.log('2. Añade las variables que faltan');
  console.log('3. Reinicia el servidor de desarrollo\n');
  console.log('Ejemplo de .env.local:');
  console.log('');
  console.log('STRIPE_SECRET_KEY=sk_test_...');
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
  console.log('STRIPE_PRICE_ID=price_...');
  console.log('STRIPE_WEBHOOK_SECRET=whsec_...');
  console.log('');
  process.exit(1);
} else if (!allConfigured) {
  console.log('\n⚠️  CONFIGURACIÓN PARCIAL\n');
  console.log('Algunas variables opcionales no están configuradas.');
  console.log('La aplicación funcionará en desarrollo, pero revisa los warnings.\n');
  process.exit(0);
} else {
  console.log('\n✅ CONFIGURACIÓN COMPLETA\n');
  console.log('Todas las variables están correctamente configuradas.\n');
  
  // Verificación adicional: intentar conectar con Stripe
  console.log('🔗 Intentando conectar con Stripe...\n');
  
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  
  (async () => {
    try {
      // Verificar que el Price ID existe
      const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);
      
      console.log('✅ Precio verificado en Stripe:');
      console.log(`   ID: ${price.id}`);
      console.log(`   Monto: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
      console.log(`   Recurrente: ${price.recurring ? 'Sí' : 'No'}`);
      if (price.recurring) {
        console.log(`   Intervalo: ${price.recurring.interval}`);
        console.log(`   Intervalo de cantidad: ${price.recurring.interval_count}`);
      }
      console.log(`   Activo: ${price.active ? 'Sí' : 'No'}`);
      
      if (!price.active) {
        console.log('\n⚠️  El precio existe pero está INACTIVO en Stripe.');
        console.log('Actívalo en el Dashboard de Stripe para que funcione.\n');
      }
      
      if (price.unit_amount !== 1999) {
        console.log('\n⚠️  ADVERTENCIA: El precio no es 19.99€');
        console.log(`   Se cobrará: ${price.unit_amount / 100} ${price.currency.toUpperCase()}\n`);
      }
      
      if (!price.recurring || price.recurring.interval !== 'month') {
        console.log('\n⚠️  ADVERTENCIA: El precio no es mensual recurrente');
        console.log('   Asegúrate de que sea una suscripción mensual.\n');
      }
      
      console.log('\n✅ TODO VERIFICADO CORRECTAMENTE');
      console.log('   La suscripción está lista para funcionar.\n');
      
    } catch (error) {
      console.log('❌ Error al verificar el precio en Stripe:');
      console.log(`   ${error.message}\n`);
      
      if (error.code === 'resource_missing') {
        console.log('💡 El STRIPE_PRICE_ID no existe en tu cuenta de Stripe.');
        console.log('   Crea el precio en Stripe Dashboard y actualiza la variable.\n');
      }
      
      process.exit(1);
    }
  })();
}

