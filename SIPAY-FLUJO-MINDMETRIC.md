# 💰 Flujo de Pago MindMetric con Sipay

**Configuración específica para MindMetric:**
- 💶 Pago inicial: **0,50€**
- 🎁 Trial gratis: **2 días**
- 🔄 Después: **9,99€/mes** (cobro automático)
- ⚠️ **Sipay NO usa webhooks** (usa URLs de retorno)

---

## 🎯 Flujo Completo

```
Usuario termina test
    ↓
Checkout (0,50€)
    ↓
[Sipay SDK] Usuario ingresa tarjeta
    ↓
Sipay tokeniza + cobra 0,50€
    ↓
Return URL → Backend recibe confirmación
    ↓
BD: Guardar token + activar trial (2 días)
    ↓
Usuario ve su resultado
    ↓
[2 DÍAS DESPUÉS]
    ↓
Cron Job detecta trial vencido
    ↓
Backend cobra 9,99€ usando token (MIT)
    ↓
Si exitoso: subscriptionStatus = 'active'
Si falla: subscriptionStatus = 'expired'
    ↓
Email al usuario con resultado
    ↓
[30 DÍAS DESPUÉS]
    ↓
Repetir cobro mensual automático
```

---

## 📝 Configuración del Flujo

### 1. Pago Inicial (0,50€)

**Endpoint:** `/api/sipay/create-payment`

```typescript
// Frontend llama a esto
const response = await fetch('/api/sipay/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    userName: 'Usuario',
    amount: 0.50, // ← Pago inicial
    userIQ: 120,
    lang: 'es',
    testData: { /* datos del test */ }
  })
})
```

**Backend devuelve:**
```json
{
  "success": true,
  "orderId": "order_123456",
  "amount": 0.50,
  "userId": "user_abc",
  "sipayConfig": {
    "key": "tu_api_key",
    "resource": "tu_resource",
    "endpoint": "https://sandbox.sipay.es"
  }
}
```

---

### 2. Procesamiento con Token

**Sipay SDK genera token → Backend procesa**

**Endpoint:** `/api/sipay/process-payment`

```typescript
const response = await fetch('/api/sipay/process-payment', {
  method: 'POST',
  body: JSON.stringify({
    orderId: 'order_123456',
    cardToken: 'token_recibido_de_sipay',
    email: 'usuario@example.com',
    amount: 0.50,
    description: 'Resultado Test MindMetric',
    lang: 'es'
  })
})
```

**Backend hace:**
1. Cobra 0,50€ con Sipay
2. Guarda el token en BD (`user.subscriptionId = token`)
3. Activa trial: `subscriptionStatus = 'trial'`
4. Calcula: `trialEndDate = now() + 2 días`

---

### 3. URLs de Retorno (NO Webhooks)

**⚠️ IMPORTANTE:** Sipay NO usa webhooks. Usa estas URLs:

```typescript
const returnUrl = `https://mindmetric.io/${lang}/resultado?order_id=${orderId}`
const cancelUrl = `https://mindmetric.io/${lang}/checkout?canceled=true`
```

**En la página de resultado (`/resultado`):**

```typescript
// app/[lang]/resultado/page.tsx

