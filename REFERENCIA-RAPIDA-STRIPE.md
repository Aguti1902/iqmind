# ⚡ Referencia Rápida - Stripe en MindMetric

## 🔑 Variables de Entorno Necesarias

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # o pk_live_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx                    # o sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Price IDs (crear en Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL=price_xxxxx    # €9.99 cada 2 semanas
NEXT_PUBLIC_STRIPE_PRICE_MENSUAL=price_yyyyy      # €19.99 al mes

# Email (opcional)
SENDGRID_API_KEY=SG.xxxxx

# Base de datos
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secreto_jwt
```

---

## 🎯 Flujos de Pago

### 1. Pago Único (€0.50 - Desbloquear Resultado)

**Archivo**: `app/api/create-payment-intent/route.ts`

```typescript
// YA IMPLEMENTADO ✅
// Monto: 50 (€0.50 en céntimos)
// No requiere productos en Stripe Dashboard
```

**Webhook**: `payment_intent.succeeded`
- Desbloquea el resultado del test
- Envía email con el resultado completo

---

### 2. Suscripción Quincenal (€9.99)

**Archivo**: `app/api/create-subscription-session/route.ts`

```typescript
// NUEVO - USA ESTE ✅
POST /api/create-subscription-session
{
  "priceId": process.env.NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL,
  "userEmail": "user@example.com",
  "lang": "es"
}
```

**Webhook**: `checkout.session.completed`
- Activa la suscripción en BD
- Envía email de bienvenida premium

---

### 3. Suscripción Mensual (€19.99)

**Archivo**: `app/api/create-subscription-session/route.ts`

```typescript
// NUEVO - USA ESTE ✅
POST /api/create-subscription-session
{
  "priceId": process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSUAL,
  "userEmail": "user@example.com",
  "lang": "es"
}
```

**Webhook**: `checkout.session.completed`
- Activa la suscripción en BD
- Envía email de bienvenida premium

---

## 🔔 Eventos de Webhook

| Evento | Cuándo Ocurre | Acción en tu App |
|--------|---------------|------------------|
| `payment_intent.succeeded` | Pago de €0.50 completado | Desbloquear resultado |
| `checkout.session.completed` | Suscripción creada | Activar premium |
| `customer.subscription.updated` | Cambio en suscripción | Actualizar estado |
| `invoice.payment_succeeded` | Pago recurrente OK | Extender suscripción + Email |
| `invoice.payment_failed` | Pago recurrente falla | Email de aviso |
| `customer.subscription.deleted` | Usuario cancela | Desactivar premium + Email |
| `invoice.upcoming` | 3 días antes de cobrar | (Opcional) Email recordatorio |

---

## 🛠️ Comandos Útiles

### Testing Local con Stripe CLI

```bash
# Instalar (macOS)
brew install stripe/stripe-cli/stripe

# Autenticar
stripe login

# Escuchar webhooks (copia el whsec_... que aparece)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Probar eventos
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

---

## 💳 Tarjetas de Prueba

```bash
# Pago exitoso
4242 4242 4242 4242

# Pago rechazado
4000 0000 0000 0002

# Requiere autenticación 3D Secure
4000 0025 0000 3155

# Fecha: 12/34 | CVC: 123 | ZIP: 28001
```

---

## 📍 URLs Importantes

### Stripe Dashboard
- **Test Mode**: https://dashboard.stripe.com/test
- **Live Mode**: https://dashboard.stripe.com
- **API Keys**: https://dashboard.stripe.com/test/apikeys
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Products**: https://dashboard.stripe.com/test/products
- **Payments**: https://dashboard.stripe.com/test/payments
- **Subscriptions**: https://dashboard.stripe.com/test/subscriptions
- **Logs**: https://dashboard.stripe.com/test/logs

### Tu Aplicación
- **Checkout (€0.50)**: `/[lang]/checkout`
- **Resultado**: `/[lang]/resultado`
- **Success**: `/[lang]/success`
- **Cuenta**: `/[lang]/cuenta`
- **Webhook**: `/api/webhooks/stripe`

---

## 🔍 Debugging Rápido

### Ver Logs de Stripe
```bash
# Dashboard → Logs
https://dashboard.stripe.com/test/logs

# Dashboard → Webhooks → [tu webhook] → Logs
https://dashboard.stripe.com/test/webhooks/we_xxxxx
```

### Ver Logs de Vercel
```bash
vercel logs tu-proyecto-mindmetric --follow
```

### Verificar Webhook Localmente
```bash
# Terminal 1: App
npm run dev

# Terminal 2: Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger evento
stripe trigger payment_intent.succeeded
```

---

## ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `No signatures found` | Webhook secret incorrecto | Verifica `STRIPE_WEBHOOK_SECRET` |
| `Invalid API Key` | Clave incorrecta o modo equivocado | Verifica test vs live mode |
| `Payment requires authentication` | 3D Secure requerido | Normal, usa `automatic_payment_methods` |
| `Webhook endpoint returned 500` | Error en tu código | Verifica logs y base de datos |
| Suscripción no se activa | Webhook no configurado | Verifica eventos seleccionados |

---

## 📋 Checklist de Producción

### Antes de Lanzar
- [ ] Cuenta Stripe activada (completar onboarding)
- [ ] Información bancaria proporcionada
- [ ] Productos creados en modo **Live**
- [ ] Price IDs **Live** copiados
- [ ] Claves **Live** en Vercel (`pk_live_...`, `sk_live_...`)
- [ ] Webhook de producción configurado (URL HTTPS)
- [ ] Webhook secret **Live** en Vercel
- [ ] SendGrid API key configurada
- [ ] Sender de email verificado
- [ ] Pago de prueba en producción exitoso
- [ ] Suscripción de prueba en producción exitosa

### Después de Lanzar
- [ ] Monitorear dashboard de Stripe diariamente
- [ ] Verificar que webhooks se ejecutan (99% success rate)
- [ ] Revisar disputas o chargebacks
- [ ] Verificar que emails se envían correctamente
- [ ] Revisar logs de errores en Vercel

---

## 📞 Contacto de Emergencia

### Si algo falla en producción:

1. **Ver logs de Stripe**: https://dashboard.stripe.com/logs
2. **Ver logs de webhooks**: https://dashboard.stripe.com/webhooks
3. **Ver logs de Vercel**: En el dashboard de Vercel
4. **Contactar a Stripe**: https://support.stripe.com (responden en minutos)

### Desactivar webhooks temporalmente:
1. Ve a https://dashboard.stripe.com/webhooks
2. Click en tu webhook
3. Click en los 3 puntos → **Disable**

---

## 🎯 Precios Actuales

| Plan | Precio | Periodo | Price ID Variable |
|------|--------|---------|-------------------|
| Trial | €0.50 | Pago único | (no requiere Price ID) |
| Quincenal | €9.99 | Cada 2 semanas | `NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL` |
| Mensual | €19.99 | Mensual | `NEXT_PUBLIC_STRIPE_PRICE_MENSUAL` |

---

## 🚀 Próximos Pasos

### Opcional - Mejoras Futuras
- [ ] Añadir cupones de descuento (promociones)
- [ ] Implementar período de gracia para pagos fallidos
- [ ] Dashboard de métricas (MRR, churn, etc)
- [ ] Notificaciones push para pagos
- [ ] Facturación automática (PDF invoices)
- [ ] Cambio de plan (upgrade/downgrade)

---

**Documentación completa**: Ver `CONFIGURACION-STRIPE.md`

**Guía paso a paso**: Ver `GUIA-STRIPE-PASO-A-PASO.md`

