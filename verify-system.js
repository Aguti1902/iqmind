#!/usr/bin/env node

/**
 * Script de verificación completa del sistema
 * Verifica BD, Vercel, Admin, y Stripe
 */

const { Pool } = require('pg');
const https = require('https');

const DATABASE_URL = 'postgresql://postgres:ceBbFkVimnxRTPQAYtxNgYBGXWUVquxT@switchback.proxy.rlwy.net:58127/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Función para hacer requests HTTPS
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

async function verifySystem() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA');
  console.log('=' .repeat(60));
  console.log('');

  let errors = [];
  let warnings = [];

  try {
    // ============================================
    // 1. VERIFICAR BASE DE DATOS
    // ============================================
    console.log('1️⃣  VERIFICANDO BASE DE DATOS...');
    console.log('');

    try {
      // Conectar
      await pool.query('SELECT NOW()');
      console.log('   ✅ Conexión a PostgreSQL: OK');

      // Verificar tablas
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      const tables = tablesResult.rows.map(r => r.table_name);
      const requiredTables = ['users', 'test_results', 'site_config', 'password_resets'];
      
      console.log('   📋 Tablas encontradas:');
      requiredTables.forEach(tableName => {
        if (tables.includes(tableName)) {
          console.log(`      ✅ ${tableName}`);
        } else {
          console.log(`      ❌ ${tableName} - FALTA`);
          errors.push(`Tabla ${tableName} no existe`);
        }
      });

      // Verificar índices
      const indexResult = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        ORDER BY indexname;
      `);
      console.log(`   ✅ Índices: ${indexResult.rows.length} encontrados`);

      // Verificar usuario admin
      const adminResult = await pool.query(
        "SELECT id, email, user_name, subscription_status FROM users WHERE email = 'admin@mindmetric.io'"
      );
      
      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];
        console.log('   ✅ Usuario admin existe:');
        console.log(`      📧 Email: ${admin.email}`);
        console.log(`      👤 Nombre: ${admin.user_name}`);
        console.log(`      🎫 Estado: ${admin.subscription_status}`);
      } else {
        console.log('   ❌ Usuario admin NO existe');
        errors.push('Usuario admin no encontrado');
      }

      // Verificar configuración de Stripe
      const configResult = await pool.query(`
        SELECT key, value 
        FROM site_config 
        WHERE key LIKE 'stripe%' OR key = 'payment_mode'
        ORDER BY key;
      `);
      
      console.log('   ⚙️  Configuración de Stripe:');
      let stripeConfigured = false;
      configResult.rows.forEach(row => {
        const isEmpty = !row.value || row.value === '';
        if (row.key === 'payment_mode') {
          console.log(`      ✅ ${row.key}: ${row.value}`);
        } else if (isEmpty) {
          console.log(`      ⚠️  ${row.key}: (vacío)`);
        } else {
          console.log(`      ✅ ${row.key}: ${row.value.substring(0, 15)}...`);
          stripeConfigured = true;
        }
      });

      if (!stripeConfigured) {
        warnings.push('Stripe no está configurado (necesitas añadir las claves en el admin panel)');
      }

      // Contar registros
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      const testsCount = await pool.query('SELECT COUNT(*) FROM test_results');
      
      console.log('   📊 Registros:');
      console.log(`      👥 Usuarios: ${usersCount.rows[0].count}`);
      console.log(`      📝 Tests: ${testsCount.rows[0].count}`);

    } catch (dbError) {
      console.log('   ❌ Error en base de datos:', dbError.message);
      errors.push(`BD Error: ${dbError.message}`);
    }

    console.log('');

    // ============================================
    // 2. VERIFICAR SITIO WEB (VERCEL)
    // ============================================
    console.log('2️⃣  VERIFICANDO SITIO WEB (Vercel)...');
    console.log('');

    try {
      // Verificar página principal
      const homeResponse = await httpsGet('https://mindmetric.io/');
      if (homeResponse.statusCode === 200) {
        console.log('   ✅ Página principal: OK (200)');
      } else {
        console.log(`   ⚠️  Página principal: ${homeResponse.statusCode}`);
        warnings.push(`Página principal retorna ${homeResponse.statusCode}`);
      }

      // Verificar API de Stripe config
      const stripeConfigResponse = await httpsGet('https://mindmetric.io/api/stripe-config');
      if (stripeConfigResponse.statusCode === 200) {
        console.log('   ✅ API Stripe Config: OK (200)');
        try {
          const config = JSON.parse(stripeConfigResponse.data);
          console.log(`      🔑 Modo: ${config.mode || 'no especificado'}`);
          console.log(`      🔑 Publishable Key: ${config.publishableKey ? '✅ Presente' : '❌ Falta'}`);
        } catch (e) {
          console.log('      ⚠️  No se pudo parsear respuesta');
        }
      } else {
        console.log(`   ❌ API Stripe Config: ${stripeConfigResponse.statusCode}`);
        errors.push('API Stripe Config no responde correctamente');
      }

      // Verificar admin panel
      const adminResponse = await httpsGet('https://mindmetric.io/admin');
      if (adminResponse.statusCode === 200) {
        console.log('   ✅ Panel Admin: OK (200)');
      } else {
        console.log(`   ⚠️  Panel Admin: ${adminResponse.statusCode}`);
        warnings.push(`Panel Admin retorna ${adminResponse.statusCode}`);
      }

    } catch (webError) {
      console.log('   ❌ Error verificando web:', webError.message);
      errors.push(`Web Error: ${webError.message}`);
    }

    console.log('');

    // ============================================
    // 3. RESUMEN FINAL
    // ============================================
    console.log('=' .repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('=' .repeat(60));
    console.log('');

    if (errors.length === 0 && warnings.length === 0) {
      console.log('🎉 ¡TODO PERFECTO! El sistema está completamente funcional');
      console.log('');
      console.log('✅ Base de datos: Conectada y configurada');
      console.log('✅ Tablas: Creadas correctamente');
      console.log('✅ Usuario admin: Existe y funcional');
      console.log('✅ Sitio web: Online y respondiendo');
      console.log('✅ APIs: Funcionando correctamente');
      console.log('');
      console.log('🚀 PRÓXIMOS PASOS:');
      console.log('');
      console.log('1. Accede al admin panel:');
      console.log('   🌐 https://mindmetric.io/admin');
      console.log('   📧 admin@mindmetric.io');
      console.log('   🔑 Admin123!');
      console.log('');
      console.log('2. Configura Stripe (si no lo has hecho):');
      console.log('   - Ve a https://dashboard.stripe.com/test/apikeys');
      console.log('   - Copia las claves y pégalas en el admin panel');
      console.log('   - Guarda la configuración');
      console.log('');
      console.log('3. ¡Prueba el flujo completo!');
      console.log('   - https://mindmetric.io/es/test');
      console.log('   - Completa el test');
      console.log('   - Paga €0.50 (tarjeta: 4242 4242 4242 4242)');
      console.log('   - Revisa emails');
      console.log('   - Accede al dashboard');
      console.log('');
    } else {
      if (errors.length > 0) {
        console.log('❌ ERRORES ENCONTRADOS:');
        errors.forEach((err, i) => {
          console.log(`   ${i + 1}. ${err}`);
        });
        console.log('');
      }

      if (warnings.length > 0) {
        console.log('⚠️  ADVERTENCIAS:');
        warnings.forEach((warn, i) => {
          console.log(`   ${i + 1}. ${warn}`);
        });
        console.log('');
      }

      console.log('📋 RECOMENDACIONES:');
      console.log('');
      if (warnings.some(w => w.includes('Stripe no está configurado'))) {
        console.log('1. Configura Stripe en el admin panel:');
        console.log('   🌐 https://mindmetric.io/admin');
        console.log('   📧 admin@mindmetric.io');
        console.log('   🔑 Admin123!');
        console.log('');
      }
      if (errors.some(e => e.includes('admin no encontrado'))) {
        console.log('2. Crea el usuario admin:');
        console.log('   https://mindmetric.io/api/create-admin-user');
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar verificación
verifySystem();

