# 🍎 Apple Pay - Guía de Diagnóstico Completa

## ✅ Checklist de Requisitos

### 1. Verificación del Dominio

**URL para probar:**
- https://iqmind.io/api/apple-pay-domain-association
- https://iqmind.io/.well-known/apple-developer-merchantid-domain-association

**Debe mostrar:** Una cadena larga de texto hexadecimal que empieza con `7B227073644964...`

**Si da 404:**
- Espera 5 minutos después del último deploy
- Limpia caché del navegador (Ctrl+Shift+R)
- Verifica que el deploy de Vercel haya terminado

---

### 2. Configuración en Stripe Dashboard

**Pasos:**

1. Ve a: https://dashboard.stripe.com/settings/payment_methods

2. Busca la sección **"Wallets"** o **"Apple Pay"**

3. Verifica:
   - [ ] ¿Está habilitado el toggle de Apple Pay?
   - [ ] ¿Aparece `iqmind.io` en la lista de dominios?
   - [ ] ¿Estado del dominio? (debe ser **"Verified"** ✅)

4. Si no está:
   - Clic en **"Add domain"**
   - Ingresa: `iqmind.io` (sin https://, sin www)
   - Clic en **"Add"**
   - Espera 1-2 minutos
   - Recarga la página

5. Si aparece como **"Pending"** o **"Failed"**:
   - Clic en **"Retry"** o icono de recargar
   - Verifica que el archivo de verificación sea accesible
   - Espera otros 2-3 minutos

---

### 3. Requisitos del Dispositivo

**Apple Pay solo funciona en:**

✅ **Safari en iOS/iPadOS:**
- iPhone con iOS 10 o superior
- iPad con iPadOS
- Con Apple Pay configurado en Wallet

✅ **Safari en macOS:**
- Mac con macOS Sierra o superior
- Con Apple Pay configurado
- O con Touch ID
- O con iPhone cerca con continuidad

❌ **NO funciona en:**
- Chrome en Mac/iPhone
- Firefox
- Edge
- Cualquier navegador que no sea Safari
- Android

---

### 4. Configuración de Apple Pay en el Dispositivo

**En iPhone/iPad:**
1. Ajustes → Wallet y Apple Pay
2. Debe tener al menos una tarjeta configurada
3. Verifica que Apple Pay esté habilitado para compras web

**En Mac:**
1. Preferencias del Sistema → Wallet y Apple Pay
2. O debe tener iPhone cerca con continuidad activada

---

### 5. Verificación en el Checkout

**Lo que deberías ver:**

Cuando abres https://iqmind.io/es/checkout en Safari con Apple Pay disponible:

```
┌─────────────────────────────────┐
│  Tarjeta  │ PayPal │ Google Pay │ ← Tabs
├─────────────────────────────────┤
│                                 │
│  [🍎 Pay with Apple Pay]        │ ← Botón de Apple Pay
│                                 │
└─────────────────────────────────┘
```

**Si ves esto pero sin Apple Pay:**
- Verifica que estés usando Safari (no Chrome)
- Verifica que tengas Apple Pay configurado
- Abre la consola del navegador (F12) y busca errores

---

## 🔍 Diagnóstico de Problemas

### Problema: "No veo Apple Pay en absoluto"

**Posibles causas y soluciones:**

1. **No estás usando Safari**
   - ✅ Solución: Abre en Safari en iPhone/iPad/Mac

2. **El dominio no está verificado en Stripe**
   - ✅ Solución: Sigue pasos de sección 2 arriba

3. **Apple Pay no está configurado en el dispositivo**
   - ✅ Solución: Configura Apple Pay en Wallet/Ajustes

4. **Estás en modo incógnito/privado**
   - ✅ Solución: A veces Apple Pay no funciona en modo privado, prueba en ventana normal

---

### Problema: "El dominio no se verifica en Stripe"

**Soluciones:**

1. **Verifica que el archivo sea accesible:**
   ```bash
   curl https://iqmind.io/api/apple-pay-domain-association
   ```
   Debe devolver texto largo hexadecimal

2. **Espera más tiempo:**
   - Stripe puede tardar hasta 5-10 minutos en verificar
   - Recarga la página de Stripe Dashboard

3. **Verifica SSL:**
   - El dominio debe tener HTTPS válido (✅ Vercel lo tiene)

4. **Contacta a Stripe:**
   - Si después de 15 minutos sigue fallando
   - Chat de soporte en dashboard.stripe.com

---

## 🧪 Prueba Rápida

**Para verificar si todo funciona:**

1. Abre **Safari** en iPhone
2. Ve a: https://iqmind.io/es/test
3. Completa el test rápido
4. En el checkout:
   - ¿Ves el botón de Apple Pay? ✅ / ❌
   - ¿Al hacer clic funciona? ✅ / ❌

---

## 📞 Información de Soporte

Si después de seguir todos estos pasos Apple Pay sigue sin aparecer:

1. **Verifica en la consola del navegador:**
   - Abre Safari DevTools (Cmd+Option+I)
   - Ve a Console
   - Busca errores relacionados con "Apple Pay" o "Stripe"

2. **Comparte esta información:**
   - Estado del dominio en Stripe Dashboard
   - Navegador y dispositivo que estás usando
   - Si el archivo de verificación es accesible
   - Screenshot de lo que ves en el checkout
   - Errores en la consola del navegador

---

## 🎯 Resumen Rápido

Para que Apple Pay funcione necesitas **TODOS** estos:

- ✅ Archivo de verificación accesible en `/.well-known/...`
- ✅ Dominio `iqmind.io` verificado en Stripe Dashboard
- ✅ Safari en iOS/iPadOS/macOS
- ✅ Apple Pay configurado en el dispositivo
- ✅ `automatic_payment_methods: { enabled: true }` en backend (✅ ya está)
- ✅ PaymentElement con `applePay: 'auto'` en frontend (✅ ya está)

Si falta alguno, Apple Pay no aparecerá.

