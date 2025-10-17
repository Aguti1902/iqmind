# 🔐 Configuración de Variables de Stripe en Vercel

## 📌 **Sistema de Variables Separadas**

El sistema ahora usa **variables de entorno separadas** para TEST y PRODUCTION en Vercel. Esto permite cambiar entre modos sin tener que editar las credenciales cada vez.

---

## 🎯 **Variables que debes crear en Vercel**

Ve a: **Vercel → Tu Proyecto → Settings → Environment Variables**

### **Variables de TEST (con sufijo _TEST)**

Estas variables contienen tus credenciales de Stripe en modo test/desarrollo:

1. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST`**
   - Valor: `pk_test_...` (tu clave pública de test de Stripe)
   - Target: Production, Preview, Development

2. **`STRIPE_SECRET_KEY_TEST`**
   - Valor: `sk_test_...` (tu clave secreta de test de Stripe)
   - Target: Production, Preview, Development
   - Tipo: Encrypted

3. **`STRIPE_WEBHOOK_SECRET_TEST`**
   - Valor: `whsec_...` (tu webhook secret de test de Stripe)
   - Target: Production, Preview, Development
   - Tipo: Encrypted

4. **`STRIPE_PRICE_ID_TEST`**
   - Valor: `price_...` (el ID del producto en modo test)
   - Target: Production, Preview, Development

---

### **Variables de PRODUCTION (sin sufijo)**

Estas variables contienen tus credenciales de Stripe en modo producción/live:

1. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**
   - Valor: `pk_live_...` (tu clave pública de producción de Stripe)
   - Target: Production, Preview, Development

2. **`STRIPE_SECRET_KEY`**
   - Valor: `sk_live_...` (tu clave secreta de producción de Stripe)
   - Target: Production, Preview, Development
   - Tipo: Encrypted

3. **`STRIPE_WEBHOOK_SECRET`**
   - Valor: `whsec_...` (tu webhook secret de producción de Stripe)
   - Target: Production, Preview, Development
   - Tipo: Encrypted

4. **`STRIPE_PRICE_ID`**
   - Valor: `price_...` (el ID del producto en modo producción)
   - Target: Production, Preview, Development

---

### **Variable de Control de Modo**

Esta variable indica qué modo está activo actualmente:

5. **`STRIPE_MODE`**
   - Valor: `test` o `production`
   - Target: Production, Preview, Development
   - **IMPORTANTE**: Esta variable se actualiza automáticamente cuando cambias de modo en el panel de admin

---

## 🚀 **Cómo funciona el sistema**

1. **Todas las credenciales** (test y production) están siempre disponibles en Vercel
2. El sistema **lee `STRIPE_MODE`** de la base de datos
3. Según el modo, el sistema usa:
   - Si `STRIPE_MODE = test` → Usa las variables con sufijo `_TEST`
   - Si `STRIPE_MODE = production` → Usa las variables sin sufijo

---

## ✅ **Pasos para configurar por primera vez**

### **1. Añadir las 9 variables en Vercel**

Crea todas las variables listadas arriba en Vercel manualmente.

### **2. Redeploy en Vercel**

Después de añadir todas las variables:
- Ve a: **Vercel → Settings → General → Redeploy**
- Marca: "Use existing build cache"
- Click: **Redeploy**

### **3. Configurar el modo inicial**

El modo por defecto es `test`. Si quieres usar producción desde el inicio:
- Ve al panel de admin: `tudominio.com/es/admin`
- Haz login
- Selecciona "Modo Production"
- Haz click en "Guardar Configuración"
- El sistema actualizará automáticamente `STRIPE_MODE` en Vercel y hará redeploy

---

## 🔄 **Cambiar entre modos TEST ↔ PRODUCTION**

Ahora es muy fácil cambiar de modo:

1. Ve al **Panel de Admin**: `tudominio.com/es/admin`
2. En la sección "Modo de Stripe", haz click en:
   - **"Cambiar a Test"** (si está en production)
   - **"Cambiar a Producción"** (si está en test)
3. Haz click en **"Guardar Configuración"**
4. El sistema automáticamente:
   - ✅ Actualiza `STRIPE_MODE` en Vercel
   - ✅ Actualiza todas las credenciales en la base de datos
   - ✅ Hace redeploy automático
   - ⏱️ En ~2 minutos, la web usará las credenciales correctas

---

## 🧪 **Verificar que está funcionando**

### **En modo TEST:**
- Deberías poder pagar con tarjetas de prueba:
  - **Número**: `4242 4242 4242 4242`
  - **Fecha**: Cualquier fecha futura
  - **CVC**: Cualquier 3 dígitos
- Los pagos NO se cobran realmente
- Los webhooks apuntan al endpoint de test de Stripe

### **En modo PRODUCTION:**
- Los pagos se cobran realmente con tarjetas reales
- No funcionan las tarjetas de prueba
- Los webhooks apuntan al endpoint de producción de Stripe

---

## 🆘 **Solución de problemas**

### **Problema: "Se ha rechazado tu tarjeta"**

**Causa**: La web está en modo PRODUCTION pero intentas usar una tarjeta de prueba (o viceversa).

**Solución**:
1. Verifica el modo en el panel de admin
2. Si el banner dice "Modo Test", deberías usar tarjetas de prueba
3. Si el banner dice "Modo Production", debes usar tarjetas reales

---

### **Problema: "Stripe no configurado"**

**Causa**: Faltan variables de entorno en Vercel.

**Solución**:
1. Verifica que las 9 variables estén creadas en Vercel
2. Verifica que tengan valores correctos (no estén vacías)
3. Haz redeploy

---

### **Problema: Variables no se actualizan automáticamente**

**Causa**: Falta configuración de integración con Vercel API.

**Solución**:
1. Verifica que `VERCEL_TOKEN` esté configurado en Vercel
2. Verifica que `VERCEL_PROJECT_ID` esté configurado en Vercel
3. Si no están configurados, usa el botón "🚀 Deploy Manual" después de guardar

---

## 📝 **Notas importantes**

- ⚠️ **NUNCA compartas** tus claves secretas (`sk_live_...`, `sk_test_...`, `whsec_...`)
- 🔒 Todas las claves secretas deben tener el tipo **"Encrypted"** en Vercel
- ✅ El sistema de variables separadas evita tener que editar credenciales manualmente
- 🚀 Los cambios de modo tardan ~2 minutos en aplicarse (tiempo de redeploy)

---

## 🔗 **Enlaces útiles**

- Panel de Admin: `https://tudominio.com/es/admin`
- Variables Vercel: `https://vercel.com/dashboard/YOUR_PROJECT/settings/environment-variables`
- Dashboard Stripe Test: `https://dashboard.stripe.com/test/dashboard`
- Dashboard Stripe Live: `https://dashboard.stripe.com/dashboard`

