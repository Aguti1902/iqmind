# 🔔 CONFIGURACIÓN DE WEBHOOKS EN STRIPE

## ¿Qué son los Webhooks?

Los webhooks son notificaciones que Stripe envía a tu servidor cuando ocurre un evento (un pago exitoso, una suscripción cancelada, etc.). Son **ESENCIALES** para que tu aplicación funcione correctamente.

---

## 🧪 WEBHOOK DE TEST

### Paso 1: Acceder a Webhooks
1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Click en **"Add endpoint"**

### Paso 2: Configurar el Endpoint

```
Endpoint URL: https://tu-dominio-temporal.vercel.app/api/webhook
(Usa tu URL de Vercel para pruebas, o tu dominio final)

Description: IQ Test Webhook - Test
```

### Paso 3: Seleccionar Eventos

**Marca estos 8 eventos (TODOS son necesarios):**

#### ✅ Eventos de Payment Intent
- `payment_intent.succeeded` - Cuando un pago se completa exitosamente
- `payment_intent.payment_failed` - Cuando un pago falla

#### ✅ Eventos de Checkout
- `checkout.session.completed` - Cuando el usuario completa el checkout

#### ✅ Eventos de Customer
- `customer.created` - Cuando se crea un nuevo cliente
- `customer.updated` - Cuando se actualiza un cliente

#### ✅ Eventos de Suscripción
- `customer.subscription.created` - Cuando se crea una suscripción
- `customer.subscription.updated` - Cuando se actualiza una suscripción (ej: cancelación)
- `customer.subscription.deleted` - Cuando se elimina una suscripción

#### ✅ Eventos de Invoice (Facturación)
- `invoice.payment_succeeded` - Cuando se cobra la suscripción mensual
- `invoice.payment_failed` - Cuando falla el cobro mensual

### Paso 4: Configuración de Seguridad

```
API version: Use your account's default
```

**NO marques:**
- "Listen to events on connected accounts" - NO
- "Include metadata in events" - Opcional

### Paso 5: Guardar y Copiar Secret

1. Click en **"Add endpoint"**
2. Stripe te mostrará el webhook creado
3. **Copia el "Signing secret"** (empieza con `whsec_`)
4. Guárdalo en Vercel como `STRIPE_WEBHOOK_SECRET_TEST`

---

## 🚀 WEBHOOK DE PRODUCTION

### Paso 1: Cambiar a Modo Live
1. En Stripe Dashboard, cambia el toggle a **"Live"** (arriba a la derecha)
2. Ve a: https://dashboard.stripe.com/webhooks

### Paso 2: Configurar el Endpoint

```
Endpoint URL: https://tu-dominio-real.com/api/webhook
(USA TU DOMINIO FINAL DE PRODUCCIÓN)

Description: IQ Test Webhook - Production
```

### Paso 3: Seleccionar los MISMOS Eventos

Marca exactamente los mismos 8 eventos que en test:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`
- `customer.created`
- `customer.updated`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Paso 4: Guardar y Copiar Secret

1. Click en **"Add endpoint"**
2. **Copia el "Signing secret"** (empieza con `whsec_`)
3. Guárdalo en Vercel como `STRIPE_WEBHOOK_SECRET`

---

## 🧪 PROBAR LOS WEBHOOKS

### Desde Stripe Dashboard

1. Ve a tu webhook en: https://dashboard.stripe.com/test/webhooks
2. Click en el webhook
3. Click en la pestaña **"Send test webhook"**
4. Selecciona el evento: `payment_intent.succeeded`
5. Click en **"Send test webhook"**
6. Deberías ver una respuesta **200 OK**

### Verificar en Logs

1. Ve a **Vercel → Tu Proyecto → Logs**
2. Busca por: `[webhook]`
3. Deberías ver logs como:
   ```
   ✅ [webhook] Evento recibido: payment_intent.succeeded
   ✅ [webhook] Pago procesado exitosamente
   ```

---

## 📊 QUÉ HACE CADA EVENTO

### payment_intent.succeeded
- Se ejecuta cuando el usuario paga los 0.50€ iniciales
- Crea el usuario en la base de datos
- Envía el email con credenciales
- Crea la suscripción automática

### customer.subscription.created
- Se ejecuta cuando se crea la suscripción (con trial)
- Actualiza el estado del usuario a "trialing"
- Registra la fecha de fin del trial

### invoice.payment_succeeded
- Se ejecuta cuando se cobra la suscripción mensual (después del trial)
- Actualiza el estado del usuario a "active"
- Extiende el acceso por 30 días más

### customer.subscription.updated
- Se ejecuta cuando el usuario cancela o modifica su suscripción
- Actualiza el estado en la base de datos

### customer.subscription.deleted
- Se ejecuta cuando termina el acceso del usuario
- Cambia el estado a "cancelled"

### invoice.payment_failed
- Se ejecuta cuando falla el cobro de la suscripción
- Envía notificación al usuario
- Marca el usuario como "past_due"

---

## 🔒 SEGURIDAD DE WEBHOOKS

### ¿Por qué necesitamos el Webhook Secret?

El **Signing Secret** verifica que las peticiones realmente vienen de Stripe y no de un atacante. Tu código ya lo valida automáticamente.

### ¿Cómo funciona?

```typescript
// Tu código ya hace esto:
const signature = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
// Si el signature no es válido, lanza un error
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error 401: Unauthorized
→ El webhook secret es incorrecto. Verifica `STRIPE_WEBHOOK_SECRET_TEST` en Vercel.

### Error 404: Not Found
→ La URL del webhook está mal. Debe ser: `https://tu-dominio.com/api/webhook`

### Error 500: Internal Server Error
→ Hay un error en tu código. Revisa los logs en Vercel.

### No recibo webhooks
1. Verifica que el endpoint esté **activo** en Stripe
2. Verifica que la URL sea la correcta
3. Prueba con "Send test webhook" desde Stripe Dashboard

### Webhooks duplicados
→ Es normal en algunas ocasiones. Tu código debe ser idempotente (manejar duplicados).

---

## 📋 CHECKLIST FINAL

- [ ] Webhook de TEST creado y funcionando
- [ ] Webhook de PRODUCTION creado con dominio final
- [ ] Los 8 eventos están marcados en ambos webhooks
- [ ] Signing secrets guardados en Vercel
- [ ] Test webhook enviado con respuesta 200 OK
- [ ] Logs de Vercel muestran eventos procesados correctamente

---

## 🔄 ACTUALIZAR WEBHOOK AL CAMBIAR DE DOMINIO

Si cambias de dominio:

1. Ve a Stripe → Webhooks
2. Click en tu webhook actual
3. Click en **"..."** → **"Edit endpoint"**
4. Cambia la URL a tu nuevo dominio
5. Click en **"Update endpoint"**
6. **NO necesitas cambiar el Webhook Secret en Vercel** (sigue siendo el mismo)

---

**✅ Con esto, tu aplicación podrá recibir y procesar todos los eventos de Stripe correctamente.**

