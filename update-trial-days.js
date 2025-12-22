/**
 * Script para actualizar los días de trial de 30 a 15 en la base de datos
 * Ejecutar: node update-trial-days.js
 */

const { Pool } = require('pg')

async function updateTrialDays() {
  console.log('🚀 Actualizando días de trial en la base de datos...\n')

  // Obtener URL de la base de datos
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!databaseUrl) {
    console.error('❌ Error: No se encontró DATABASE_URL o POSTGRES_URL en las variables de entorno')
    console.error('💡 Configura la variable de entorno antes de ejecutar este script:')
    console.error('   export DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('railway') || databaseUrl.includes('amazonaws') 
      ? { rejectUnauthorized: false } 
      : false
  })

  try {
    // 1. Verificar el valor actual
    console.log('📊 Verificando valor actual...')
    const currentValue = await pool.query(
      "SELECT value FROM site_config WHERE key = 'trial_days'"
    )

    if (currentValue.rows.length === 0) {
      console.log('⚠️  No existe la clave trial_days, creándola...')
      await pool.query(
        "INSERT INTO site_config (key, value, description) VALUES ('trial_days', '15', 'Días de prueba gratuita')"
      )
      console.log('✅ Clave trial_days creada con valor 15')
    } else {
      const oldValue = currentValue.rows[0].value
      console.log(`   Valor actual: ${oldValue} días`)

      if (oldValue === '15') {
        console.log('✅ Ya está configurado en 15 días. No es necesario actualizar.')
      } else {
        // 2. Actualizar a 15 días
        console.log('\n🔄 Actualizando a 15 días...')
        await pool.query(
          "UPDATE site_config SET value = '15' WHERE key = 'trial_days'"
        )

        // 3. Verificar que se actualizó correctamente
        const newValue = await pool.query(
          "SELECT value FROM site_config WHERE key = 'trial_days'"
        )
        
        console.log(`✅ Actualizado correctamente: ${oldValue} días → ${newValue.rows[0].value} días`)
      }
    }

    // 4. Mostrar resumen de configuración
    console.log('\n📋 Configuración actual de Stripe:')
    const config = await pool.query(
      "SELECT key, value, description FROM site_config WHERE key IN ('trial_days', 'subscription_price', 'initial_payment', 'stripe_mode') ORDER BY key"
    )
    
    console.log('\n┌─────────────────────────┬──────────┬────────────────────────────────┐')
    console.log('│ Clave                   │ Valor    │ Descripción                    │')
    console.log('├─────────────────────────┼──────────┼────────────────────────────────┤')
    config.rows.forEach(row => {
      const key = row.key.padEnd(23)
      const value = (row.value || '(vacío)').padEnd(8)
      const desc = (row.description || '').substring(0, 30).padEnd(30)
      console.log(`│ ${key} │ ${value} │ ${desc} │`)
    })
    console.log('└─────────────────────────┴──────────┴────────────────────────────────┘')

    console.log('\n✅ Script completado exitosamente\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Ejecutar
updateTrialDays()

