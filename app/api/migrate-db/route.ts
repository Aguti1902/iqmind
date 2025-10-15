import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) {
    return NextResponse.json({
      success: false,
      error: 'No se encontró POSTGRES_URL o DATABASE_URL en las variables de entorno',
      hint: 'Configura POSTGRES_URL en Vercel con la URL de Railway'
    }, { status: 500 })
  }
  
  const client = createClient({ connectionString })
  await client.connect()
  
  try {
    console.log('🚀 Iniciando migración de base de datos...')

    // 1. Agregar extensión UUID
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    console.log('✅ Extensión UUID creada')

    // 2. Agregar columnas faltantes a la tabla users
    await client.sql`
      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password VARCHAR(255),
        ADD COLUMN IF NOT EXISTS username VARCHAR(255),
        ADD COLUMN IF NOT EXISTS iq INTEGER,
        ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS access_until TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE
    `
    console.log('✅ Columnas agregadas a users')

    // 3. Renombrar columna 'name' a 'username' si existe
    try {
      await client.sql`
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') 
             AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
            ALTER TABLE users RENAME COLUMN name TO username;
          END IF;
        END $$;
      `
      console.log('✅ Columna name → username')
    } catch (e) {
      console.log('⚠️  Columna name ya renombrada o no existe')
    }

    // 4. Renombrar columnas de suscripción
    try {
      await client.sql`
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trial_end') THEN
            ALTER TABLE users RENAME COLUMN trial_end TO trial_end_date;
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_end') THEN
            ALTER TABLE users RENAME COLUMN subscription_end TO access_until;
          END IF;
        END $$;
      `
      console.log('✅ Columnas de suscripción renombradas')
    } catch (e) {
      console.log('⚠️  Columnas de suscripción ya renombradas')
    }

    // 5. Actualizar tabla test_results
    await client.sql`
      ALTER TABLE test_results
        ADD COLUMN IF NOT EXISTS time_elapsed INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS category_scores JSONB,
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `
    console.log('✅ Columnas agregadas a test_results')

    // 6. Renombrar columnas en test_results
    try {
      await client.sql`
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='iq_score') THEN
            ALTER TABLE test_results RENAME COLUMN iq_score TO iq;
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='test_date') THEN
            ALTER TABLE test_results RENAME COLUMN test_date TO completed_at;
          END IF;
        END $$;
      `
      console.log('✅ Columnas de test_results renombradas')
    } catch (e) {
      console.log('⚠️  Columnas de test_results ya renombradas')
    }

    // 7. Crear tabla password_resets
    await client.sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Tabla password_resets creada')

    // 8. Crear índices
    await client.sql`CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)`
    await client.sql`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)`
    console.log('✅ Índices creados')

    // 9. Verificar estructura final
    const verification = await client.sql`
      SELECT 
        table_name, 
        column_name, 
        data_type 
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' 
        AND table_name IN ('users', 'test_results', 'password_resets')
      ORDER BY 
        table_name, 
        ordinal_position
    `

    console.log('✅ Migración completada exitosamente')
    
    await client.end()

    return NextResponse.json({
      success: true,
      message: '✅ Migración de base de datos completada exitosamente',
      tables: {
        users: verification.rows.filter(r => r.table_name === 'users').length,
        test_results: verification.rows.filter(r => r.table_name === 'test_results').length,
        password_resets: verification.rows.filter(r => r.table_name === 'password_resets').length,
      },
      details: verification.rows,
      instructions: '⚠️  IMPORTANTE: Una vez verificado que todo funciona, ELIMINA este archivo (app/api/migrate-db/route.ts) por seguridad'
    })

  } catch (error: any) {
    console.error('❌ Error en migración:', error)
    await client.end()
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      hint: 'Verifica que DATABASE_URL esté configurada en Vercel y apunte a Railway'
    }, { status: 500 })
  }
}

