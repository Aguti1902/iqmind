# 🔄 Flujo Completo de Suscripción

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE PAGO Y SUSCRIPCIÓN                  │
└─────────────────────────────────────────────────────────────────┘

1️⃣ USUARIO COMPLETA TEST
   │
   ├─> Responde 20 preguntas
   ├─> Se calcula IQ (ej: 115)
   └─> Se guarda en localStorage
   
   
2️⃣ PÁGINA DE CHECKOUT
   │
   ├─> Frontend llama a /api/create-payment-intent
   │   │
   │   └─> Backend crea:
   │       ├─> Customer en Stripe (o busca existente)
   │       └─> PaymentIntent de 0,50€
   │
   └─> Se renderiza formulario de Stripe


3️⃣ USUARIO PAGA 0,50€
   │
   ├─> Ingresa datos de tarjeta
   ├─> Stripe procesa el pago
   └─> PaymentIntent se confirma
   

4️⃣ DESPUÉS DEL PAGO EXITOSO ⭐
   │
   ├─> Frontend obtiene paymentIntent.id
   │
   └─> Frontend llama a /api/create-subscription
       │
       └─> Backend:
           ├─> Recupera PaymentIntent desde Stripe API
           ├─> Obtiene customerId y paymentMethodId
           ├─> Verifica que no exista suscripción activa
           ├─> Establece payment method como default
           └─> Crea suscripción:
               ├─> Price: STRIPE_PRICE_ID (19,99€)
               ├─> Trial: 2 días
               └─> Status: "trialing"


5️⃣ USUARIO VE SUS RESULTADOS
   │
   └─> Redirige a /resultado
       └─> Muestra IQ completo + certificado


6️⃣ DURANTE LOS 2 DÍAS DE TRIAL
   │
   ├─> Usuario tiene acceso premium
   ├─> Puede cancelar en cualquier momento
   └─> No se cobra nada


7️⃣ DESPUÉS DE 2 DÍAS
   │
   ├─> Si NO canceló:
   │   └─> Stripe cobra automáticamente 19,99€
   │       └─> Webhook: invoice.payment_succeeded
   │
   └─> Si canceló:
       └─> No se cobra nada
           └─> Webhook: customer.subscription.deleted
```

---

## 🔍 Detalles Técnicos de Cada Paso

### Paso 1: Create Payment Intent

**Endpoint**: `POST /api/create-payment-intent`

**Request**:
```json
{
  "email": "usuario@ejemplo.com",
  "userIQ": 115,
  "userName": "Juan Pérez"
}
```

**Response**:
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "customerId": "cus_xxx"
}
```

**Lo que hace**:
- Busca o crea un customer en Stripe
- Crea PaymentIntent de 0,50€
- Configura `setup_future_usage: 'off_session'` para guardar el payment method

---

### Paso 2: Confirmar Pago

**En el Frontend**:
```typescript
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: `${origin}/${lang}/resultado`,
  },
  redirect: 'if_required',
})
```

**Response**:
```typescript
{
  id: "pi_xxx",
  status: "succeeded",
  amount: 50,
  customer: "cus_xxx",
  payment_method: "pm_xxx"
}
```

---

### Paso 3: Crear Suscripción

**Endpoint**: `POST /api/create-subscription`

**Request**:
```json
{
  "email": "usuario@ejemplo.com",
  "userName": "Juan Pérez",
  "paymentIntentId": "pi_xxx"
}
```

**Backend hace**:
```typescript
// 1. Recuperar PaymentIntent completo
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

// 2. Extraer datos
const customerId = paymentIntent.customer
const paymentMethodId = paymentIntent.payment_method

// 3. Crear suscripción
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: process.env.STRIPE_PRICE_ID }],
  trial_period_days: 2,
  payment_settings: {
    payment_method_types: ['card'],
    save_default_payment_method: 'on_subscription',
  }
})
```

**Response**:
```json
{
  "subscriptionId": "sub_xxx",
  "status": "trialing",
  "trialEnd": 1729123200,
  "currentPeriodEnd": 1729123200
}
```

---

## 📊 Estados de la Suscripción

### `trialing` (En Prueba)
- **Duración**: 2 días
- **Cobro**: NINGUNO
- **Acceso**: COMPLETO
- **Puede cancelar**: SÍ, sin cargo

### `active` (Activa)
- **Cuándo**: Después del trial
- **Cobro**: 19,99€/mes
- **Renovación**: Automática cada mes
- **Puede cancelar**: SÍ, pero al final del período pagado

### `canceled` (Cancelada)
- **Cuándo**: Usuario cancela
- **Acceso**: Hasta el final del período pagado
- **Renovación**: NO

