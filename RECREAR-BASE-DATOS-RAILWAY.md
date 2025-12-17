# 🗄️ Recrear Base de Datos en Railway - MindMetric

## ✅ Paso 1: Actualización de Seguridad (Completado)

```bash
✅ Next.js actualizado: 14.2.33 → 14.2.35
✅ Vulnerabilidades CVE-2025-55184 y CVE-2025-67779 corregidas
✅ Commit realizado y pusheado
```

---

## 🚀 Paso 2: Crear Nueva Base de Datos PostgreSQL en Railway

### 2.1. Acceder a Railway

1. Ve a https://railway.app/
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **MindMetric** (o el nombre de tu proyecto)

### 2.2. Añadir PostgreSQL

1. En el dashboard del proyecto, haz clic en **"+ New"**
2. Selecciona **"Database"**
3. Elige **"PostgreSQL"**
4. Railway creará una nueva base de datos automáticamente

### 2.3. Obtener las Credenciales

1. Haz clic en la base de datos PostgreSQL recién creada
2. Ve a la pestaña **"Variables"** o **"Connect"**
3. Copia las siguientes variables:

```env
DATABASE_URL=postgresql://postgres:XXXXXXXXXX@XXXXXX.railway.app:5432/railway
POSTGRES_URL=postgresql://postgres:XXXXXXXXXX@XXXXXX.railway.app:5432/railway
```

**⚠️ IMPORTANTE:** Usa la URL **PÚBLICA** (que termina en `.railway.app`), NO la URL interna (que termina en `.railway.internal`).

---

## 🔧 Paso 3: Configurar Variables de Entorno en Vercel

### 3.1. Acceder a Vercel

1. Ve a https://vercel.com/
2. Inicia sesión
3. Ve a tu proyecto **MindMetric**
4. Ve a **Settings** → **Environment Variables**

### 3.2. Actualizar Variables de Entorno

Busca y **ACTUALIZA** estas variables con las nuevas credenciales de Railway:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:XXXXXXXXXX@XXXXXX.railway.app:5432/railway` |
| `POSTGRES_URL` | `postgresql://postgres:XXXXXXXXXX@XXXXXX.railway.app:5432/railway` |

**⚠️ Asegúrate de que estén configuradas para todos los entornos:**
- ✅ Production
- ✅ Preview
- ✅ Development

### 3.3. Redeploy en Vercel

1. Ve a **Deployments** en Vercel
2. Haz clic en **"Redeploy"** en el último deployment
3. Espera a que termine el deployment (~1-2 minutos)

---

## 📊 Paso 4: Crear las Tablas de la Base de Datos

Ahora necesitas ejecutar el script SQL para crear todas las tablas.

### 4.1. Conectar a la Base de Datos

**Opción A: Usar Railway CLI (Más Fácil)**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link al proyecto
railway link

# 4. Conectar a la base de datos
railway connect postgres
```

Una vez conectado, ejecuta el SQL de `lib/db-schema.sql`.

**Opción B: Usar un Cliente SQL (DBeaver, TablePlus, etc.)**

1. Descarga e instala un cliente SQL:
   - **DBeaver** (Gratis): https://dbeaver.io/
   - **TablePlus** (Gratis/Pago): https://tableplus.com/
   - **pgAdmin** (Gratis): https://www.pgadmin.org/

2. Crear nueva conexión con las credenciales de Railway:
   - **Host:** `XXXXXX.railway.app`
   - **Port:** `5432`
   - **Database:** `railway`
   - **Username:** `postgres`
   - **Password:** `XXXXXXXXXX`
   - **SSL Mode:** `require`

3. Abrir el archivo `lib/db-schema.sql`
4. Ejecutar todo el script

**Opción C: Usar Railway Dashboard (Más Rápido)**

1. Ve a Railway Dashboard
2. Selecciona tu base de datos PostgreSQL
3. Ve a la pestaña **"Query"** o **"Data"**
4. Copia y pega el contenido de `lib/db-schema.sql`
5. Haz clic en **"Run"** o **"Execute"**

---

## 🗄️ Paso 5: Verificar que las Tablas se Crearon

Ejecuta este comando SQL para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deberías ver estas tablas:

```
✅ users
✅ test_results
✅ site_config
✅ admin_emails (opcional)
```

---

## 👤 Paso 6: Crear Usuario Admin

### 6.1. Crear el Admin desde la API

Ve a tu navegador y accede a:

```
https://mindmetric.io/api/create-admin-user
```

Esto creará automáticamente:
- **Email:** `admin@mindmetric.io`
- **Contraseña:** `Admin123!`

**⚠️ IMPORTANTE:** Cambia esta contraseña inmediatamente después de iniciar sesión.

### 6.2. Acceder al Panel de Admin

1. Ve a https://mindmetric.io/admin
2. Inicia sesión con:
   - Email: `admin@mindmetric.io`
   - Contraseña: `Admin123!`

---

## 🔑 Paso 7: Configurar Stripe en el Panel de Admin

Una vez dentro del panel de admin, configura:

### 7.1. Modo de Stripe

- **Test Mode** (para pruebas)
- **Live Mode** (para producción)

### 7.2. Claves de Stripe

#### Para Test Mode:

1. Ve a https://dashboard.stripe.com/test/apikeys
2. Copia y pega en el admin:
   - **Publishable Key:** `pk_test_...`
   - **Secret Key:** `sk_test_...`

3. Ve a https://dashboard.stripe.com/test/webhooks
4. Copia el **Signing Secret:** `whsec_...`

5. Ve a https://dashboard.stripe.com/test/products
6. Copia los **Price IDs:**
   - **Bi-weekly:** `price_...` (€9.99 cada 2 semanas)
   - **Monthly:** `price_...` (€19.99 al mes)

#### Para Live Mode:

1. Ve a https://dashboard.stripe.com/apikeys
2. Copia y pega en el admin:
   - **Publishable Key:** `pk_live_...`
   - **Secret Key:** `sk_live_...`

3. Ve a https://dashboard.stripe.com/webhooks
4. Copia el **Signing Secret:** `whsec_...`

5. Ve a https://dashboard.stripe.com/products
6. Copia los **Price IDs:**
   - **Bi-weekly:** `price_...` (€9.99 cada 2 semanas)
   - **Monthly:** `price_...` (€19.99 al mes)

### 7.3. Guardar Configuración

1. Rellena todos los campos en el panel de admin
2. Haz clic en **"Guardar Configuración"**
3. Espera la confirmación

---

## 🧪 Paso 8: Probar Todo el Flujo

### 8.1. Probar en Test Mode

```bash
1. Ir a https://mindmetric.io/es/test
2. Completar el test (20 preguntas)
3. Ir al checkout
4. Usar tarjeta de test: 4242 4242 4242 4242
5. Email: test-nuevo@gmail.com
6. Pagar €0.50
7. Esperar 1-2 minutos
8. Revisar email:
   ✅ Email 1: Pago confirmado + CI
   ✅ Email 2: Credenciales de acceso
