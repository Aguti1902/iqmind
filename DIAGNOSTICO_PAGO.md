# 🔍 DIAGNÓSTICO DE PAGO - mindmetric2025@gmail.com

## 1. ✅ Verificar si el usuario existe en la base de datos

Accede a esta URL en tu navegador:
```
https://www.mindmetric.io/api/debug-user?email=mindmetric2025@gmail.com
```

**Resultado esperado:**
- Si el usuario existe: Verás sus datos (email, IQ, fecha de creación)
- Si NO existe: Verás "Usuario no encontrado"

---

## 2. 📋 Verificar logs de Vercel

1. Ve a: https://vercel.com/[tu-cuenta]/mindmetric/logs
2. Filtra por: `mindmetric2025@gmail.com`
3. Busca estos mensajes:

### Mensajes que DEBES ver si todo funcionó:
```
✅ PaymentIntent exitoso: { email: "mindmetric2025@gmail.com" }
👤 Usuario creado/actualizado: mindmetric2025@gmail.com
🔑 Contraseña generada: [password]
📧 Enviando email a: mindmetric2025@gmail.com
✅ Email enviado a mindmetric2025@gmail.com
```

### Si NO ves estos mensajes:
- ❌ **El webhook NO se ejecutó** → Problema con Stripe
- ⚠️ **Solo ves "PaymentIntent exitoso"** → El webhook se ejecutó pero el email falló

---

## 3. 🔍 Verificar webhook en Stripe

1. Ve a: https://dashboard.stripe.com/webhooks
2. Busca tu webhook de producción
3. Haz clic en "Events" o "Eventos"
4. Busca el evento más reciente con el email `mindmetric2025@gmail.com`
5. Verifica:
   - ✅ Estado del evento (succeeded/failed)
   - ✅ Si se envió el webhook a tu servidor
   - ✅ Response code (200 = éxito, 500 = error)

---

## 4. 🔧 POSIBLES PROBLEMAS Y SOLUCIONES

### Problema A: Usuario NO existe en la base de datos
**Causa:** El webhook no se ejecutó o falló
**Solución:**
1. Verifica en Stripe que el webhook esté configurado
2. URL del webhook debe ser: `https://www.mindmetric.io/api/webhook`
3. Debe estar escuchando: `payment_intent.succeeded`

### Problema B: Usuario existe pero NO recibió email
**Causa:** SendGrid falló o el email está en spam
**Solución:**
1. Verifica la bandeja de SPAM de `mindmetric2025@gmail.com`
2. Verifica en SendGrid: https://app.sendgrid.com/email_activity
3. Busca por `mindmetric2025@gmail.com` y mira el estado

### Problema C: Lang no se guardó correctamente
**Causa:** El idioma no se pasó en el checkout
**Verificación:**
1. En Vercel logs, busca: `lang: sv` o `lang: undefined`
2. Si es `undefined`, el problema está en el frontend

---

## 5. 🚨 SOLUCIÓN TEMPORAL: Reenviar email manualmente

Si el usuario existe pero no recibió el email, puedes usar este endpoint:

```bash
curl -X POST https://www.mindmetric.io/api/resend-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email": "mindmetric2025@gmail.com"}'
```

---

## 6. 📊 Resultado del diagnóstico

Por favor, completa esta información:

- [ ] Usuario existe en BD: SÍ / NO
- [ ] Webhook se ejecutó en Stripe: SÍ / NO
- [ ] Email aparece en SendGrid: SÍ / NO
- [ ] Email está en SPAM: SÍ / NO
- [ ] Lang guardado correctamente: SÍ / NO / UNDEFINED

---

## 7. 🛠️ ACCIONES INMEDIATAS

### Si el usuario NO existe:
```bash
# Crear usuario manualmente
curl -X POST https://www.mindmetric.io/api/create-user-manual \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mindmetric2025@gmail.com",
    "userName": "Usuario",
    "password": "TempPass123!",
    "iq": 120,
    "lang": "sv"
  }'
```

### Si el usuario existe pero sin contraseña:
```bash
# Resetear contraseña
curl -X POST https://www.mindmetric.io/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mindmetric2025@gmail.com",
    "lang": "sv"
  }'
```

---

## 8. ⚙️ VERIFICACIÓN FINAL

Después de aplicar cualquier solución, verifica:

1. ✅ Usuario puede hacer login: https://www.mindmetric.io/sv/login
2. ✅ Email: mindmetric2025@gmail.com
3. ✅ Contraseña: [la que se generó o reseteó]
4. ✅ Dashboard muestra el resultado del test

---

**NOTA:** Comparte conmigo los resultados de los pasos 1 y 2 para diagnosticar exactamente qué falló.