useEffect(() => {
  const orderId = searchParams.get('order_id')
  
  if (orderId) {
    // Verificar el pago en backend
    fetch(`/api/sipay/verify-payment?order_id=${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Mostrar resultado del test
        }
      })
  }
}, [])
```

---

### 4. Cobro Recurrente Automático (Después de 2 días)

**Opción A: Cron Job en Vercel**

Crea: `app/api/cron/charge-subscriptions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verificar cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🔄 Iniciando cobro de suscripciones...')

  // Buscar usuarios con trial vencido
  const now = new Date()
  const usersToCharge = await db.query(`
    SELECT id, email, subscription_id as "subscriptionId"
    FROM users
    WHERE subscription_status = 'trial'
      AND trial_end_date <= $1
      AND subscription_id IS NOT NULL
  `, [now.toISOString()])

  const results = {
    success: 0,
    failed: 0,
    total: usersToCharge.length
  }

  for (const user of usersToCharge) {
    try {
      // Cobrar 9.99€
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sipay/recurring-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: 9.99,
          description: 'Suscripción mensual MindMetric Premium'
        })
      })

      if (response.ok) {
        results.success++
        console.log(`✅ Cobrado: ${user.email}`)
      } else {
        results.failed++
        console.error(`❌ Falló: ${user.email}`)
      }
    } catch (error) {
      results.failed++
      console.error(`❌ Error: ${user.email}`, error)
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    timestamp: new Date().toISOString()
  })
}
```

**Configurar en Vercel:**

1. Ve a tu proyecto en Vercel
2. **Settings** → **Cron Jobs**
3. Agregar:
   ```
   Path: /api/cron/charge-subscriptions
   Schedule: 0 */6 * * * (cada 6 horas)
   ```

4. Agregar variable de entorno:
   ```
   CRON_SECRET=tu_secret_aleatorio_aqui
   ```

---

**Opción B: Endpoint Manual (para testing)**

```bash
# Llamar manualmente para probar
curl https://mindmetric.io/api/cron/charge-subscriptions \
  -H "Authorization: Bearer tu_secret"
```

---

### 5. Cobro Recurrente (MIT)

**Endpoint:** `/api/sipay/recurring-payment`

Este endpoint ya está implementado. Cobra usando el token guardado:

```typescript
// El cron job llama a esto
const response = await fetch('/api/sipay/recurring-payment', {
  method: 'POST',
  body: JSON.stringify({
    email: 'usuario@example.com',
    amount: 9.99, // ← Cobro mensual
    description: 'Suscripción mensual MindMetric Premium'
  })
})
```

**Backend hace:**
1. Obtiene el token del usuario: `user.subscriptionId`
2. Cobra 9,99€ con Sipay MIT (sin presencia del usuario)
3. Si exitoso:
   - `subscriptionStatus = 'active'`
   - `accessUntil = now() + 30 días`
4. Si falla:
   - `subscriptionStatus = 'expired'`
   - Enviar email al usuario

---

## 🧪 Tarjetas de Prueba Oficiales

### Tarjetas Exitosas

| Marca | Número | Caducidad | CVV | Protocolo |
|-------|--------|-----------|-----|-----------|
| **VISA** | `4548819407777774` | `12/25` | `123` | EMV3DS 2.2 ✅ |
| **VISA** | `4548810000000003` | `12/49` | `123` | EMV3DS 2.2 ✅ |
| **Mastercard** | `5576 4415 6304 5037` | `12/49` | `123` | EMV3DS 2.1 ✅ |

### CVV Especiales para Simular Errores

| CVV | Resultado |
|-----|-----------|
| `123` | ✅ Pago exitoso |
| `999` | ❌ Denegada (autenticación exitosa pero pago denegado) |
| `172` | ❌ Denegada - No repetir |
| `173` | ❌ Denegada - No repetir sin actualizar datos |
| `174` | ❌ Denegada - No repetir hasta 72 horas |

### Importes Especiales para Simular Errores

| Importe | Resultado |
|---------|-----------|
| `X,96€` | ❌ Denegación genérica |
| `X,72€` | ❌ Error de conexión |
| `X,73€` | ❌ Error de autenticación |
| `X,74€` | ❌ Timeout (tiempo agotado) |

**Ejemplo:** Si cobras `1,96€` en lugar de `0,50€`, Sipay devolverá denegación genérica.

---

## 📋 Checklist de Testing

### Test 1: Pago Inicial (0,50€)
- [ ] Usuario va a `/es/checkout`
- [ ] Se carga formulario de Sipay
- [ ] Usuario ingresa: `4548819407777774` / `12/25` / `123`
- [ ] Pago exitoso (0,50€)
- [ ] Token guardado en BD
- [ ] `subscriptionStatus = 'trial'`
- [ ] `trialEndDate = now() + 2 días`
- [ ] Usuario redirigido a `/es/resultado`

### Test 2: Verificar Trial
- [ ] Usuario puede ver su resultado
- [ ] En BD: `subscriptionStatus = 'trial'`
- [ ] En BD: `trialEndDate` es correcto
- [ ] En BD: `subscriptionId` tiene el token

### Test 3: Cobro Después de Trial (manual)
- [ ] Cambiar `trialEndDate` a fecha pasada (en BD)
- [ ] Llamar manualmente al cron: `/api/cron/charge-subscriptions`
- [ ] Verificar que intenta cobrar 9,99€
- [ ] Si exitoso: `subscriptionStatus = 'active'`
- [ ] Si falla: `subscriptionStatus = 'expired'`

### Test 4: Cancelación
- [ ] Usuario va a `/es/dashboard` o `/es/cuenta`
- [ ] Click en "Cancelar suscripción"
- [ ] Backend elimina token: `/api/sipay/delete-card`
- [ ] `subscriptionStatus = 'canceled'`
- [ ] Usuario mantiene acceso hasta `accessUntil`

---

## ⚠️ Diferencias Clave con Stripe

| Aspecto | Stripe | Sipay |
|---------|--------|-------|
| **Webhooks** | ✅ Sí (payment_intent.succeeded) | ❌ No (usa returnUrl) |
| **Notificaciones** | Automáticas via webhook | Manual via return URL |
| **Subscripciones** | API de Subscriptions | Manual con tokens MIT |
| **Trial** | Integrado en Subscription | Manual (controlar en backend) |
| **Cobro recurrente** | Automático | Manual (cron job + MIT) |

---

## 🔧 Variables de Entorno Necesarias

```bash
# Sipay
SIPAY_API_KEY=xxxx-xxxx-xxxx-xxxx
SIPAY_API_SECRET=xxxxxxxxxxxxxxxx
SIPAY_RESOURCE=xxxxxxxxxxxxxxxx
SIPAY_ENDPOINT=https://sandbox.sipay.es

NEXT_PUBLIC_SIPAY_KEY=xxxx-xxxx-xxxx-xxxx
NEXT_PUBLIC_SIPAY_RESOURCE=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_SIPAY_ENDPOINT=https://sandbox.sipay.es

# App
NEXT_PUBLIC_APP_URL=https://mindmetric.io
CRON_SECRET=genera_un_secret_aleatorio_aqui

# Database
DATABASE_URL=postgresql://...
```

---

## 📊 Estado de la Suscripción

| Estado | Descripción |
|--------|-------------|
| `trial` | Trial activo (2 días) |
| `active` | Suscripción activa (pagando) |
| `expired` | Pago falló / Trial terminó sin pago |
| `canceled` | Usuario canceló |

---

## 🚀 Próximos Pasos

1. **Solicitar credenciales a Sipay** (si aún no las tienes)
2. **Configurar `.env.local`** con las credenciales
3. **Probar flujo completo:**
   - Pago de 0,50€
   - Verificar token guardado
   - Simular trial vencido
   - Probar cobro recurrente
4. **Configurar cron job en Vercel**
5. **Deploy a producción**

---

## 📞 Soporte

- **Documentación Sipay:** https://developer.sipay.es/docs/
- **Códigos de respuesta:** https://developer.sipay.es/docs/documentation/testing/response_codes
- **Email Sipay:** soporte@sipay.es

---

**Última actualización:** Enero 24, 2026  
**Estado:** ✅ Listo para implementar

