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
   - `payment_intent.succeeded`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Haz clic en "Add endpoint"
6. Copia el **Signing secret** (comienza con `whsec_...`)

## ⚙️ Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# STRIPE CONFIGURATION
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# STRIPE PRICE ID (IMPORTANTE - Ver sección "Configurar Suscripción")
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx

# ANALYTICS (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_META_PIXEL_ID=

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Dónde Encontrar Cada Clave

| Variable | Dónde Encontrarla | Formato | Requerido |
|----------|-------------------|---------|-----------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard → Developers → API keys | `pk_test_...` | ✅ Sí |
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys (clic en "Reveal test key") | `sk_test_...` | ✅ Sí |
| `STRIPE_PRICE_ID` | Dashboard → Products → [Tu producto] → Price ID | `price_...` | ✅ **SÍ** |
| `STRIPE_WEBHOOK_SECRET` | Dashboard → Developers → Webhooks → [Tu endpoint] → Signing secret | `whsec_...` | ⚠️ Prod |

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

## 📊 Configurar Suscripción (⚠️ REQUERIDO)

**IMPORTANTE**: La suscripción es OBLIGATORIA para que el flujo de pago funcione correctamente.

Cuando el usuario paga 0,50€, automáticamente se crea una suscripción de 19,99€/mes con 2 días de prueba gratis.

### Paso 1: Crear Producto en Stripe

1. Ve a Dashboard → **Products** → **Add product**
2. Configura el producto:
   - **Nombre**: "IQLevel Premium" (o el nombre que prefieras)
   - **Descripción**: "Suscripción mensual premium"
3. En la sección de **Pricing**:
   - **Price**: `19.99` EUR
   - **Billing Period**: `Recurring` → `Monthly`
4. Clic en **Save product**

### Paso 2: Obtener Price ID

1. En la página del producto, busca la sección de **Pricing**
2. Copia el **Price ID** que aparece junto al precio
   - Formato: `price_xxxxxxxxxxxxxxxxxxxxx`
3. Este ID lo necesitas para el siguiente paso

### Paso 3: Añadir a Variables de Entorno

Añade el Price ID a tu archivo `.env.local`:

```env
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
```

### Paso 4: Verificar Configuración

Ejecuta el script de verificación para asegurarte de que todo está bien:

```bash
npm run verify-stripe
```

Este script verificará:
- ✅ Todas las claves de Stripe
- ✅ Que el `STRIPE_PRICE_ID` existe y es válido
- ✅ Que el precio es 19,99€ mensual recurrente
- ✅ Conexión con Stripe

### Flujo Automático de Suscripción

El sistema funciona así:

1. **Usuario paga 0,50€** → Accede a su resultado
2. **Automáticamente** se crea una suscripción de 19,99€/mes
3. **Trial de 2 días GRATIS** → No se cobra nada durante el trial
4. **Después de 2 días** → Stripe cobra automáticamente 19,99€
5. **Usuario puede cancelar** en cualquier momento durante el trial sin cargo

**Código implementado**:
- ✅ `app/api/create-payment-intent/route.ts` - Procesa el pago de 0,50€
- ✅ `app/api/create-subscription/route.ts` - Crea la suscripción con trial
- ✅ `app/[lang]/checkout/page.tsx` - Flujo de frontend
- ✅ `app/api/webhook/route.ts` - Maneja eventos de Stripe

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

### 1. Verificar Configuración

```bash
# Verifica que todo esté bien configurado
npm run verify-stripe
```

### 2. Iniciar Servidor

```bash
# Asegúrate de tener .env.local configurado
npm run dev
```

### 3. Probar el Flujo de Pago

1. Ve a http://localhost:3000/es/test
2. Completa el test de IQ
3. En checkout:
   - Ingresa un email de prueba
   - Usa tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura (ej: 12/28)
   - CVC: 123
4. Paga 0,50€

### 4. Verificar en Logs del Servidor

Deberías ver algo como:

```
✅ Pago de €0.50 exitoso: pi_...
📦 Creando suscripción con PaymentIntent ID: pi_...
=== INICIO CREAR SUSCRIPCIÓN ===
🔍 Recuperando PaymentIntent desde Stripe...
✅ Customer y Payment Method obtenidos correctamente
🚀 Creando suscripción con trial de 2 días...
✅ Suscripción creada exitosamente: sub_...
Estado: trialing
Trial end: 2025-10-16T...
```

### 5. Verificar en Stripe Dashboard

#### En Payments:
- Dashboard → **Payments**
- Deberías ver el pago de 0,50€ ✅

#### En Subscriptions:
- Dashboard → **Subscriptions**
- Deberías ver la nueva suscripción:
  - **Status**: `Trialing` 🎯
  - **Trial ends**: En 2 días
  - **Amount**: 19,99€
  - **Interval**: Monthly

#### En Customers:
- Dashboard → **Customers**
- Deberías ver el nuevo cliente con:
  - Email del usuario
  - Payment method guardado
  - Suscripción activa

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

### Error: "Configuración de precio no encontrada"

**Solución**:
1. Falta la variable `STRIPE_PRICE_ID` en `.env.local`
2. Ejecuta `npm run verify-stripe` para diagnosticar
3. Sigue la sección "Configurar Suscripción" de este documento

### La suscripción no se crea después del pago

**Solución**:
1. Verifica que `STRIPE_PRICE_ID` esté configurado
2. Revisa los logs del servidor para ver errores
3. Ejecuta `npm run verify-stripe`
4. Verifica que el precio en Stripe esté activo

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

