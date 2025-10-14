# Configuración de Stripe - IQLevel

Esta guía te ayudará a configurar Stripe para procesar pagos en IQLevel.

## 🔑 Obtener las Claves de Stripe

### Paso 1: Crear Cuenta en Stripe

1. Ve a https://stripe.com/
2. Haz clic en "Comenzar ahora" o "Sign up"
3. Completa el registro con tu email y contraseña
4. Verifica tu email

### Paso 2: Activar tu Cuenta

1. Inicia sesión en https://dashboard.stripe.com/
2. Completa la información de tu negocio
3. Añade tus datos bancarios para recibir pagos

### Paso 3: Obtener las Claves API

1. En el Dashboard de Stripe, ve a **Developers** → **API keys**

2. Encontrarás dos claves en modo TEST:
   - **Publishable key**: Comienza con `pk_test_...`
   - **Secret key**: Comienza con `sk_test_...`

3. Copia estas claves y guárdalas

### Paso 4: Configurar Webhook

1. Ve a **Developers** → **Webhooks**
2. Haz clic en "Add endpoint"
3. URL del endpoint:
   - Desarrollo: `http://localhost:3000/api/webhook`
   - Producción: `https://tu-dominio.com/api/webhook`

4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`

5. Haz clic en "Add endpoint"
6. Copia el **Signing secret** (comienza con `whsec_...`)

## ⚙️ Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# STRIPE CONFIGURATION
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ANALYTICS (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_META_PIXEL_ID=

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Dónde Encontrar Cada Clave

| Variable | Dónde Encontrarla | Formato |
|----------|-------------------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard → Developers → API keys | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys (clic en "Reveal test key") | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Dashboard → Developers → Webhooks → [Tu endpoint] → Signing secret | `whsec_...` |

## 🧪 Probar en Modo Test

Stripe proporciona tarjetas de prueba para hacer pruebas sin cargos reales:

### Tarjetas de Prueba

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Tarjeta declinada |
| `4000 0000 0000 9995` | Fondos insuficientes |

**Otros datos de prueba:**
- Fecha de expiración: Cualquier fecha futura (ej: 12/25)
- CVC: Cualquier 3 dígitos (ej: 123)
- Código postal: Cualquiera (ej: 12345)

## 🔄 Flujo de Pago

1. Usuario completa el test
2. Ve resultado estimado (borroso)
3. Hace clic en "Desbloquear por 0,50€"
4. Ingresa su email y acepta términos
5. Se crea una sesión de Stripe Checkout
6. Usuario ingresa datos de tarjeta en Stripe
7. Stripe procesa el pago
8. Usuario es redirigido a `/resultado`
9. Ve su resultado completo

## 💰 Configurar Precio

El precio actual está configurado en:
```typescript
// app/api/create-checkout-session/route.ts
unit_amount: 50, // 0.50€ en centavos
```

Para cambiar el precio:
- 0,50€ = 50 centavos
- 1,00€ = 100 centavos
- 19,99€ = 1999 centavos

## 📊 Configurar Suscripción (Opcional)

Para añadir la suscripción mensual de 19,99€ con 2 días de prueba:

### Paso 1: Crear Producto en Stripe

1. Dashboard → **Products** → **Add product**
2. Nombre: "IQLevel Premium"
3. Precio: 19,99€/mes
4. Billing period: Monthly
5. Guarda el producto

### Paso 2: Obtener Price ID

1. Copia el **Price ID** (comienza con `price_...`)

### Paso 3: Actualizar el Código

En `app/api/create-checkout-session/route.ts`, descomenta y configura:

```typescript
subscription_data: {
  trial_period_days: 2,
},
```

Y añade el line_item de la suscripción con el Price ID.

## 🚀 Pasar a Producción

Cuando estés listo para aceptar pagos reales:

### 1. Activar tu Cuenta

1. Ve a Dashboard → **Settings** → **Account details**
2. Completa toda la información requerida
3. Añade tus datos bancarios
4. Activa tu cuenta

### 2. Usar Claves de Producción

1. Ve a **Developers** → **API keys**
2. Cambia a "Live mode" (toggle arriba a la derecha)
3. Copia las claves de producción:
   - `pk_live_...`
   - `sk_live_...`

### 3. Actualizar Variables de Entorno

En tu plataforma de hosting (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

### 4. Configurar Webhook de Producción

1. En Stripe Dashboard (Live mode)
2. **Developers** → **Webhooks** → **Add endpoint**
3. URL: `https://tu-dominio.com/api/webhook`
4. Selecciona los mismos eventos
5. Actualiza `STRIPE_WEBHOOK_SECRET` con el nuevo

## 🔐 Seguridad

- ✅ Nunca expongas `STRIPE_SECRET_KEY` en el cliente
- ✅ Solo usa `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en el frontend
- ✅ Verifica la firma del webhook con `STRIPE_WEBHOOK_SECRET`
- ✅ No subas `.env.local` a Git (ya está en `.gitignore`)

## 📱 Testear el Flujo Completo

1. **Sin configurar Stripe**:
   - El sitio funcionará en modo demo
   - Simulará el pago exitoso
   - No se cobrará nada

2. **Con Stripe en modo Test**:
   ```bash
   # 1. Configura .env.local con las claves de test
   # 2. Reinicia el servidor
   npm run dev
   
   # 3. Haz el test completo
   # 4. En checkout, usa tarjeta de prueba: 4242 4242 4242 4242
   ```

3. **Verificar pago en Dashboard**:
   - Dashboard → **Payments**
   - Deberías ver el pago de prueba

## ❓ Problemas Comunes

### Error: "Stripe is not defined"

**Solución**: Reinicia el servidor después de añadir las claves:
```bash
# Detener el servidor (Ctrl+C)
npm run dev
```

### Error: "Invalid API key"

**Solución**: 
1. Verifica que la clave comienza con `pk_test_` o `sk_test_`
2. No tiene espacios al inicio o final
3. Está en `.env.local` (no `.env`)

### El webhook no funciona

**Solución**:
1. Para desarrollo local, usa Stripe CLI
2. Instala: https://stripe.com/docs/stripe-cli
3. Forward events: `stripe listen --forward-to localhost:3000/api/webhook`

### Pago se procesa pero no redirige

**Solución**:
1. Verifica la URL de success en `create-checkout-session/route.ts`
2. Debe incluir tu dominio completo

## 📚 Recursos

- **Documentación Stripe**: https://stripe.com/docs
- **Dashboard**: https://dashboard.stripe.com/
- **API Reference**: https://stripe.com/docs/api
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Tarjetas de Prueba**: https://stripe.com/docs/testing

## 💡 Tips

1. **Usa modo Test** mientras desarrollas
2. **Monitorea pagos** en el Dashboard
3. **Configura emails** para confirmaciones (en Settings → Emails)
4. **Activa 3D Secure** para mayor seguridad (automático)
5. **Revisa logs** en Dashboard → Developers → Logs

---

¿Tienes problemas? Revisa la consola del navegador y los logs del servidor para más información.

