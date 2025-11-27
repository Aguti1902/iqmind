# 🍎 Solución Final para Apple Pay

## Opción 1: Verificar Errores en Consola (Primero)

1. Abre Safari en iPhone
2. Conecta al Mac o activa Inspector Web
3. Ve a la consola
4. Busca errores de Stripe/Apple Pay
5. Comparte los errores

## Opción 2: Cambiar a Stripe Checkout (Si nada funciona)

Stripe Checkout es más simple y siempre muestra Apple Pay cuando está disponible.

### Ventajas:
- ✅ Apple Pay funciona 100% del tiempo
- ✅ No requiere configuración de Payment Element
- ✅ Stripe maneja toda la UI
- ✅ Menos código

### Desventajas:
- ❌ Redirige a una página de Stripe (no es in-page)
- ❌ Menos personalizable

### Implementación:

**Backend:** Crear Checkout Session
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'IQ Test Result Unlock',
      },
      unit_amount: 50, // 0.50€
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://mindmetric.io/es/resultado',
  cancel_url: 'https://mindmetric.io/es/checkout',
  customer_email: email,
  metadata: {
    userIQ,
    userName,
  },
});

return NextResponse.json({ url: session.url });
```

**Frontend:** Redirigir a Checkout
```typescript
const response = await fetch('/api/create-checkout-session', {
  method: 'POST',
  body: JSON.stringify({ email, userIQ, userName })
});
const { url } = await response.json();
window.location.href = url;
```

## Opción 3: Contactar Soporte de Stripe

Si nada funciona, contacta directamente:

1. Ve a: https://dashboard.stripe.com/
2. Clic en chat (abajo a la derecha)
3. Diles:

```
Mi dominio mindmetric.io está verificado para Apple Pay 
(ID: pmd_1SIFYFCMVuDiKeMPEPCE4lqI).

Apple Pay está activado en Payment Methods.

Uso Payment Element con automatic_payment_methods: { enabled: true }.

Pero Apple Pay no aparece en el checkout en Safari iOS.

¿Qué configuración falta en mi cuenta?
```

Ellos revisarán tu cuenta directamente y te dirán exactamente qué falta.

## Diagnóstico de Problemas Comunes

### Problema: "Apple Pay is not available"
**Causa:** Dominio no verificado o certificados faltantes
**Solución:** Verifica dominio en Stripe Dashboard

### Problema: "Payment method not available"
**Causa:** Apple Pay no activado en Payment Methods
**Solución:** Activa toggle en Settings → Payment Methods

### Problema: "Domain not registered"
**Causa:** Dominio no agregado en Payment Method Domains
**Solución:** Agrega dominio en Settings → Payment Method Domains

### Problema: Sin errores pero Apple Pay no aparece
**Causa:** Heurísticas de Stripe ocultando el método
**Solución:** Usa Stripe Checkout o contacta soporte

