# Crear Producto en Stripe Dashboard

## Si quieres probar con un producto predefinido:

### 1. Ve a Stripe Dashboard:
https://dashboard.stripe.com/products

### 2. Clic en "Add product"

### 3. Completa:
- **Name:** IQ Test Result
- **Description:** Unlock IQ test results + 2-day premium trial
- **Price:** 0.50 EUR
- **Recurring:** No (one-time payment)

### 4. Copia el Price ID
Verás algo como: `price_1ABC123xyz`

### 5. Si quieres usar este en lugar del dinámico:

Edita: `app/api/create-checkout-session/route.ts`

Cambia de:
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 50,
  ...
})
```

A:
```typescript
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price: 'price_1ABC123xyz', // El Price ID que copiaste
    quantity: 1,
  }],
  mode: 'payment',
  ...
})
```

---

## PERO ESTO NO SOLUCIONARÁ EL PROBLEMA DE APPLE PAY

Porque el problema NO es el producto/precio.
El problema son los **certificados de iOS** que faltan en tu cuenta de Stripe.

Sin certificados → Sin Apple Pay
Con certificados → Con Apple Pay

Independientemente de si usas productos predefinidos o payment intents dinámicos.

