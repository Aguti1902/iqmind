# 🚀 Pasos Rápidos de Verificación

## ✅ Problema Solucionado

El pago de 0,50€ ahora **SÍ crea automáticamente una suscripción** de 19,99€/mes con trial de 2 días.

---

## 📋 Pasos Para Verificar

### 1. Verificar Configuración de Stripe

Ejecuta el script de verificación:

```bash
npm run verify-stripe
```

Este script verificará:
- ✅ Que todas las variables de Stripe estén configuradas
- ✅ Que el `STRIPE_PRICE_ID` sea válido
- ✅ Que el precio sea 19,99€ mensual
- ✅ Conexión con Stripe

### 2. Si Falta el STRIPE_PRICE_ID

**Opción A: Crear el precio en Stripe Dashboard**

1. Ve a https://dashboard.stripe.com/test/products
2. Clic en "Add Product"
3. Rellena:
   - **Name**: "Premium Subscription"
   - **Description**: "Suscripción mensual premium"
4. En la sección de pricing:
   - **Price**: 19.99 EUR
   - **Billing Period**: Monthly
   - **Recurring**: Yes
5. Clic en "Save product"
6. **Copia el Price ID** (empieza con `price_`)

**Opción B: Crear el precio con Stripe CLI**

```bash
stripe prices create \
  --product-data[name]="Premium Subscription" \
  --unit-amount=1999 \
  --currency=eur \
  --recurring[interval]=month
```

### 3. Añadir a .env.local

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```bash
# Claves de Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ID del precio de 19.99€ (NUEVO - IMPORTANTE)
STRIPE_PRICE_ID=price_XXXXXXXXXX

# Webhook secret (para producción)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Reiniciar el Servidor

```bash
npm run dev
```

### 5. Probar el Flujo Completo

1. **Completa el test de IQ**
   - Ve a: http://localhost:3000/es/test
   - Responde todas las preguntas

2. **Ve a Checkout**
   - Ingresa tu email de prueba
   - Usa tarjeta de Stripe de prueba:
     - Número: `4242 4242 4242 4242`
     - Fecha: cualquier fecha futura
     - CVC: cualquier 3 dígitos

3. **Paga 0,50€**
   - Observa la consola del servidor

4. **Verificar en logs**
   
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
   ```

5. **Verificar en Stripe Dashboard**
   
   - Ve a https://dashboard.stripe.com/test/subscriptions
   - Deberías ver la nueva suscripción:
     - Status: `Trialing`
     - Trial ends: En 2 días
     - Amount: 19,99€

---

## 🔍 Verificación en Stripe Dashboard

### Customers
- Deberías ver el email del usuario
- Tiene un payment method guardado
- Tiene una suscripción activa

### Subscriptions
- **Estado**: `trialing` (en prueba)
- **Trial ends**: Fecha de dentro de 2 días
- **Próximo cobro**: 19,99€ en 2 días
- **Intervalo**: Monthly (Mensual)

### Payments
- Pago de 0,50€ completado exitosamente

---

## ⚠️ Solución de Problemas

### Error: "Stripe no configurado"
→ Falta `STRIPE_SECRET_KEY` en `.env.local`

### Error: "Configuración de precio no encontrada"
→ Falta `STRIPE_PRICE_ID` en `.env.local`

### Error: "No se pudo obtener el customer o payment method"
→ El PaymentIntent no tiene asociado un customer (poco probable, verificar logs)

### La suscripción no se crea
1. Verifica que `STRIPE_PRICE_ID` existe en Stripe
2. Verifica que el precio esté activo
3. Revisa los logs del servidor con detalle
4. Ejecuta `npm run verify-stripe`

### El precio no es 19,99€
→ Verifica en Stripe Dashboard que el precio configurado sea correcto

---

## 📱 Pruebas Adicionales

### Tarjetas de Prueba de Stripe

```
Éxito:
4242 4242 4242 4242

Pago rechazado:
4000 0000 0000 0002

Requiere autenticación:
4000 0027 6000 3184

Fondos insuficientes:
4000 0000 0000 9995
```

### Webhooks en Desarrollo

Para probar webhooks localmente:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Reenviar webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhook
```

---

## ✅ Checklist Final

- [ ] `STRIPE_PRICE_ID` configurado en `.env.local`
- [ ] Script `npm run verify-stripe` pasa exitosamente
- [ ] Pago de 0,50€ funciona
- [ ] Suscripción se crea automáticamente
- [ ] Suscripción aparece en Stripe Dashboard
- [ ] Estado es "trialing"
- [ ] Trial de 2 días configurado
- [ ] Precio de 19,99€ configurado

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, el sistema funcionará así:

1. Usuario paga **0,50€** → accede a resultados
2. Se crea automáticamente una **suscripción de 19,99€/mes**
3. Usuario tiene **2 días de trial GRATIS**
4. Después de 2 días → se cobra **19,99€** automáticamente
5. Usuario puede **cancelar en cualquier momento** durante el trial

---

## 📚 Documentación Adicional

- Ver: `SOLUCION_SUSCRIPCION.md` para detalles técnicos completos
- Stripe Docs: https://stripe.com/docs/billing/subscriptions/trials

