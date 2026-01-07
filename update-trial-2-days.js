// update-trial-2-days.js
// Script para actualizar trial_days de 15 a 2 días en Railway PostgreSQL

const { Pool } = require('pg');

// Usar la URL de conexión de Railway
const DATABASE_URL = 'postgresql://postgres:ceBbFkVimnxRTPQAYtxNgYBGXWUVquxT@switchback.proxy.rlwy.net:58127/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateTrialDays() {
  const client = await pool.connect();
  
  try {
    console.log('📡 Conectando a Railway PostgreSQL...');
    
    // Leer configuración actual
    const currentConfig = await client.query(
      `SELECT key, value FROM site_config WHERE key IN ('trial_days', 'initial_payment', 'stripe_mode')`
    );
    
    console.log('\n📊 CONFIGURACIÓN ACTUAL:');
    currentConfig.rows.forEach(row => {
      console.log(`  ${row.key}: ${row.value}`);
    });
    
    // Actualizar trial_days a 2
    await client.query(
      `UPDATE site_config SET value = '2' WHERE key = 'trial_days'`
    );
    
    console.log('\n✅ ACTUALIZADO: trial_days = 2');
    
    // Verificar cambios
    const newConfig = await client.query(
      `SELECT key, value FROM site_config WHERE key = 'trial_days'`
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

updateTrialDays();

