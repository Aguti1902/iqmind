# Solución al Problema de Suscripción

## Problema Original

Cuando el usuario pagaba 0,50€ para desbloquear los resultados, **NO se creaba automáticamente una suscripción** de 19,99€ con trial de 2 días. El pago se procesaba como un pago único sin conexión a una suscripción.

## Causa del Problema

El flujo anterior intentaba obtener el `customerId` y `paymentMethodId` desde el frontend después del pago, pero estos datos **no están disponibles directamente** en el objeto PaymentIntent del lado del cliente. El código hacía un `type assertion as any` para intentar acceder a propiedades que no existían.

## Solución Implementada

### 1. **Modificación del endpoint `/api/create-subscription`**

- **Antes**: Recibía `customerId` y `paymentMethodId` desde el frontend
- **Ahora**: Recibe solo `paymentIntentId` y obtiene el customer y payment method desde el **backend de Stripe**

**Ventajas:**
- ✅ Acceso seguro a toda la información del PaymentIntent
- ✅ No depende de datos del cliente que pueden no estar disponibles
- ✅ Verifica si ya existe una suscripción activa para evitar duplicados
- ✅ Mejor logging para debugging

### 2. **Actualización del flujo en `/app/[lang]/checkout/page.tsx`**

- **Antes**: Intentaba recuperar el PaymentIntent con `stripe.retrievePaymentIntent()` del cliente
- **Ahora**: Simplemente envía el `paymentIntentId` al backend

**Código simplificado:**
```typescript
const paymentIntentId = paymentIntent?.id
const subscriptionResponse = await fetch('/api/create-subscription', {
  method: 'POST',
  body: JSON.stringify({
    email,
    userName,
    paymentIntentId: paymentIntentId,
  }),
})
```

### 3. **Mejora del webhook `/api/webhook`**

Se añadieron manejadores para eventos importantes:
- `customer.subscription.created` - Cuando se crea la suscripción
- `customer.subscription.updated` - Cuando se actualiza (ej: cancelación programada)
- `customer.subscription.deleted` - Cuando se cancela definitivamente
- `customer.subscription.trial_will_end` - Recordatorio 3 días antes de que termine el trial
- `invoice.payment_succeeded` - Pago mensual exitoso
- `invoice.payment_failed` - Pago mensual fallido

## Flujo Completo Ahora

1. **Usuario completa el test** → Guarda IQ en localStorage
2. **Va a checkout** → Se crea un PaymentIntent de 0,50€
3. **Paga 0,50€** → Stripe procesa el pago
4. **Después del pago exitoso:**
   - Frontend obtiene el `paymentIntentId`
   - Llama a `/api/create-subscription` con el ID
   - Backend recupera el PaymentIntent completo desde Stripe
   - Obtiene `customerId` y `paymentMethodId` de forma segura
   - Crea una suscripción con:
     - Trial de 2 días GRATIS
     - Precio de 19,99€/mes
     - Se cobrará automáticamente después del trial
5. **Usuario puede cancelar** en cualquier momento durante el trial

## Configuración Necesaria

### Variables de Entorno Requeridas

Asegúrate de tener estas variables configuradas en tu `.env.local` y en Railway/Vercel:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ID del precio de 19.99€ (IMPORTANTE)
STRIPE_PRICE_ID=price_...

# Webhook Secret (para producción)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cómo Obtener el STRIPE_PRICE_ID

1. Ve a tu Dashboard de Stripe: https://dashboard.stripe.com/
2. Navega a **Products** (Productos)
3. Busca o crea un producto de **19,99€/mes**
4. Copia el **Price ID** que empieza con `price_...`
5. Añádelo a tus variables de entorno

### Configurar el Precio en Stripe

Si aún no tienes el precio creado:

1. **Crear Producto:**
   - Nombre: "Premium IQ Test Subscription" (o el que prefieras)
   - Descripción: "Suscripción mensual premium"

2. **Crear Precio:**
   - Monto: **19,99 EUR**
   - Tipo de facturación: **Recurring (Recurrente)**
   - Frecuencia: **Monthly (Mensual)**
   - Copia el Price ID generado

## Verificación del Flujo

### En Modo Test (Desarrollo)

1. Usa una tarjeta de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

2. Realiza un pago de 0,50€

3. Verifica en los logs del servidor que veas:
   ```
   ✅ Pago de €0.50 exitoso: pi_...
   🔍 Recuperando PaymentIntent desde Stripe...
   ✅ Customer y Payment Method obtenidos correctamente
   🚀 Creando suscripción con trial de 2 días...
   ✅ Suscripción creada exitosamente: sub_...
   ```

4. Verifica en Stripe Dashboard:
   - Ve a **Customers** → deberías ver el nuevo customer
   - Ve a **Subscriptions** → deberías ver la suscripción en estado `trialing`

### Verificar en Stripe Dashboard

1. **Ir a Customers:**
   - Deberías ver el email del usuario
   - Ver que tiene un payment method guardado
   - Ver que tiene una suscripción activa

2. **Ir a Subscriptions:**
   - Estado: `trialing` (en prueba)
   - Trial ends: Fecha de dentro de 2 días
   - Próximo cobro: 19,99€ en 2 días

3. **Ir a Payments:**
   - Deberías ver el pago de 0,50€ completado

## Pruebas a Realizar

- [ ] Pagar 0,50€ y verificar que se crea la suscripción
- [ ] Verificar en Stripe Dashboard que la suscripción existe
- [ ] Verificar que el trial es de 2 días
- [ ] Verificar que el precio configurado es 19,99€
- [ ] Intentar pagar de nuevo con el mismo email (debería detectar suscripción existente)
- [ ] Cancelar la suscripción desde el panel de usuario
- [ ] Verificar los webhooks en producción

## Webhooks en Producción

Para que los webhooks funcionen en producción:

1. **Configurar endpoint en Stripe:**
   - URL: `https://tu-dominio.com/api/webhook`
   - Eventos a escuchar:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.trial_will_end`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Obtener Webhook Secret:**
   - Stripe te dará un secret que empieza con `whsec_...`
   - Añádelo a tu variable de entorno `STRIPE_WEBHOOK_SECRET`

## Notas Importantes

⚠️ **El trial de 2 días es GRATIS**: El usuario solo paga 0,50€ inicialmente. Después de 2 días, si no cancela, se le cobrará automáticamente 19,99€.

⚠️ **Cancelación del trial**: Los usuarios pueden cancelar en cualquier momento durante los 2 días sin cargo adicional.

⚠️ **Verificar STRIPE_PRICE_ID**: Es CRÍTICO que esta variable esté configurada correctamente, de lo contrario la suscripción no se creará.

## Siguiente Paso

1. ✅ Verificar que `STRIPE_PRICE_ID` esté configurado
2. ✅ Hacer una prueba de pago completo
3. ✅ Verificar en Stripe Dashboard que todo se creó correctamente
4. ✅ Configurar webhooks en producción
5. ✅ Implementar la base de datos para guardar las suscripciones (opcional pero recomendado)

