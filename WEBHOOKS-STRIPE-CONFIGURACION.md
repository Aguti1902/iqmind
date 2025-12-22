# 🔔 Configuración de Webhooks de Stripe

## 📋 Lista Completa de Webhooks Requeridos

Para que la aplicación funcione correctamente, necesitas configurar los siguientes **7 eventos** en tu cuenta de Stripe:

---

## ✅ Eventos CRÍTICOS (Obligatorios)

### 1. `payment_intent.succeeded`
**¿Qué hace?**
- Se dispara cuando un cliente completa exitosamente el pago de €1
- Crea automáticamente la suscripción con trial de 15 días
- Envía email de bienvenida con credenciales de acceso
- Guarda el resultado del test en la base de datos

**¿Cuándo se dispara?**
- Cada vez que un cliente paga exitosamente el €1 inicial

**Estado:** 🔴 **CRÍTICO** - Sin este webhook, NO se crearán suscripciones automáticamente

---

### 2. `customer.subscription.created`
**¿Qué hace?**
- Se dispara cuando se crea una suscripción (como respaldo)
- Guarda el `subscription_id` en la base de datos
- Guarda los datos completos del test si están disponibles

**¿Cuándo se dispara?**
- Cuando se crea una nueva suscripción en Stripe
- Actúa como respaldo del evento `payment_intent.succeeded`

**Estado:** 🟡 **IMPORTANTE** - Respaldo para asegurar que se guarda el subscription_id

---

### 3. `customer.subscription.updated`
**¿Qué hace?**
- Se dispara cuando se actualiza una suscripción
- Detecta si la suscripción se marcó para cancelar al final del periodo
- Envía email de confirmación de cancelación programada

**¿Cuándo se dispara?**
- Cuando un usuario cancela su suscripción (se programa para cancelar al final del periodo)
- Cuando cambia el estado de la suscripción

**Estado:** 🟡 **IMPORTANTE** - Para manejar cancelaciones correctamente

---

### 4. `customer.subscription.deleted`
**¿Qué hace?**
- Se dispara cuando una suscripción es cancelada completamente
- Envía email de confirmación de cancelación
- Informa al usuario hasta cuándo tiene acceso

**¿Cuándo se dispara?**
- Cuando una suscripción es cancelada definitivamente

**Estado:** 🟡 **IMPORTANTE** - Para notificar cancelaciones

---

### 5. `invoice.payment_succeeded`
**¿Qué hace?**
- Se dispara cuando se cobra exitosamente una factura mensual
- Envía email de confirmación de pago mensual
- También envía email cuando se activa la suscripción después del trial

**¿Cuándo se dispara?**
- Cuando se cobra el pago mensual después del trial
- Cuando se crea la primera factura de suscripción

**Estado:** 🟡 **IMPORTANTE** - Para confirmar pagos mensuales

---

### 6. `invoice.payment_failed`
**¿Qué hace?**
- Se dispara cuando falla un intento de cobro
- Notifica al usuario del pago fallido
- Informa el número de intento

**¿Cuándo se dispara?**
- Cuando falla el cobro de una factura (tarjeta rechazada, fondos insuficientes, etc.)

**Estado:** 🟡 **IMPORTANTE** - Para notificar problemas de pago

---

### 7. `checkout.session.completed`
**¿Qué hace?**
- Se dispara cuando se completa una sesión de checkout (si usas Stripe Checkout)
- Actualmente solo registra el evento en logs

**¿Cuándo se dispara?**
- Cuando se completa una sesión de Stripe Checkout (si la usas)

**Estado:** 🟢 **OPCIONAL** - Solo si usas Stripe Checkout además del Payment Element

---

## 🚀 Cómo Configurar los Webhooks en Stripe

### Paso 1: Acceder a Stripe Dashboard
1. Ve a: https://dashboard.stripe.com
2. Inicia sesión con tu nueva cuenta
3. Asegúrate de estar en el modo correcto (TEST o LIVE)

### Paso 2: Crear el Endpoint de Webhook
1. Ve a: **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: 
   ```
   https://tu-dominio.com/api/webhook
   ```
   Ejemplo para Vercel:
   ```
   https://mindmetric.io/api/webhook
   ```
3. **Description**: `MindMetric - Webhooks principales`

### Paso 3: Seleccionar los Eventos
Selecciona estos **7 eventos**:

✅ `payment_intent.succeeded`
✅ `checkout.session.completed`
✅ `customer.subscription.created`
✅ `customer.subscription.updated`
✅ `customer.subscription.deleted`
✅ `invoice.payment_succeeded`
✅ `invoice.payment_failed`

