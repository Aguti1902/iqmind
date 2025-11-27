# 🔐 CREDENCIALES DE STRIPE PARA VERCEL

## 📋 Variables de Entorno Requeridas

Ve a: **Vercel → Tu Proyecto → Settings → Environment Variables**

Crea estas **9 variables** exactamente como se indica:

---

## 🧪 MODO TEST (Desarrollo)

### 1. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
Value: pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production ☑ Preview ☑ Development
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/test/apikeys
2. Copia la clave que dice **"Publishable key"**
3. Empieza con `pk_test_`

---

### 2. STRIPE_SECRET_KEY_TEST
```
Name: STRIPE_SECRET_KEY_TEST
Value: sk_test_[tu_clave_secreta_aqui]
Environments: ☑ Production ☑ Preview ☑ Development
Type: ☑ Encrypted (IMPORTANTE)
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/test/apikeys
2. Click en **"Reveal test key"** en la sección "Secret key"
3. Copia la clave
4. Empieza con `sk_test_`
5. **MARCA COMO ENCRYPTED EN VERCEL**

---

### 3. STRIPE_WEBHOOK_SECRET_TEST
```
Name: STRIPE_WEBHOOK_SECRET_TEST
Value: whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production ☑ Preview ☑ Development
Type: ☑ Encrypted (IMPORTANTE)
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Si no existe webhook, créalo (ver archivo `2_WEBHOOKS_STRIPE.md`)
3. Click en el webhook que creaste
4. Copia el **"Signing secret"**
5. Empieza con `whsec_`
6. **MARCA COMO ENCRYPTED EN VERCEL**

---

### 4. STRIPE_PRICE_ID_TEST
```
Name: STRIPE_PRICE_ID_TEST
Value: price_xxxxxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production ☑ Preview ☑ Development
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/test/products
2. Si no existe producto, créalo (ver sección abajo)
3. Click en tu producto
4. Copia el **"Price ID"** del precio mensual
5. Empieza con `price_`

---

## 🚀 MODO PRODUCTION (Live)

### 5. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production ☑ Preview ☑ Development
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/apikeys (modo LIVE)
2. Copia la clave que dice **"Publishable key"**
3. Empieza con `pk_live_`

---

### 6. STRIPE_SECRET_KEY
```
Name: STRIPE_SECRET_KEY
Value: sk_live_[tu_clave_secreta_live_aqui]
Environments: ☑ Production ☑ Preview ☑ Development
Type: ☑ Encrypted (IMPORTANTE)
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/apikeys (modo LIVE)
2. Click en **"Reveal live key"** en la sección "Secret key"
3. Copia la clave
4. Empieza con `sk_live_`
5. **MARCA COMO ENCRYPTED EN VERCEL**

---

### 7. STRIPE_WEBHOOK_SECRET
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production ☑ Preview ☑ Development
Type: ☑ Encrypted (IMPORTANTE)
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/webhooks (modo LIVE)
2. Si no existe webhook, créalo con tu dominio de producción
3. Click en el webhook que creaste
4. Copia el **"Signing secret"**
5. Empieza con `whsec_`
6. **MARCA COMO ENCRYPTED EN VERCEL**

---

### 8. STRIPE_PRICE_ID
```
Name: STRIPE_PRICE_ID
Value: price_xxxxxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production ☑ Preview ☑ Development
```

**¿Dónde obtenerla?**
1. Ve a: https://dashboard.stripe.com/products (modo LIVE)
2. Si no existe producto, créalo con el mismo precio que en test
3. Click en tu producto
4. Copia el **"Price ID"** del precio mensual
5. Empieza con `price_`

---

## 🔄 VARIABLE DE CONTROL

### 9. STRIPE_MODE
```
Name: STRIPE_MODE
Value: test
Environments: ☑ Production ☑ Preview ☑ Development
```

**Valores posibles:**
- `test` - Para desarrollo y pruebas
- `production` - Para pagos reales

**Nota:** Puedes cambiar esto desde el panel admin después

---

## 📦 CÓMO CREAR EL PRODUCTO EN STRIPE

### Para TEST y PRODUCTION (hacer en ambos):

1. Ve a **Products** → **Add product**
2. Completa:
   ```
   Name: [Nombre de tu producto] Premium
   Description: Suscripción mensual premium
   ```
3. En **Pricing**:
   ```
   Price: 19.99 EUR (o tu precio)
   Billing period: Recurring → Monthly
   ```
4. Click en **Add product**
5. Copia el **Price ID** que aparece

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de hacer deploy, verifica:

- [ ] Las 9 variables están creadas en Vercel
- [ ] Todas están marcadas en: Production, Preview, Development
- [ ] Las Secret Keys están marcadas como **Encrypted**
- [ ] Todos los valores empiezan con el prefijo correcto (`pk_`, `sk_`, `whsec_`, `price_`)
- [ ] El producto existe tanto en TEST como en PRODUCTION
- [ ] Los webhooks están configurados (ver siguiente archivo)

---

## 🔄 DESPUÉS DE AÑADIR LAS VARIABLES

1. Ve a **Vercel → Deployments**
2. Click en el último deployment → **"..."** → **Redeploy**
3. Espera 2-3 minutos
4. Prueba el flujo de pago

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Stripe is not configured"
→ Faltan variables. Revisa que las 9 estén creadas.

### Error: "Invalid API key"
→ La clave tiene espacios o no empieza con el prefijo correcto.

### Error: "No such price"
→ El STRIPE_PRICE_ID no existe. Crea el producto en Stripe.

### Los pagos no se procesan
→ Verifica que STRIPE_MODE esté en "test" para pruebas o "production" para pagos reales.

---

**⚠️ IMPORTANTE:** Nunca compartas tus Secret Keys. Son como la contraseña de tu cuenta bancaria.

