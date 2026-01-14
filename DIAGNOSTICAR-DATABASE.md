# 🔧 Diagnosticar y Solucionar Error de Base de Datos

## ❌ Error Actual
```json
{"success":false,"error":"read ECONNRESET"}
```

Este error indica que **no se puede conectar a la base de datos PostgreSQL**.

---

## 🎯 Solución Rápida (5 minutos)

### **1️⃣ Verificar Variables de Entorno en Vercel**

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **"IQLEVEL"** o **"MindMetric"**
3. Click en **"Settings"** (arriba)
4. Click en **"Environment Variables"** (menú izquierdo)
5. Busca estas variables:
   - ✅ `DATABASE_URL` o `POSTGRES_URL`

**Si NO existe:**
- Necesitas agregar la URL de tu base de datos
- Si usas Railway, copia la URL desde allí
- Si usas Vercel Postgres, crea una base de datos

---

### **2️⃣ Opción A: Usar Railway (Recomendado)**

#### Obtener URL de Railway:

1. Ve a: https://railway.app/
2. Click en tu proyecto de base de datos
3. Click en **"Variables"**
4. Copia el valor de **`DATABASE_URL`**

Ejemplo:
```
postgresql://postgres:tuPassword@containers-us-west-123.railway.app:7890/railway
```

#### Agregar en Vercel:

1. Ve a Vercel → tu proyecto → Settings → Environment Variables
2. Click **"Add New"**
3. Configura:
   - **Name:** `DATABASE_URL`
   - **Value:** (pega la URL de Railway)
   - **Environments:** Selecciona Production, Preview, Development (todas)
4. Click **"Save"**

---

### **2️⃣ Opción B: Crear Base de Datos en Vercel Postgres**

Si no tienes Railway:

1. Ve a tu proyecto en Vercel
2. Click en **"Storage"** (menú superior)
3. Click en **"Create Database"**
4. Selecciona **"Postgres"**
5. Sigue los pasos para crear la base de datos
6. Vercel configurará automáticamente `POSTGRES_URL`

---

### **3️⃣ Hacer Redeploy**

Después de configurar la variable:

#### Opción A: Desde Vercel Dashboard
1. Ve a **"Deployments"**
2. Click en el último deployment
3. Click en los **3 puntos** (⋯)
4. Click **"Redeploy"**

#### Opción B: Desde Git (más rápido)
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

### **4️⃣ Ejecutar Migración de Base de Datos**

Una vez desplegado, crea las tablas necesarias:

1. Visita: https://mindmetric.io/api/admin/migrate-db
2. Deberías ver:
   ```json
   {
     "success": true,
     "message": "✅ Migración completada"
   }
   ```

---

### **5️⃣ Crear Usuario Administrador**

Ahora sí podrás crear el usuario admin:

1. Visita: https://mindmetric.io/api/create-admin-user
2. Copia las credenciales que aparecen
3. Inicia sesión en: https://mindmetric.io/es/login

---

## 🔍 Verificar que la Variable Esté Configurada

### Desde Vercel CLI:

```bash
vercel env ls
```

Deberías ver `DATABASE_URL` o `POSTGRES_URL` en la lista.

---

## 🆘 Troubleshooting

### Error persiste después de configurar DATABASE_URL

**Solución 1: Verificar formato de la URL**

La URL debe tener este formato:
```
postgresql://usuario:contraseña@host:puerto/database
```

Ejemplo válido:
```
postgresql://postgres:abc123@containers-us-west-123.railway.app:7890/railway
```

**Solución 2: Aumentar timeout de conexión**

El código actual tiene timeout de 2 segundos. Si tu base de datos es lenta:

Edita `lib/database-postgres.ts`:
```typescript
pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Cambiar de 2000 a 10000
})
```

**Solución 3: Verificar que Railway esté activo**

1. Ve a Railway Dashboard
2. Verifica que el servicio de Postgres esté **"Running"** (verde)
3. Si está pausado, reactivalo

---

### Error: "No se encontró POSTGRES_URL"

Esto significa que la variable NO está configurada. Sigue el Paso 1.

---

### Error: "Connection timeout"

La base de datos no responde. Verifica:
1. Railway está activo
2. La URL es correcta
3. No hay problemas de firewall

---

## ✅ Checklist de Verificación

Antes de continuar, verifica:

- [ ] `DATABASE_URL` o `POSTGRES_URL` configurada en Vercel
- [ ] La URL es correcta y válida
- [ ] Hiciste redeploy después de agregar la variable
- [ ] La base de datos está activa y respondiendo
- [ ] Ejecutaste la migración (`/api/admin/migrate-db`)
- [ ] Puedes crear el usuario admin (`/api/create-admin-user`)

---

## 📞 Resumen de URLs Importantes

| Acción | URL |
|--------|-----|
| Dashboard Vercel | https://vercel.com/dashboard |
| Dashboard Railway | https://railway.app/ |
| Migrar DB | https://mindmetric.io/api/admin/migrate-db |
| Crear Admin | https://mindmetric.io/api/create-admin-user |
| Login | https://mindmetric.io/es/login |
| Panel Admin | https://mindmetric.io/es/admin |

---

## 🎯 Próximos Pasos

Una vez resuelto:

1. ✅ Crea el usuario administrador
2. ✅ Inicia sesión en el dashboard
3. ✅ Verifica que puedas ver usuarios y estadísticas
4. ✅ Realiza un test de prueba para verificar que se guarda en la DB

---

**¿Necesitas ayuda adicional?** Avísame en qué paso estás y te ayudo. 🚀

