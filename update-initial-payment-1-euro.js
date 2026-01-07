// update-initial-payment-1-euro.js
// Script para actualizar initial_payment de 0.50 a 1.00 en Railway PostgreSQL

const { Pool } = require('pg');

// Usar la URL de conexión de Railway
const DATABASE_URL = 'postgresql://postgres:ceBbFkVimnxRTPQAYtxNgYBGXWUVquxT@switchback.proxy.rlwy.net:58127/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateInitialPayment() {
  const client = await pool.connect();
  
  try {
    console.log('📡 Conectando a Railway PostgreSQL...');
    
    // Leer configuración actual
    const currentConfig = await client.query(
      `SELECT key, value FROM site_config WHERE key IN ('trial_days', 'initial_payment')`
    );
    
    console.log('\n📊 CONFIGURACIÓN ACTUAL:');
    currentConfig.rows.forEach(row => {
      console.log(`  ${row.key}: ${row.value}`);
    });
    
    // Actualizar initial_payment a 1.00
    await client.query(
      `UPDATE site_config SET value = '1.00' WHERE key = 'initial_payment'`
    );
    
    console.log('\n✅ ACTUALIZADO: initial_payment = 1.00€');
    console.log('   Razón: Whop requiere mínimo €1 para pagos iniciales');
    
    // Verificar cambios
    const newConfig = await client.query(
      `SELECT key, value FROM site_config WHERE key IN ('trial_days', 'initial_payment')`
    );
    
    console.log('\n📊 NUEVA CONFIGURACIÓN:');
    newConfig.rows.forEach(row => {
      console.log(`  ${row.key}: ${row.value}`);
    });
    
    console.log('\n✅ Actualización completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateInitialPayment();