### `past_due` (Pago Atrasado)
- **Cuándo**: Falla el pago
- **Stripe**: Reintenta automáticamente
- **Webhook**: `invoice.payment_failed`

---

## 🎯 Eventos de Webhook

### `payment_intent.succeeded`
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 50,
      "customer": "cus_xxx",
      "status": "succeeded"
    }
  }
}
```

**Usar para**:
- Confirmar que el pago de 0,50€ fue exitoso
- Guardar en base de datos

---

### `customer.subscription.created`
```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_xxx",
      "customer": "cus_xxx",
      "status": "trialing",
      "trial_end": 1729123200,
      "items": {
        "data": [{
          "price": { "id": "price_xxx", "unit_amount": 1999 }
        }]
      }
    }
  }
}
```

**Usar para**:
- Marcar usuario como premium
- Guardar fecha de inicio del trial
- Enviar email de bienvenida

---

### `customer.subscription.trial_will_end`
```json
{
  "type": "customer.subscription.trial_will_end",
  "data": {
    "object": {
      "id": "sub_xxx",
      "trial_end": 1729123200
    }
  }
}
```

**Usar para**:
- Enviar email de recordatorio 3 días antes
- "Tu trial termina pronto. Cancela ahora si no quieres que se te cobre."

---

### `invoice.payment_succeeded`
```json
{
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_xxx",
      "amount_paid": 1999,
      "subscription": "sub_xxx"
    }
  }
}
```

**Usar para**:
- Confirmar pago mensual exitoso
- Enviar recibo por email
- Extender acceso premium

---

### `customer.subscription.deleted`
```json
{
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_xxx",
      "status": "canceled"
    }
  }
}
```

**Usar para**:
- Remover acceso premium
- Enviar email de despedida
- Actualizar base de datos

---

## 💾 ¿Qué Guardar en la Base de Datos?

### Tabla: `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  iq_score INTEGER,
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `subscriptions`
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50), -- trialing, active, canceled, past_due
  trial_end TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `payments`
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER, -- en centavos
  currency VARCHAR(3), -- eur
  status VARCHAR(50), -- succeeded, failed
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Seguridad

### ✅ Buenas Prácticas Implementadas

1. **Payment Method se guarda seguro**
   - Stripe guarda la tarjeta
   - Solo guardamos el ID: `pm_xxx`
   - Nunca vemos números de tarjeta

2. **Webhook verificado**
   - Firma verificada con `STRIPE_WEBHOOK_SECRET`
   - Previene webhooks falsos

3. **PaymentIntent recuperado desde backend**
   - No confiamos en datos del frontend
   - Siempre verificamos con Stripe API

4. **Verifica suscripciones existentes**
   - Previene duplicados
   - Retorna suscripción existente si la hay

---

## 🧪 Pruebas Recomendadas

### ✅ Caso 1: Flujo Normal
1. Pagar 0,50€ → Verificar pago exitoso
2. Verificar suscripción creada en Stripe
3. Verificar estado `trialing`
4. Verificar trial de 2 días

### ✅ Caso 2: Usuario Existente
1. Pagar 0,50€ con mismo email dos veces
2. Verificar que detecta suscripción existente
3. No crea suscripción duplicada

### ✅ Caso 3: Pago Fallido
1. Usar tarjeta `4000 0000 0000 0002`
2. Verificar que muestra error
3. No crea suscripción

### ✅ Caso 4: Cancelación
1. Crear suscripción
2. Cancelar inmediatamente
3. Verificar que no se cobra

---

## 📈 Métricas Importantes

### KPIs a Monitorear

1. **Tasa de Conversión**
   - % usuarios que pagan 0,50€

2. **Tasa de Retención**
   - % usuarios que NO cancelan en trial

3. **MRR (Monthly Recurring Revenue)**
   - Ingreso mensual recurrente

4. **Churn Rate**
   - % usuarios que cancelan cada mes

5. **LTV (Lifetime Value)**
   - Valor promedio por usuario

---

## 🎉 Resumen

### Lo que se hizo:

✅ Pago de 0,50€ crea suscripción automática
✅ Trial de 2 días GRATIS
✅ Después cobra 19,99€/mes automáticamente
✅ Usuario puede cancelar en cualquier momento
✅ Payment method guardado de forma segura
✅ Webhooks configurados para eventos importantes
✅ No hay duplicados de suscripciones
✅ Logs detallados para debugging

### Archivos modificados:

- `app/api/create-subscription/route.ts` - Lógica principal
- `app/[lang]/checkout/page.tsx` - Frontend
- `app/api/webhook/route.ts` - Manejo de eventos
- `verify-stripe-setup.js` - Script de verificación
- Documentación actualizada

### Siguiente paso:

```bash
npm run verify-stripe
```

¡Y listo! 🚀

