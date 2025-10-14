# 🔍 Diagnóstico: Suscripción No Se Crea

## Problema Actual

✅ El pago de 0,50€ funciona correctamente
❌ La suscripción NO se crea después del pago
❌ No aparece el trial de 2 días en Stripe

---

## 📋 Pasos de Diagnóstico

### Paso 1: Verificar Configuración del Servidor

Abre esta URL en tu navegador (reemplaza con tu dominio):

```
https://tu-dominio.com/api/check-config
```

**Deberías ver algo como:**
```json
{
  "status": "ok",
  "config": {
    "hasStripeSecretKey": true,
    "hasPublishableKey": true,
    "hasPriceId": true,     ← DEBE SER true
    "stripeInitialized": true
  },
  "priceDetails": {
    "id": "price_xxxxx",
    "active": true,         ← DEBE SER true
    "amount": 1999,         ← DEBE SER 1999 (19.99€)
    "amountFormatted": "19.99 EUR"
  },
  "errors": [],
  "warnings": []
}
```

**Si ves errores:**

#### Error: "STRIPE_PRICE_ID no está configurado"
→ **SOLUCIÓN**: Añadir `STRIPE_PRICE_ID` en Railway

1. Ve a Railway → Tu proyecto → Variables
2. Añade nueva variable:
   - Key: `STRIPE_PRICE_ID`
   - Value: `price_xxxxxxxxxxxxx` (copia de Stripe Dashboard)
3. Redeploy automático
4. Espera 1-2 minutos
5. Vuelve a verificar `/api/check-config`

#### Error: "Error al verificar precio: No such price"
→ **SOLUCIÓN**: El Price ID es incorrecto o está en otro modo (test vs live)

1. Ve a Stripe Dashboard
2. Asegúrate de estar en el modo correcto (Test o Live)
3. Ve a Products → Tu producto
4. Copia el Price ID exacto
5. Actualiza en Railway
6. Redeploy

---

### Paso 2: Hacer una Compra de Prueba CON DEBUG

He añadido alertas de debug al código. Ahora cuando hagas un pago verás:

**✅ SI FUNCIONA:**
```
ALERTA: ✅ SUSCRIPCIÓN CREADA EXITOSAMENTE!

ID: sub_xxxxx
Status: trialing

Revisa Stripe Dashboard para confirmar.
```

**❌ SI FALLA:**
```
ALERTA: ⚠️ ERROR CREANDO SUSCRIPCIÓN:
[mensaje de error]

Revisa la consola del navegador para más detalles.
```

---

### Paso 3: Revisar Consola del Navegador

Después de hacer el pago, abre la consola del navegador (F12) y busca:

**Logs que deberías ver:**

```javascript
✅ Pago de €0.50 exitoso: pi_xxxxx
📋 PaymentIntent completo: {...}
📦 Creando suscripción con PaymentIntent ID: pi_xxxxx
📧 Email: usuario@ejemplo.com
👤 User Name: Nombre Usuario
📡 Status de respuesta: 200
📡 Status OK: true
📥 Respuesta COMPLETA de create-subscription: {
  "subscriptionId": "sub_xxxxx",
  "status": "trialing",
  "trialEnd": 1234567890
}
✅ Suscripción creada exitosamente: {...}
🆔 Subscription ID: sub_xxxxx
📅 Trial End: 1234567890
```

**Si ves errores en la consola:**

#### Error 500: "Stripe no configurado"
→ Falta `STRIPE_SECRET_KEY` en Railway

#### Error 500: "Configuración de precio no encontrada"
→ Falta `STRIPE_PRICE_ID` en Railway

#### Error 400: "No such price: price_xxx"
→ El `STRIPE_PRICE_ID` es incorrecto o estás mezclando modos test/live

#### Error: "Customer ID y Payment Method ID requeridos"
→ El PaymentIntent no tiene asociado un customer (problema de código)

---

### Paso 4: Revisar Logs del Servidor (Railway)

1. Ve a Railway → Tu proyecto → Deployments
2. Clic en el deployment actual
3. Clic en "View logs"
4. Haz scroll hasta encontrar logs después de tu pago

**Busca esto:**