### Paso 4: Guardar y Copiar el Webhook Secret
1. Click en **Add endpoint**
2. **IMPORTANTE**: Copia el **Signing secret** (empieza con `whsec_...`)
3. Guárdalo en un lugar seguro

### Paso 5: Configurar el Webhook Secret en tu Aplicación

#### Opción A: Variables de Entorno en Vercel
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Añade:
   - **TEST Mode:**
     ```
     STRIPE_WEBHOOK_SECRET=whsec_xxxxx (el secret de TEST)
     ```
   - **PRODUCTION Mode:**
     ```
     STRIPE_WEBHOOK_SECRET=whsec_xxxxx (el secret de LIVE)
     ```

#### Opción B: Base de Datos (Railway)
Si prefieres guardarlo en la base de datos:
1. Ve al panel de admin de tu aplicación
2. Configuración → Stripe
3. Añade:
   - `stripe_test_webhook_secret` = `whsec_xxxxx` (TEST)
   - `stripe_live_webhook_secret` = `whsec_xxxxx` (LIVE)

---

## 🔍 Verificar que los Webhooks Funcionan

### Método 1: Logs de Stripe
1. Ve a: **Developers** → **Webhooks**
2. Click en tu endpoint
3. Ve a la pestaña **Events**
4. Deberías ver eventos entrantes con estado `200 OK`

### Método 2: Logs de tu Aplicación
En Vercel, ve a **Deployments** → **Functions** → Busca `/api/webhook`
Deberías ver logs como:
```
📨 Webhook recibido: payment_intent.succeeded ID: evt_xxxxx
✅ PaymentIntent exitoso: { id: 'pi_xxxxx', amount: 100, ... }
🚀 [PAYMENT_INTENT] Creando suscripción automáticamente...
✅ [PAYMENT_INTENT] Suscripción creada exitosamente: sub_xxxxx
```

### Método 3: Probar Manualmente
1. Haz un pago de prueba de €1
2. Verifica en Stripe Dashboard que se creó la suscripción
3. Verifica en los logs que el webhook se recibió correctamente

---

## ⚠️ Problemas Comunes

### Error: "No signature"
**Causa:** El webhook secret no está configurado correctamente
**Solución:** Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado en Vercel o en la BD

### Error: "Invalid signature"
**Causa:** El webhook secret no coincide con el de Stripe
**Solución:** 
1. Ve a Stripe Dashboard → Webhooks → Tu endpoint
2. Click en "Reveal" para ver el secret actual
3. Actualiza el secret en Vercel/BD

### Webhooks no se reciben
**Causa:** La URL del webhook no es accesible públicamente
**Solución:** 
1. Verifica que tu dominio esté desplegado en Vercel
2. Verifica que la ruta `/api/webhook` existe
3. Prueba accediendo a `https://tu-dominio.com/api/webhook` (debería dar error 405 Method Not Allowed, pero significa que existe)

### Suscripciones no se crean automáticamente
**Causa:** El webhook `payment_intent.succeeded` no está configurado o no funciona
**Solución:**
1. Verifica que el evento esté seleccionado en Stripe
2. Verifica los logs del webhook
3. Verifica que el `priceId` esté configurado correctamente

---

## 📝 Resumen Rápido

**URL del Webhook:**
```
https://tu-dominio.com/api/webhook
```

**Eventos a Seleccionar (7):**
1. ✅ `payment_intent.succeeded` 🔴 CRÍTICO
2. ✅ `checkout.session.completed` 🟢 OPCIONAL
3. ✅ `customer.subscription.created` 🟡 IMPORTANTE
4. ✅ `customer.subscription.updated` 🟡 IMPORTANTE
5. ✅ `customer.subscription.deleted` 🟡 IMPORTANTE
6. ✅ `invoice.payment_succeeded` 🟡 IMPORTANTE
7. ✅ `invoice.payment_failed` 🟡 IMPORTANTE

**Webhook Secret:**
- Guardar como `STRIPE_WEBHOOK_SECRET` en Vercel
- O como `stripe_test_webhook_secret` / `stripe_live_webhook_secret` en BD

---

## 🎯 Checklist de Configuración

- [ ] Crear endpoint de webhook en Stripe Dashboard
- [ ] Seleccionar los 7 eventos requeridos
- [ ] Copiar el webhook secret
- [ ] Configurar `STRIPE_WEBHOOK_SECRET` en Vercel (o en BD)
- [ ] Hacer un pago de prueba
- [ ] Verificar que se crea la suscripción automáticamente
- [ ] Verificar los logs del webhook
- [ ] Repetir para modo TEST y LIVE (si aplica)

---

**Última actualización:** $(date)

