# 🔧 CONFIGURAR DATABASE_URL EN VERCEL

## ❌ ERROR ACTUAL
```
You did not supply a 'connectionString' and no 'POSTGRES_URL' env var was found.
```

**Solución:** Necesitas agregar la variable `DATABASE_URL` en Vercel que apunte a tu base de datos de Railway.

---

## 📋 PASOS PARA ARREGLARLO

### **1️⃣ OBTENER LA URL DE RAILWAY**

1. Ve a https://railway.app/
2. Click en tu proyecto **`Postgres-Zleq`**
3. Click en la pestaña **"Variables"**
4. Busca la variable **`DATABASE_URL`**
5. Click en el ícono de **"copiar"** 📋

La URL se ve así:
```
postgresql://postgres:password123@containers-us-west-xxx.railway.app:7890/railway
```

---

### **2️⃣ AGREGAR LA VARIABLE EN VERCEL**

#### **Opción A: Desde el Dashboard de Vercel (Recomendado)**

1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto **"IQmind"** (o como lo hayas llamado)
3. Click en **"Settings"** (arriba)
4. Click en **"Environment Variables"** (menú izquierdo)
5. Click en **"Add New"**
6. Configura:
   - **Name:** `DATABASE_URL`
   - **Value:** (pega la URL que copiaste de Railway)
   - **Environment:** Selecciona **todas** (Production, Preview, Development)
7. Click en **"Save"**

#### **Opción B: Desde Vercel CLI**

```bash
vercel env add DATABASE_URL
# Pega la URL de Railway cuando te lo pida
# Selecciona: Production, Preview, Development (todas)
```

---

### **3️⃣ HACER REDEPLOY**

Después de agregar la variable, necesitas hacer un redeploy:

1. Ve a https://vercel.com/dashboard
2. Click en tu proyecto
3. Click en la pestaña **"Deployments"**
4. Click en el último deployment
5. Click en los **3 puntos** (⋯) arriba a la derecha
6. Click en **"Redeploy"**
7. Confirma con **"Redeploy"**

**O simplemente haz un nuevo push a GitHub** (Vercel hará deploy automáticamente).

---

### **4️⃣ EJECUTAR LA MIGRACIÓN**

Una vez que el deploy termine:

1. Abre en tu navegador:
   ```
   https://www.iqmind.io/api/migrate-db
   ```

2. Deberías ver:
   ```json
   {
     "success": true,
     "message": "✅ Migración de base de datos completada exitosamente"
   }
   ```

✅ **¡Listo!**

---

### **5️⃣ BORRAR EL ENDPOINT DE MIGRACIÓN**

Por seguridad, borra el archivo:
```
app/api/migrate-db/route.ts
```

Luego:
```bash
git add -A
git commit -m "Eliminar endpoint de migración temporal"
git push origin main
```

---

## 🎯 VERIFICACIÓN FINAL

1. Ve a https://www.iqmind.io/es/test
2. Completa un test
3. Haz el pago de 0.50€
4. Revisa tu email → obtén credenciales
5. Haz login en https://www.iqmind.io/es/cuenta
6. ✅ Deberías ver tu resultado del test
7. ✅ Recarga la página → los datos deben persistir

---

## ⚠️ NOTAS IMPORTANTES

### Si DATABASE_URL ya existe en Vercel:
- Verifica que apunte a Railway (no a Vercel Postgres)
- La URL debe empezar con: `postgresql://postgres:...@containers-us-west...railway.app`
- **NO** debe tener `@ep-...postgres.vercel-storage.com`

### Variables de entorno necesarias:
- ✅ `DATABASE_URL` (Railway)
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `SENDGRID_API_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## 🆘 SI ALGO FALLA

### Error: "Connection refused"
- Verifica que Railway esté en línea
- Ve a Railway → tu proyecto → verifica el status

### Error: "Invalid credentials"
- La URL de Railway puede haber cambiado
- Copia una URL nueva desde Railway → Variables → DATABASE_URL

### Error: "Table does not exist"
- Ejecuta el endpoint `/api/migrate-db` para crear las tablas

---

🎉 **Una vez completados estos pasos, ¡todo debería funcionar perfectamente!**