```
=== INICIO CREAR SUSCRIPCIÓN ===
Body recibido: { email: '...', userName: '...', paymentIntentId: 'pi_...' }
🔍 Recuperando PaymentIntent desde Stripe...
📋 PaymentIntent recuperado: { id: 'pi_...', status: 'succeeded', ... }
✅ Customer y Payment Method obtenidos correctamente
🚀 Creando suscripción con trial de 2 días...
Price ID: price_xxxxx
✅ Suscripción creada exitosamente: sub_xxxxx
Estado: trialing
Trial end: 2025-10-17T...
```

**Si ves errores:**

#### "❌ STRIPE_PRICE_ID no configurado"
→ Añade la variable en Railway

#### "❌ PaymentIntent no tiene customer o payment_method"
→ Problema con el PaymentIntent. Verifica que se esté creando correctamente.

#### "StripeInvalidRequestError: No such price"
→ El Price ID es incorrecto

---

## 🛠️ Soluciones Comunes

### Solución 1: Añadir STRIPE_PRICE_ID

**En Railway:**

1. Dashboard → Tu proyecto
2. Tab "Variables"
3. Clic en "New Variable"
4. Key: `STRIPE_PRICE_ID`
5. Value: Pega el ID de Stripe (empieza con `price_`)
6. Clic "Add"
7. Espera el redeploy automático (1-2 minutos)

**Cómo obtener el Price ID:**

1. https://dashboard.stripe.com/products (o /test/products)
2. Clic en tu producto de 19.99€
3. En la sección de pricing, busca "API ID"
4. Copia el ID completo: `price_1Abcd1234EfGh5678`

---

### Solución 2: Crear el Precio en Stripe

Si no tienes un producto de 19.99€:

1. https://dashboard.stripe.com/products
2. Clic "Add product"
3. Rellena:
   - **Name**: "Premium Subscription"
   - **Description**: "Suscripción mensual premium"
   - **Price**: 19.99
   - **Currency**: EUR
   - **Billing period**: Recurring
   - **Interval**: Monthly
4. Clic "Save product"
5. Copia el Price ID que se genera
6. Añádelo a Railway

---

### Solución 3: Verificar Modo Test vs Live

**Problema**: Estás usando claves de test pero el Price ID es de live (o viceversa)

**Solución**:

1. Verifica qué claves tienes en Railway:
   - `sk_test_...` = Modo Test
   - `sk_live_...` = Modo Live

2. Ve al mismo modo en Stripe Dashboard

3. Copia el Price ID del modo correcto

4. Actualiza en Railway

---

## ✅ Checklist de Verificación

- [ ] `/api/check-config` muestra `hasPriceId: true`
- [ ] `/api/check-config` muestra `priceDetails` con 19.99 EUR
- [ ] `/api/check-config` NO muestra errores
- [ ] Al hacer un pago, aparece alerta de éxito
- [ ] En consola del navegador se ve "✅ Suscripción creada"
- [ ] En logs de Railway se ve "✅ Suscripción creada exitosamente"
- [ ] En Stripe Dashboard aparece la suscripción
- [ ] La suscripción tiene status "trialing"
- [ ] El trial es de 2 días

---

## 📞 Próximos Pasos

1. **Abre** `/api/check-config` en tu navegador
2. **Captura** la respuesta completa
3. **Haz** una compra de prueba
4. **Captura** los logs de la consola del navegador
5. **Captura** los logs de Railway
6. **Comparte** toda esta información si necesitas más ayuda

---

## 🎯 Resultado Esperado

Después de seguir estos pasos, deberías ver:

1. ✅ Pago de 0,50€ completado
2. ✅ Alerta de "Suscripción creada exitosamente"
3. ✅ En Stripe Dashboard: Nueva suscripción con status "trialing"
4. ✅ Trial de 2 días activo
5. ✅ Próximo cobro programado para 19,99€ en 2 días

---

## 💡 Tip Final

Si después de todo esto sigue sin funcionar, el problema más probable es que `STRIPE_PRICE_ID` no esté configurado o sea incorrecto. Verifica esto 3 veces:

1. ¿Está la variable en Railway?
2. ¿El ID es correcto? (cópialo de nuevo)
3. ¿Estás en el mismo modo (test/live) en Stripe y Railway?

