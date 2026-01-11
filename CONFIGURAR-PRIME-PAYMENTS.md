# 💳 Configuración de Prime Payments

Esta guía explica cómo configurar Prime Payments como pasarela de pagos para Mindmetric.

## 📋 Tabla de Contenidos

1. [Información del Proyecto](#información-del-proyecto)
2. [Variables de Entorno](#variables-de-entorno)
3. [URLs de Redirección](#urls-de-redirección)
4. [Webhook Configuration](#webhook-configuration)
5. [Credenciales](#credenciales)
6. [Configuración en Prime Payments Dashboard](#configuración-en-prime-payments-dashboard)
7. [Pruebas](#pruebas)

---

## 🏢 Información del Proyecto

**Nombre del proyecto:** Mindmetric

**URL del proyecto:** https://mindmetric.io/

**Estado:** ✅ Sitio verificado con archivo `primePayments.txt`

---

## 🔐 Variables de Entorno

Añade estas variables a tu archivo `.env.local` y a Vercel:

```bash
# Prime Payments Configuration
PRIME_PAYMENTS_SECRET_1=uRhEsH1uxa
PRIME_PAYMENTS_SECRET_2=EaJsSwmMCD
PRIME_PAYMENTS_API_KEY=fGwRDfKAKzwB
PRIME_PAYMENTS_PROJECT_NAME=Mindmetric
```

### Configurar en Vercel:

```bash
vercel env add PRIME_PAYMENTS_SECRET_1
# Pegar: uRhEsH1uxa

vercel env add PRIME_PAYMENTS_SECRET_2
# Pegar: EaJsSwmMCD

vercel env add PRIME_PAYMENTS_API_KEY
# Pegar: fGwRDfKAKzwB

vercel env add PRIME_PAYMENTS_PROJECT_NAME
# Pegar: Mindmetric
```

O desde el dashboard de Vercel:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade las variables una por una

---

## 🔀 URLs de Redirección

### ✅ URL de redirección después del pago exitoso:

**Para sistema multiidioma (RECOMENDADO):**
```
https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}
```

**Alternativas por idioma:**
- Español: `https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}`
- Inglés: `https://mindmetric.io/en/success?session_id={CHECKOUT_SESSION_ID}`
- Francés: `https://mindmetric.io/fr/success?session_id={CHECKOUT_SESSION_ID}`
- Alemán: `https://mindmetric.io/de/success?session_id={CHECKOUT_SESSION_ID}`
- Italiano: `https://mindmetric.io/it/success?session_id={CHECKOUT_SESSION_ID}`
- Portugués: `https://mindmetric.io/pt/success?session_id={CHECKOUT_SESSION_ID}`

**Para pago inicial del test:**
```
https://mindmetric.io/resultado?session_id={CHECKOUT_SESSION_ID}
```

### ❌ URL de redirección después de la cancelación del pago:

**Para sistema multiidioma (RECOMENDADO):**
```
https://mindmetric.io/es?canceled=true
```

**Para pago inicial del test:**
```
https://mindmetric.io/checkout
```

---

## 🪝 Webhook Configuration

### URL del script del controlador (Webhook URL):

```
https://mindmetric.io/api/prime-payments-webhook
```

### Archivo creado:

📁 `app/api/prime-payments-webhook/route.ts`

### Eventos que maneja el webhook:

- ✅ `payment.success` / `payment_success` - Pago exitoso
- ❌ `payment.failed` / `payment_failed` - Pago fallido
- ↩️ `payment.refunded` / `payment_refunded` - Pago reembolsado
- 🔄 `subscription.created` / `subscription_created` - Suscripción creada
- 🚫 `subscription.cancelled` / `subscription_cancelled` - Suscripción cancelada

### Seguridad del Webhook:

El webhook verifica la firma usando HMAC-SHA256 con las palabras secretas configuradas:
- Palabra secreta 1: `uRhEsH1uxa`
- Palabra secreta 2: `EaJsSwmMCD`

---

## 🔑 Credenciales

### Credenciales generadas por Prime Payments:

```
Palabra secreta 1: uRhEsH1uxa
Palabra secreta 2: EaJsSwmMCD
Clave de pago: fGwRDfKAKzwB
```

⚠️ **IMPORTANTE:** Estas credenciales son privadas. NO las compartas públicamente ni las subas a GitHub sin cifrar.

---

## ⚙️ Configuración en Prime Payments Dashboard

### Paso 1: Información Básica

1. **Nombre del proyecto:** `Mindmetric`
2. **URL del proyecto:** `https://mindmetric.io/`

### Paso 2: URLs de Redirección

3. **URL de redirección después del pago exitoso:**
   ```
   https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}
   ```
   
   ⚠️ **Nota:** Usa `{CHECKOUT_SESSION_ID}` como placeholder si Prime Payments lo soporta, o ajusta según su documentación.

4. **URL de redirección después de la cancelación del pago:**
   ```
   https://mindmetric.io/es?canceled=true
   ```

### Paso 3: Webhook

5. **URL del script del controlador:**
   ```
   https://mindmetric.io/api/prime-payments-webhook
   ```

### Paso 4: Configuración Avanzada

6. **Comisión sobre el pago:** `98% de usted, 2% del comprador`
   
7. **Pagos de pedidos:** `Cuenta personal + API`

8. **Comisión por pago:** `Comisión sobre el importe del pago`

9. **Notificaciones de pago por correo electrónico:** `No enviar por correo electrónico`

10. **Aceptación de criptomonedas:** `Desactivar recepción`

11. **Plantilla de formulario de pago:** `MODERNO`

### Paso 5: Guardar

12. Haz clic en **"Guardar cambios"**

---

## 🧪 Pruebas

### 1. Verificar que el webhook esté accesible:

```bash
curl -X POST https://mindmetric.io/api/prime-payments-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 2. Ver logs del webhook en Vercel:

```bash
vercel logs --follow
```

O desde el dashboard: https://vercel.com/dashboard → Tu proyecto → Logs

### 3. Realizar un pago de prueba:

1. Ve al dashboard de Prime Payments
2. Busca la opción de "Modo de prueba" o "Test mode"
3. Realiza un pago de prueba
4. Verifica que:
   - El pago se procese correctamente
   - Seas redirigido a la URL de éxito
   - El webhook reciba la notificación (revisa los logs)

### 4. Probar cancelación:

1. Inicia un proceso de pago
2. Cancela el pago antes de completarlo
3. Verifica que seas redirigido a la URL de cancelación

---

## 📊 Monitoreo

### Ver logs del webhook:

En Vercel:
```bash
vercel logs --filter "Prime Payments"
```

Busca estos mensajes:
- ✅ `Prime Payments webhook recibido`
- 💰 `Pago exitoso`
- ❌ `Pago fallido`
- ↩️ `Pago reembolsado`

### Logs importantes:

```javascript
// Pago exitoso
console.log('💰 Pago exitoso:', { amount, currency, email, transactionId })

// Pago fallido
console.log('❌ Pago fallido:', { reason, email, transactionId })

// Webhook signature inválida
console.error('❌ Prime Payments webhook: Firma inválida')
```

---

## 🔄 Integración con la Base de Datos

El webhook está preparado para integrarse con tu base de datos. Los TODOs marcados indican dónde añadir la lógica:

```typescript
// En handlePaymentSuccess()
// TODO: Actualizar base de datos con el pago exitoso
// TODO: Enviar email de confirmación
// TODO: Activar acceso al usuario

// En handleSubscriptionCreated()
// TODO: Activar suscripción en base de datos
// TODO: Enviar email de bienvenida
```

---

## 🆘 Troubleshooting

### Problema: Webhook no recibe notificaciones

**Solución:**
1. Verifica que la URL del webhook esté correctamente configurada en Prime Payments
2. Revisa los logs de Vercel para ver si llegan requests
3. Verifica que las palabras secretas sean correctas

### Problema: Firma del webhook inválida

**Solución:**
1. Verifica que `PRIME_PAYMENTS_SECRET_1` y `PRIME_PAYMENTS_SECRET_2` estén correctamente configuradas en Vercel
2. Revisa que Prime Payments esté enviando el header de firma correcto
3. Consulta la documentación de Prime Payments sobre el formato de la firma

### Problema: Redirecciones no funcionan

**Solución:**
1. Verifica que las URLs de redirección estén correctamente configuradas
2. Comprueba que las páginas de destino existan en tu aplicación
3. Revisa los logs del navegador para ver si hay errores

---

## 📚 Recursos Adicionales

- **Dashboard de Prime Payments:** [URL del dashboard]
- **Documentación oficial:** [Enlace a la documentación]
- **Soporte técnico:** [Email o chat de soporte]

---

## ✅ Checklist de Configuración

- [ ] Variables de entorno configuradas en Vercel
- [ ] Archivo `primePayments.txt` verificado
- [ ] URLs de redirección configuradas en Prime Payments
- [ ] Webhook URL configurada
- [ ] Credenciales guardadas de forma segura
- [ ] Pago de prueba realizado exitosamente
- [ ] Cancelación de pago probada
- [ ] Webhook recibiendo notificaciones correctamente
- [ ] Logs monitoreados en Vercel

---

## 📝 Notas Importantes

1. **Seguridad:** Nunca expongas las palabras secretas ni la clave de pago públicamente
2. **Multiidioma:** El sistema soporta múltiples idiomas en las URLs de redirección
3. **Webhooks:** Asegúrate de que el webhook responda rápidamente (< 5 segundos)
4. **Logs:** Mantén los logs activados para debug durante las primeras semanas
5. **Testing:** Siempre prueba en modo sandbox antes de activar en producción

---

**Última actualización:** Enero 2026
**Estado del proyecto:** ✅ En moderación en Prime Payments

