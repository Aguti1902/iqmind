-- =====================================================
-- MIGRATION SCRIPT - Update Railway Database Schema
-- =====================================================

-- 1. Agregar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Agregar columnas faltantes a la tabla users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS password VARCHAR(255),
  ADD COLUMN IF NOT EXISTS username VARCHAR(255),
  ADD COLUMN IF NOT EXISTS iq INTEGER,
  ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS access_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 3. Actualizar columnas existentes (renombrar si es necesario)
-- Si la columna 'name' existe, renombrarla a 'username'
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
    ALTER TABLE users RENAME COLUMN name TO username;
  END IF;
END $$;

-- 4. Actualizar columnas de suscripción
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trial_end') THEN
    ALTER TABLE users RENAME COLUMN trial_end TO trial_end_date;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_end') THEN
    ALTER TABLE users RENAME COLUMN subscription_end TO access_until;
  END IF;
END $$;

-- 5. Actualizar tabla test_results
ALTER TABLE test_results
  ADD COLUMN IF NOT EXISTS time_elapsed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category_scores JSONB,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Renombrar columnas en test_results si es necesario
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='iq_score') THEN
    ALTER TABLE test_results RENAME COLUMN iq_score TO iq;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='test_date') THEN
    ALTER TABLE test_results RENAME COLUMN test_date TO completed_at;
  END IF;
END $$;

-- 6. Crear tabla password_resets si no existe
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Crear índices para password_resets
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- 8. Verificar que todo esté correcto
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
  ordinal_position;

