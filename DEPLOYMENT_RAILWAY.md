# 🚀 Deployment con Railway PostgreSQL

## ✅ Cambios Realizados

1. **Migración a PostgreSQL (Railway)**
   - Todos los archivos ahora usan `database-postgres.ts`
   - Test results se guardan en tabla `test_results` normalizada
   - Base de datos persistente (¡no más pérdida de datos!)

2. **Commits Listos**
   - ✅ Commit 1: Implementar base de datos PostgreSQL persistente
   - ✅ Commit 2: Migrar a base de datos PostgreSQL (Railway)
   - ✅ Commit 3: Arreglar duplicación de interfaz PasswordReset

## 📋 Pasos para Completar el Deploy

### **Paso 1: Ejecutar Migración en Railway**

1. Ve a [Railway](https://railway.app/)
2. Click en tu proyecto `Postgres-Zleq`
3. Click en la pestaña **"Data"** o **"Query"**
4. Copia y pega el siguiente script SQL:

```sql
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
```

5. Click **"Execute"** o **"Run"**
6. Verifica que la última query muestre todas las columnas correctamente

### **Paso 2: Push a GitHub**

**Opción A: Usando GitHub Desktop**
1. Abre GitHub Desktop
2. Verás los commits pendientes
3. Click en **"Push origin"**

**Opción B: Desde Terminal (requiere autenticación)**
```bash
git push origin main
```

Si te pide credenciales:
- Username: `Aguti1902`
- Password: [Tu GitHub Personal Access Token]

### **Paso 3: Verificar Deploy en Vercel**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en tu proyecto **"MindMetric"**
3. Verás el deploy automático iniciándose
4. Espera a que termine (2-3 minutos)
5. Verifica que el deploy sea exitoso ✅

### **Paso 4: Verificar que Todo Funciona**

1. **Hacer un pago de prueba:**
   - Ve a https://www.mindmetric.io/es/test
   - Completa el test
   - Haz el pago de 0.50€

2. **Verificar login:**
   - Revisa tu email (el que usaste para el pago)
   - Deberías recibir credenciales de acceso
   - Haz login en https://www.mindmetric.io/es/cuenta

3. **Verificar dashboard:**
   - Deberías ver tu resultado del test
   - Las estadísticas deben mostrarse correctamente
   - Si recargas la página, ¡los datos deben seguir ahí! 🎉

## 🎯 ¿Qué se Arregló?

### ✅ **Antes (Problema)**
- Base de datos en memoria → datos se borraban en cada deploy
- No se podía hacer login después de un deploy
- Los tests no se guardaban en el dashboard

### ✅ **Ahora (Solución)**
- Base de datos PostgreSQL persistente en Railway
- Los datos se mantienen entre deploys
- Login funciona correctamente
- Tests se guardan y persisten en el dashboard
- Cancelaciones funcionan correctamente

## 🔍 Troubleshooting

### Si el deploy falla en Vercel:
1. Ve a los logs del deploy
2. Busca errores relacionados con `@vercel/postgres`
3. Verifica que `DATABASE_URL` esté configurada en Vercel

### Si el login no funciona:
1. Ve a Railway → Variables
2. Copia `DATABASE_URL`
3. Ve a Vercel → Settings → Environment Variables
4. Verifica que `DATABASE_URL` tenga el mismo valor

### Si los tests no se guardan:
1. Verifica los logs en Vercel → Logs
2. Busca mensajes de "✅ Resultado del test guardado"
3. Si no aparecen, revisa el webhook de Stripe

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs en Vercel
2. Revisa los logs en Railway
3. Verifica que la migración SQL se ejecutó correctamente

---

🎉 **¡Una vez completados estos pasos, tu aplicación estará funcionando con una base de datos persistente!**

