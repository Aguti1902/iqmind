# ⚙️ CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## 🔴 PROBLEMAS DETECTADOS:

### 1. ❌ Base de datos - Error de conexión
```
Error: 'invalid_connection_string': This connection string is meant to be used 
with a direct connection. Make sure to use a pooled connection string.
```

### 2. ❌ SendGrid - No autorizado (401)
```
Error: Unauthorized
code: 401
```

### 3. ✅ Traducciones - ARREGLADO
```
Error: ENOENT: no such file or directory, open '/var/task/public/messages/es.json'
→ Ahora usa imports directos (ya arreglado en el código)
```

---

## 🛠️ SOLUCIÓN: Configurar variables de entorno

### PASO 1: Acceder a Vercel

1. Ve a: https://vercel.com
2. Selecciona tu proyecto MindMetric
3. Click en **Settings**
4. Click en **Environment Variables** (en el menú izquierdo)

---

### PASO 2: Configurar POSTGRES_URL (Base de datos)

Railway te proporciona DOS connection strings:

#### A) **DATABASE_URL** (Direct Connection)
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```
- Para conexiones directas
- NO funciona con @vercel/postgres

#### B) **POSTGRES_URL** (Pooled Connection - NECESARIA)
```
postgresql://postgres:PASSWORD@HOST:PORT/railway?pgbouncer=true
```
- Para conexiones con pool
- ✅ Funciona con @vercel/postgres

---

### PASO 3: Obtener el Pooled Connection String de Railway

1. Ve a: https://railway.app
2. Selecciona tu proyecto
3. Click en tu base de datos PostgreSQL
4. En la pestaña **Connect**, busca:
   - **Public Networking** → **Pooled Connection**
   - Copia el connection string que tiene `?pgbouncer=true`

**Ejemplo:**
```
postgresql://postgres:AbCd1234@roundhouse.proxy.rlwy.net:12345/railway?pgbouncer=true
```

---

### PASO 4: Agregar variables en Vercel

En Vercel → Settings → Environment Variables, agrega:

#### 1. **POSTGRES_URL** (CRITICAL)
```
Name: POSTGRES_URL
Value: postgresql://postgres:PASSWORD@HOST:PORT/railway?pgbouncer=true
Environment: Production, Preview, Development
```

#### 2. **DATABASE_URL** (Backup)
```
Name: DATABASE_URL
Value: postgresql://postgres:PASSWORD@HOST:PORT/railway
Environment: Production, Preview, Development
```

**IMPORTANTE:** 
- ✅ Incluye `?pgbouncer=true` en POSTGRES_URL
- ✅ Puedes agregar `&sslmode=require` al final
- ✅ Marca las 3 opciones: Production, Preview, Development

---

### PASO 5: Configurar SENDGRID_API_KEY

#### A) Verificar si ya existe la API Key

1. Ve a Vercel → Settings → Environment Variables
2. Busca `SENDGRID_API_KEY`
3. Si existe, copia el valor (o créala nueva)

#### B) Crear nueva API Key en SendGrid

1. Ve a: https://app.sendgrid.com/settings/api_keys
2. Click en **Create API Key**
3. Nombre: `MindMetric Production`
4. Permisos: **Full Access** (o al menos **Mail Send**)
5. Click **Create & View**
6. **COPIA LA KEY INMEDIATAMENTE** (solo se muestra una vez)

**La key debe verse así:**
```
SG.xxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

#### C) Agregar en Vercel

```
Name: SENDGRID_API_KEY
Value: SG.xxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
Environment: Production, Preview, Development
```

---

### PASO 6: Otras variables necesarias (verificar que existen)

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://www.mindmetric.io
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## ✅ VERIFICACIÓN

Después de configurar las variables:

### 1. NO necesitas hacer redeploy
Las variables se actualizan automáticamente en nuevas requests.

### 2. Prueba el webhook
```bash
# En Stripe Dashboard:
1. Ve a Webhooks
2. Click en tu webhook
3. Click en "Send test webhook"
4. Selecciona: payment_intent.succeeded
5. Enviar
```

### 3. Verifica los logs
```bash
# En Vercel:
1. Ve a tu proyecto
2. Click en "Logs"
3. Busca por "PaymentIntent exitoso"
4. NO debe aparecer "invalid_connection_string"
5. NO debe aparecer "Unauthorized" (SendGrid)
```

---

## 🚀 PROBAR DESPUÉS DE CONFIGURAR

### Test completo del flujo:

1. **Hacer push del código:**
   ```bash
   git push origin main
   ```

2. **Esperar que Vercel haga deploy** (1-2 minutos)

3. **Probar un pago de prueba:**
   - Ve a: https://www.mindmetric.io/sv/test
   - Completa el test
   - Usa tarjeta de prueba: `4242 4242 4242 4242`
   - Email: `test@example.com`

4. **Verificar que:**
   - ✅ El usuario se crea en la base de datos
   - ✅ Se envía el email con credenciales
   - ✅ No hay errores en los logs de Vercel

---

## 📋 CHECKLIST FINAL

Antes de cerrar, verifica:

- [ ] POSTGRES_URL agregada en Vercel (con `?pgbouncer=true`)
- [ ] DATABASE_URL agregada en Vercel
- [ ] SENDGRID_API_KEY agregada en Vercel (comienza con `SG.`)
- [ ] Todas marcadas en: Production, Preview, Development
- [ ] Git push realizado
- [ ] Vercel deploy completado
- [ ] Test de pago realizado
- [ ] Email recibido
- [ ] Sin errores en logs

---

## 🆘 SI SIGUEN LOS ERRORES

### Error: invalid_connection_string
→ Verifica que POSTGRES_URL tenga `?pgbouncer=true`

### Error: Unauthorized (SendGrid)
→ Genera una nueva API Key en SendGrid

### Error: ENOENT (archivos no encontrados)
→ Ya está arreglado en el código, solo haz push

---

**¿Necesitas ayuda?**
Envía los logs de Vercel después de configurar las variables.

