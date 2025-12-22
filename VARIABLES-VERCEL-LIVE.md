# 🔐 Variables de Entorno de Vercel - MODO LIVE

## ✅ Variables CRÍTICAS que DEBES tener configuradas

### 1. Stripe Keys (OBLIGATORIAS)

```bash
# Clave pública de Stripe LIVE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Clave secreta de Stripe LIVE
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Webhook secret de Stripe LIVE
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. Price IDs de Suscripciones (OBLIGATORIAS)

```bash
# Plan Mensual (€19.99/mes)
NEXT_PUBLIC_STRIPE_PRICE_MENSUAL=price_xxxxxxxxxxxxx

# Plan Quincenal (€9.99 cada 2 semanas) - OPCIONAL
NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL=price_xxxxxxxxxxxxx
```

### 3. Configuración General (OBLIGATORIAS)

```bash
# Modo de Stripe (LIVE para producción)
STRIPE_MODE=production

# URL de tu aplicación
NEXT_PUBLIC_APP_URL=https://mindmetric.io
```

### 4. Base de Datos (OBLIGATORIAS)

```bash
# URL de conexión a PostgreSQL (Railway)
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database
```

### 5. Email Service (OBLIGATORIAS para enviar emails)

```bash
# Configuración de Resend o tu proveedor de email
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@mindmetric.io
```

---

## ⚠️ Variables OPCIONALES (pero recomendadas)

### Producto de Pago Inicial (€0.50)

```bash
# Si creas el producto en Stripe (recomendado pero opcional)
STRIPE_INITIAL_PAYMENT_PRICE_ID=price_xxxxxxxxxxxxx
```

**Nota:** Si NO configuras esto, el código usa el monto directo (50 centavos) que funciona igual.

---

## 🔍 Cómo Verificar tus Variables en Vercel

1. Ve a: https://vercel.com
2. Selecciona tu proyecto
3. **Settings** → **Environment Variables**
4. Verifica que tengas TODAS las variables de la lista de arriba

---

## 📝 Checklist de Variables

**CRÍTICAS (NO funcionará sin ellas):**
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (con pk_live_...)
- [ ] `STRIPE_SECRET_KEY` (con sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (con whsec_...)
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_MENSUAL` (price_...)
- [ ] `STRIPE_MODE=production`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `DATABASE_URL`

**IMPORTANTES (para funcionalidad completa):**
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`

**OPCIONALES (pero mejoran seguridad):**
- [ ] `STRIPE_INITIAL_PAYMENT_PRICE_ID`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL`

---

## 🚨 Errores Comunes

### Error: "Stripe no configurado"
**Falta:** `STRIPE_SECRET_KEY` o está en modo TEST
**Solución:** Añade la clave LIVE

### Error: "No se crean suscripciones"
**Falta:** `NEXT_PUBLIC_STRIPE_PRICE_MENSUAL`
**Solución:** Añade el Price ID de tu plan mensual

### Error: "Webhook signature invalid"
**Falta:** `STRIPE_WEBHOOK_SECRET` o está mal
**Solución:** Copia el secret correcto desde Stripe Dashboard

### Error: "Cannot read properties of undefined (reading 'priceId')"
**Falta:** `NEXT_PUBLIC_STRIPE_PRICE_MENSUAL`
**Solución:** Configura el Price ID de la suscripción mensual

---

## 🔄 Después de Añadir Variables

1. **Re-deploya** tu aplicación en Vercel
2. Verifica los logs en **Deployments** → **Functions**
3. Haz un pago de prueba
4. Verifica que se cree la suscripción

---

## 💡 Consejo Pro

Puedes guardar las variables en Railway (BD) en lugar de Vercel:
- Ve al panel de admin de tu app
- **Configuración** → **Stripe**
- Añade las claves ahí

**Ventaja:** Si cambias de hosting, no pierdes la configuración.

---

**Última actualización:** Diciembre 2025