9. Acceder al dashboard
10. Verificar que el test se guardó:
    ✅ Tests realizados: 1
    ✅ CI Más Alto: [tu resultado]
    ✅ Historial visible
```

### 8.2. Verificar en Railway

1. Ve a Railway Dashboard
2. Selecciona tu base de datos
3. Ve a **"Query"** o **"Data"**
4. Ejecuta:

```sql
-- Ver usuarios creados
SELECT id, email, user_name, iq, subscription_status, created_at 
FROM users 
ORDER BY created_at DESC;

-- Ver test results
SELECT id, user_id, iq, correct_answers, time_elapsed, completed_at 
FROM test_results 
ORDER BY completed_at DESC;

-- Ver configuración de Stripe
SELECT * FROM site_config;
```

Deberías ver:
- ✅ Usuario creado
- ✅ Test result guardado
- ✅ Configuración de Stripe

---

## 📋 Checklist Final

- [ ] ✅ Next.js actualizado a 14.2.35
- [ ] 🗄️ Base de datos PostgreSQL creada en Railway
- [ ] 🔗 Variables de entorno actualizadas en Vercel
- [ ] 🚀 Redeploy en Vercel completado
- [ ] 📊 Tablas de BD creadas (users, test_results, site_config)
- [ ] 👤 Usuario admin creado
- [ ] 🔑 Stripe configurado en panel de admin
- [ ] 🧪 Flujo completo probado
- [ ] ✅ Test se guarda en el dashboard

---

## 🆘 Si Algo Sale Mal

### Error: "getaddrinfo ENOTFOUND postgres-zleq.railway.internal"

**Causa:** Estás usando la URL interna de Railway en Vercel.

**Solución:** 
1. Ve a Railway
2. Copia la URL **PÚBLICA** (termina en `.railway.app`)
3. Actualiza `POSTGRES_URL` en Vercel con la URL pública

### Error: "No se recibió publishableKey"

**Causa:** Stripe no está configurado correctamente.

**Solución:**
1. Ve al panel de admin: https://mindmetric.io/admin
2. Ingresa las claves de Stripe
3. Guarda la configuración

### Error: "Tests realizados: 0" después del pago

**Causa:** Los datos del test no se guardaron.

**Solución:**
1. Ve a Railway → Query
2. Ejecuta:
   ```sql
   SELECT * FROM test_results ORDER BY created_at DESC LIMIT 5;
   ```
3. Si no hay registros, prueba con un email diferente (el usuario anterior ya existe)

### Error en el checkout: "500 Internal Server Error"

**Causa:** Conexión a la BD fallando.

**Solución:**
1. Verifica que `POSTGRES_URL` en Vercel sea la URL pública de Railway
2. Redeploy en Vercel
3. Espera 1-2 minutos

---

## 📞 Contacto

Si tienes algún problema, revisa los logs:

- **Vercel Logs:** https://vercel.com/[tu-usuario]/mindmetric/logs
- **Railway Logs:** Railway Dashboard → Tu servicio → Logs

---

## 📚 Documentos Relacionados

- `CONFIGURACION-STRIPE.md` - Guía completa de Stripe
- `CONFIGURACION-SENDGRID.md` - Guía completa de SendGrid
- `CREAR-ADMIN.md` - Cómo crear usuario admin
- `COMO-CREAR-PRICE-IDS-STRIPE.md` - Cómo crear Price IDs
- `lib/db-schema.sql` - Script SQL de la base de datos

---

**¡Listo! 🚀 Tu base de datos está recreada y lista para funcionar.**

