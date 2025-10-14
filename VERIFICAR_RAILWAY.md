# ✅ Verificación en Railway

## Variables de Entorno Necesarias

Ve a Railway Dashboard → Tu proyecto → Variables y asegúrate de tener:

```
STRIPE_SECRET_KEY=sk_live_... (o sk_test_... para pruebas)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (o pk_test_...)
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx ⭐ MUY IMPORTANTE
STRIPE_WEBHOOK_SECRET=whsec_... (opcional para desarrollo)
```

## ⚠️ LA VARIABLE MÁS IMPORTANTE: STRIPE_PRICE_ID

### Cómo Obtenerla:

1. **Ve a Stripe Dashboard:**
   - https://dashboard.stripe.com/products (Modo Live)
   - O https://dashboard.stripe.com/test/products (Modo Test)

2. **Busca o crea el producto de 19,99€:**
   - Si ya existe → Clic en el producto
   - Si NO existe → Clic en "Add product"
     - Name: "Premium Subscription"
     - Price: **19.99 EUR**
     - Billing: **Recurring** → **Monthly**

3. **Copia el Price ID:**
   - En la página del producto, busca el precio
   - Verás algo como: `price_1Abcd1234EfGh5678`
   - Cópialo completo

4. **Añádelo a Railway:**
   - Railway → Variables → Add Variable
   - Key: `STRIPE_PRICE_ID`
   - Value: `price_1Abcd1234EfGh5678`

## 🧪 Cómo Probar que Funciona

### Opción A: Prueba en Modo Test

1. Configura las claves de TEST en Railway:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_ID=price_... (del modo test)
   ```

2. Despliega en Railway

3. Ve a tu sitio web y haz una compra con tarjeta de prueba:
   - Tarjeta: `4242 4242 4242 4242`
   - Fecha: `12/28`
   - CVC: `123`

4. Verifica en Stripe Dashboard (modo test):
   - Ve a **Subscriptions**
   - Deberías ver una nueva suscripción con:
     - Status: `Trialing`
     - Trial ends: En 2 días
     - Amount: 19,99€

### Opción B: Ver Logs en Railway

1. Railway → Tu proyecto → Deployments → View logs

2. Después de hacer un pago, busca en los logs:
   ```
   ✅ Pago de €0.50 exitoso: pi_...
   📦 Creando suscripción con PaymentIntent ID: pi_...
   🔍 Recuperando PaymentIntent desde Stripe...
   ✅ Customer y Payment Method obtenidos correctamente
   🚀 Creando suscripción con trial de 2 días...
   ✅ Suscripción creada exitosamente: sub_...
   Estado: trialing
   ```

3. Si ves esto → ¡Funciona perfectamente! ✅

4. Si NO ves esto → Revisa que `STRIPE_PRICE_ID` esté configurado

## ❌ Errores Comunes

### Error: "Configuración de precio no encontrada"
→ Falta `STRIPE_PRICE_ID` en Railway

### Error: "No such price: price_xxx"
→ El `STRIPE_PRICE_ID` es incorrecto o está en otro modo (test vs live)

### La suscripción no se crea
→ Verifica los logs de Railway para ver el error exacto

## 🎯 Checklist Final

- [ ] Crear precio de 19,99€ en Stripe (si no existe)
- [ ] Copiar el Price ID
- [ ] Añadir `STRIPE_PRICE_ID` a Railway
- [ ] Redeploy en Railway (se hace automático)
- [ ] Hacer una compra de prueba
- [ ] Verificar en Stripe que la suscripción se creó
- [ ] Verificar que el status es "trialing"
- [ ] Verificar que el trial es de 2 días

## 📱 Contacto de Soporte

Si tienes problemas:
1. Revisa los logs de Railway
2. Verifica Stripe Dashboard
3. Asegúrate de que todas las variables están configuradas

