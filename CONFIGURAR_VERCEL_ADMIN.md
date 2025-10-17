# Configurar Panel de Administración con Vercel

El panel de administración ahora se integra directamente con Vercel para actualizar variables de entorno y hacer redeploys automáticos.

## 🔧 Variables de Entorno Necesarias en Vercel

Para habilitar las actualizaciones automáticas, añade estas variables de entorno en tu proyecto de Vercel:

### 1. **VERCEL_TOKEN** (Obligatorio para auto-actualización)

Este token permite al panel actualizar variables de entorno y hacer redeploys.

**Cómo obtenerlo:**
1. Ve a https://vercel.com/account/tokens
2. Click en **"Create Token"**
3. Nombre: `Admin Panel Token`
4. Scope: `Full Access` (o al menos acceso al proyecto)
5. Copia el token generado

**Añadirlo en Vercel:**
- Ve a tu proyecto → **Settings** → **Environment Variables**
- Nombre: `VERCEL_TOKEN`
- Valor: `tu-token-aqui`
- Target: **Production**, **Preview**, **Development**

### 2. **VERCEL_PROJECT_ID** (Obligatorio para auto-actualización)

**Cómo obtenerlo:**
1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **General**
3. Copia el **Project ID** (está en la sección de Project Information)

**Añadirlo en Vercel:**
- Nombre: `VERCEL_PROJECT_ID`
- Valor: `prj_xxxxxxxxxxxxx`
- Target: **Production**, **Preview**, **Development**

### 3. **VERCEL_TEAM_ID** (Opcional - solo si tu proyecto está en un team)

**Cómo obtenerlo:**
1. Ve a **Settings** → **General**
2. Si ves un **Team ID**, cópialo

**Añadirlo en Vercel:**
- Nombre: `VERCEL_TEAM_ID`
- Valor: `team_xxxxxxxxxxxxx`
- Target: **Production**, **Preview**, **Development**

---

## 📋 Resumen de Variables de Entorno

Tu proyecto de Vercel debería tener estas variables configuradas:

```env
# Autenticación y BD
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
JWT_SECRET=tu-secreto-jwt

# Stripe (se actualizan desde el panel)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... o pk_live_...
STRIPE_SECRET_KEY=sk_test_... o sk_live_...
STRIPE_PRICE_ID=price_...

# Vercel API (para auto-actualización)
VERCEL_TOKEN=vercel_token_...
VERCEL_PROJECT_ID=prj_...
VERCEL_TEAM_ID=team_... (opcional)

# Email (SendGrid)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@tudominio.com
```

---

## 🎯 Cómo Funciona

### **Sin VERCEL_TOKEN configurado:**
- ✅ El panel guarda cambios en la base de datos
- ❌ NO actualiza variables de entorno en Vercel
- ❌ NO hace redeploy automático
- ⚠️ Debes actualizar manualmente en Vercel

### **Con VERCEL_TOKEN configurado:**
- ✅ El panel guarda cambios en la base de datos
- ✅ Actualiza variables de entorno en Vercel automáticamente
- ✅ Hace redeploy automático
- ✅ Los cambios se aplican en ~2 minutos

---

## 🚀 Flujo de Actualización

1. **Cambias configuración** en el panel de admin
2. Click en **"Guardar Configuración"**
3. El sistema:
   - Guarda en base de datos ✓
   - Actualiza `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en Vercel ✓
   - Actualiza `STRIPE_SECRET_KEY` en Vercel ✓
   - Actualiza `STRIPE_PRICE_ID` en Vercel ✓
   - Triggerea un nuevo deployment ✓
4. **Esperas ~2 minutos** para que Vercel termine el deploy
5. **Los cambios están live** 🎉

---

## 📝 Valores que se Sincronizan

El panel muestra los valores **actuales de Vercel** al cargar:

- ✅ Claves de Stripe (test y production)
- ✅ Price IDs
- ✅ Días de prueba (fijo en 2 días)
- ✅ Precios de suscripción

Cuando guardas cambios:
- Las **credenciales de Stripe activas** se actualizan según el modo (test/production)
- Se hace un **redeploy automático** en Vercel
- Los cambios se reflejan en la app en ~2 minutos

---

## ⚡ Cambiar entre Modo Test y Producción

Cuando cambias el **Modo de Stripe** y guardas:

**Modo Test → Producción:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = stripe_live_publishable_key
STRIPE_SECRET_KEY = stripe_live_secret_key
STRIPE_PRICE_ID = stripe_live_price_id
```

**Modo Producción → Test:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = stripe_test_publishable_key
STRIPE_SECRET_KEY = stripe_test_secret_key
STRIPE_PRICE_ID = stripe_test_price_id
```

---

## 🔒 Seguridad

- ✅ El token de Vercel solo es accesible en el servidor (no se expone al cliente)
- ✅ Solo administradores autenticados pueden hacer cambios
- ✅ Todos los cambios quedan registrados con el email del administrador
- ✅ Las claves secretas nunca se exponen en el frontend (tipo password)

---

## ❓ Troubleshooting

### "No configurado (actualizado solo en BD)"
- Faltan `VERCEL_TOKEN` o `VERCEL_PROJECT_ID`
- Añádelos en Vercel → Settings → Environment Variables
- Redeploy el proyecto para que las tome

### "Actualizado en BD, pero fallo al actualizar Vercel"
- Verifica que el token tenga permisos suficientes
- Verifica que el Project ID sea correcto
- Revisa los logs en Vercel para más detalles

### Los cambios no se reflejan
- Espera ~2 minutos para que termine el redeploy
- Verifica en Vercel → Deployments que haya un nuevo deploy
- Limpia caché del navegador (Ctrl + F5)

---

## 📞 Resumen Rápido

1. **Configura las 2 variables obligatorias:**
   - `VERCEL_TOKEN`
   - `VERCEL_PROJECT_ID`

2. **Redeploy tu proyecto** en Vercel

3. **Usa el panel normalmente:**
   - Los cambios se aplican automáticamente en Vercel
   - Redeploy automático cada vez que guardas
   - Espera ~2 minutos para ver los cambios live

¡Listo! 🎉

