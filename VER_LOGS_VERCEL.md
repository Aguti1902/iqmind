# 🔍 CÓMO VER LOS LOGS DEL ERROR 500

## 📋 OPCIÓN 1: Ver logs en tiempo real en Vercel

1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto
3. Click en la pestaña **"Logs"** (arriba)
4. Deberías ver los errores en tiempo real

## 📋 OPCIÓN 2: Ver logs del deployment

1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto
3. Click en **"Deployments"**
4. Click en el último deployment (el más reciente)
5. Scroll hacia abajo hasta la sección de logs
6. Busca líneas que empiecen con ❌ o "Error"

## 📋 OPCIÓN 3: Ver el error en el navegador

1. Abre https://www.mindmetric.io/api/migrate-db
2. Si ves un JSON con error, cópialo completo
3. Pégamelo para que pueda ver qué está fallando

---

## 🎯 ¿QUÉ BUSCAR EN LOS LOGS?

Busca mensajes como:
- `❌ Error en migración:`
- `VercelPostgresError`
- `connection refused`
- `authentication failed`
- `table does not exist`

---

## 💡 MIENTRAS TANTO...

Posibles causas del error 500:

### 1. La URL de Railway es incorrecta
- Verifica que `POSTGRES_URL` en Vercel tenga la URL correcta de Railway
- Debe verse así: `postgresql://postgres:XXX@containers-us-west-XXX.railway.app:XXXX/railway`

### 2. Railway está caído
- Ve a https://railway.app/
- Verifica que tu base de datos esté "online" (verde)

### 3. Credenciales incorrectas
- La contraseña en la URL puede haber cambiado
- Ve a Railway → Variables → copia una URL nueva

---

## 🔧 SOLUCIÓN RÁPIDA

Si no puedes ver los logs, prueba esto:

1. Ve a Railway → tu base de datos → **Variables**
2. Copia **DATABASE_URL** completa
3. Ve a Vercel → Settings → Environment Variables
4. **Edita** `POSTGRES_URL` y pega la nueva URL
5. Redeploy

---

**Cópiame el error completo que ves en la página o en los logs y lo arreglo inmediatamente.** 🚀

