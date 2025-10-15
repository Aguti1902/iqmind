# 📧 Configuración de Emails - SendGrid

## 🎯 Resumen

Sistema completo de emails automáticos para todo el flujo de usuario en IQmind.

---

## 📋 Emails Implementados

### 1. **Bienvenida** (Al iniciar test)
- **Trigger:** Usuario inicia el test
- **Contenido:** Mensaje de bienvenida y tips

### 2. **Test Completado** (Resultado estimado)
- **Trigger:** Usuario completa el test sin pagar
- **Contenido:** CI estimado + incentivo para pagar 0,50€

### 3. **Checkout Abandonado** (Recordatorio)
- **Trigger:** Usuario inicia checkout pero no completa pago
- **Contenido:** Recordatorio + incentivo para completar

### 4. **Pago Exitoso** (Confirmación)
- **Trigger:** Usuario paga 0,50€ exitosamente
- **Contenido:** Confirmación + resultado completo + acceso premium

### 5. **Trial Iniciado** (Bienvenida Premium)
- **Trigger:** Suscripción con trial activada
- **Contenido:** Bienvenida a premium + funciones disponibles + fecha fin trial

### 6. **Trial Termina Mañana** (Recordatorio)
- **Trigger:** 1 día antes de que termine el trial
- **Contenido:** Recordatorio + opciones (continuar/cancelar)

### 7. **Suscripción Activada** (Después del trial)
- **Trigger:** Trial termina y se cobra primer pago mensual
- **Contenido:** Confirmación de suscripción activa

### 8. **Pago Mensual Exitoso** (Cobro recurrente)
- **Trigger:** Cobro mensual exitoso (19,99€)
- **Contenido:** Confirmación de pago + recibo

### 9. **Pago Fallido** (Problemas de cobro)
- **Trigger:** Intento de cobro fallido
- **Contenido:** Alerta + instrucciones para actualizar método de pago
- **Límite:** 3 intentos antes de cancelar suscripción

### 10. **Suscripción Cancelada** (Confirmación)
- **Trigger:** Usuario cancela suscripción
- **Contenido:** Confirmación + fecha hasta la que tiene acceso

---

## 🔧 Configuración de SendGrid

### **Paso 1: Crear cuenta en SendGrid**

1. Ve a: https://signup.sendgrid.com/
2. Crea cuenta con: `support@iqmind.io`
3. Verifica email

### **Paso 2: Obtener API Key**

1. Ve a: https://app.sendgrid.com/settings/api_keys
2. Clic en **"Create API Key"**
3. Nombre: `IQmind Production`
4. Permisos: **Full Access**
5. **Copia la API Key** (solo se muestra una vez)

### **Paso 3: Verificar Dominio**

1. Ve a: https://app.sendgrid.com/settings/sender_auth/domains
2. Clic en **"Authenticate Your Domain"**
3. Selecciona proveedor DNS: **Other**
4. Copia los registros DNS que te da SendGrid
5. Agrega esos registros en **DonDominio** (donde tienes `iqmind.io`)
6. Espera verificación (puede tardar 24-48 horas)

### **Paso 4: Configurar en Vercel**

1. Ve a: https://vercel.com/dashboard
2. Selecciona proyecto `iqmind`
3. Ve a **Settings → Environment Variables**
4. Agrega:
   ```
   Name: SENDGRID_API_KEY
   Value: SG.xxxxx (la API Key que copiaste)
   ```
5. Marca como **Production**, **Preview** y **Development**
6. Clic en **Save**

### **Paso 5: Redeploy**

1. En Vercel Dashboard, ve a **Deployments**
2. Clic en los 3 puntos del último deploy
3. Clic en **"Redeploy"**
4. Espera que termine

---

## 📧 Cómo Usar el Sistema de Emails

### **Desde el Código:**

```typescript
// Ejemplo: Enviar email de bienvenida
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    email: 'usuario@example.com',
    userName: 'Juan',
    lang: 'es',
  }),
})
```

### **Tipos de Email Disponibles:**

```typescript
type: 'welcome'                  // Bienvenida al iniciar test
type: 'testCompleted'            // Test completado (sin pagar)
type: 'checkoutAbandoned'        // Checkout abandonado
type: 'paymentSuccess'           // Pago exitoso (0,50€)
type: 'trialStarted'             // Trial iniciado
type: 'trialEndingTomorrow'      // Trial termina mañana
type: 'subscriptionActivated'    // Suscripción activada
type: 'monthlyPaymentSuccess'    // Pago mensual exitoso
type: 'paymentFailed'            // Pago fallido
type: 'subscriptionCancelled'    // Suscripción cancelada
```

### **Parámetros Requeridos por Tipo:**

```typescript
// welcome
{ type: 'welcome', email, userName, lang }

// testCompleted
{ type: 'testCompleted', email, userName, lang, estimatedIQ: number }

// checkoutAbandoned
{ type: 'checkoutAbandoned', email, userName, lang }

// paymentSuccess
{ type: 'paymentSuccess', email, userName, lang, iq: number }

// trialStarted
{ type: 'trialStarted', email, userName, lang, trialEndDate: string }

// trialEndingTomorrow
{ type: 'trialEndingTomorrow', email, userName, lang }

// subscriptionActivated
{ type: 'subscriptionActivated', email, userName, lang }

// monthlyPaymentSuccess
{ type: 'monthlyPaymentSuccess', email, userName, lang, amount: number }

// paymentFailed
{ type: 'paymentFailed', email, userName, lang, attempt: number }

// subscriptionCancelled
{ type: 'subscriptionCancelled', email, userName, lang, accessUntil: string }
```

---

## 🎯 Integración en el Flujo

### **1. Test Iniciado** → Enviar email de bienvenida

**En:** `app/[lang]/test/page.tsx`

```typescript
// Cuando el usuario inicia el test
useEffect(() => {
  const sendWelcomeEmail = async () => {
    if (userEmail) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          email: userEmail,
          userName: userName || 'Usuario',
          lang: lang,
        }),
      })
    }
  }
  sendWelcomeEmail()
}, [userEmail])
```

### **2. Test Completado** → Enviar resultado estimado

**En:** `app/[lang]/test/page.tsx`

```typescript
// Cuando el usuario completa el test
const handleCompleteTest = async () => {
  // ... código existente ...
  
  // Enviar email con resultado estimado
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'testCompleted',
      email: userEmail,
      userName: userName || 'Usuario',
      lang: lang,
      estimatedIQ: estimatedIQ,
    }),
  })
  
  // Redirigir a checkout
  router.push(`/${lang}/checkout`)
}
```

### **3. Checkout Abandonado** → Recordatorio

**En:** `app/[lang]/checkout/page.tsx`

```typescript
// Si el usuario abandona el checkout, enviar email después de 1 hora
useEffect(() => {
  const timer = setTimeout(() => {
    // Verificar si el pago no se completó
    const paymentCompleted = localStorage.getItem('paymentCompleted')
    if (!paymentCompleted && userEmail) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkoutAbandoned',
          email: userEmail,
          userName: userName || 'Usuario',
          lang: lang,
        }),
      })
    }
  }, 60 * 60 * 1000) // 1 hora

  return () => clearTimeout(timer)
}, [])
```

### **4. Pago Exitoso** → Confirmación + Resultado

**En:** `app/[lang]/checkout/page.tsx`

```typescript
// Después de confirmar el pago
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // ... código de pago existente ...
  
  // Si el pago es exitoso
  if (paymentIntent.status === 'succeeded') {
    // Enviar email de confirmación
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'paymentSuccess',
        email: email,
        userName: userName || 'Usuario',
        lang: lang,
        iq: userIQ,
      }),
    })
    
    // Redirigir a resultado
    router.push(`/${lang}/resultado`)
  }
}
```

### **5. Trial Iniciado** → Bienvenida Premium

**En:** `app/api/create-subscription/route.ts`

```typescript
// Después de crear la suscripción con trial
const subscription = await stripe.subscriptions.create({
  // ... configuración existente ...
})

// Enviar email de trial iniciado
await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://iqmind.io'}/api/send-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'trialStarted',
    email: customerEmail,
    userName: customerName || 'Usuario',
    lang: 'es', // O detectar del contexto
    trialEndDate: new Date(subscription.trial_end * 1000).toLocaleDateString('es-ES'),
  }),
})
```

### **6. Trial Termina Mañana** → Recordatorio

**Crear job programado** (usar cron job o servicio externo)

```typescript
// Ejemplo con cron job diario
// Verificar suscripciones que terminan mañana
const subscriptions = await stripe.subscriptions.list({
  status: 'trialing',
})

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

for (const sub of subscriptions.data) {
  if (sub.trial_end && new Date(sub.trial_end * 1000).toDateString() === tomorrow.toDateString()) {
    // Enviar email de recordatorio
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'trialEndingTomorrow',
        email: sub.customer.email,
        userName: sub.customer.name || 'Usuario',
        lang: 'es',
      }),
    })
  }
}
```

### **7. Suscripción Activada** → Confirmación

**En:** Webhook de Stripe

```typescript
// app/api/webhook/route.ts
case 'customer.subscription.updated':
  const subscription = event.data.object as Stripe.Subscription
  
  // Si el trial terminó y ahora está activa
  if (subscription.status === 'active' && !subscription.trial_end) {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'subscriptionActivated',
        email: customer.email,
        userName: customer.name || 'Usuario',
        lang: 'es',
      }),
    })
  }
  break
```

### **8. Pago Mensual Exitoso** → Recibo

**En:** Webhook de Stripe

```typescript
// app/api/webhook/route.ts
case 'invoice.payment_succeeded':
  const invoice = event.data.object as Stripe.Invoice
  
  // Si es un pago recurrente (no el inicial)
  if (invoice.billing_reason === 'subscription_cycle') {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'monthlyPaymentSuccess',
        email: invoice.customer_email,
        userName: customer.name || 'Usuario',
        lang: 'es',
        amount: invoice.amount_paid / 100, // Convertir de centavos
      }),
    })
  }
  break
```

### **9. Pago Fallido** → Alerta

**En:** Webhook de Stripe

```typescript
// app/api/webhook/route.ts
case 'invoice.payment_failed':
  const invoice = event.data.object as Stripe.Invoice
  
  // Contar intentos fallidos
  const attempt = invoice.attempt_count
  
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'paymentFailed',
      email: invoice.customer_email,
      userName: customer.name || 'Usuario',
      lang: 'es',
      attempt: attempt,
    }),
  })
  
  // Si es el 3er intento, cancelar suscripción
  if (attempt >= 3) {
    await stripe.subscriptions.update(invoice.subscription as string, {
      cancel_at_period_end: true,
    })
  }
  break
```

### **10. Suscripción Cancelada** → Confirmación

**En:** Webhook de Stripe o API de cancelación

```typescript
// app/api/webhook/route.ts
case 'customer.subscription.deleted':
  const subscription = event.data.object as Stripe.Subscription
  
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'subscriptionCancelled',
      email: customer.email,
      userName: customer.name || 'Usuario',
      lang: 'es',
      accessUntil: new Date(subscription.current_period_end * 1000).toLocaleDateString('es-ES'),
    }),
  })
  break
```

---

## 🧪 Testing

### **Probar Emails en Desarrollo:**

```bash
# Sin SendGrid configurado, los emails se loguean en consola
npm run dev
```

### **Probar Emails en Producción:**

1. Configura SendGrid (pasos arriba)
2. Hace un test de pago
3. Verifica que recibes los emails

### **Ver Logs de SendGrid:**

1. Ve a: https://app.sendgrid.com/activity
2. Verás todos los emails enviados
3. Puedes ver si fueron entregados, rebotaron, etc.

---

## 📊 Estadísticas

SendGrid Dashboard te mostrará:
- Emails enviados
- Tasa de apertura
- Tasa de clicks
- Emails rebotados
- Emails marcados como spam

---

## 🔐 Seguridad

- ✅ API Key en variables de entorno (nunca en código)
- ✅ Verificación de dominio (previene spam)
- ✅ Rate limiting de SendGrid (100 emails/día gratis)
- ✅ Templates HTML seguros (sin XSS)

---

## 💰 Costos

**SendGrid Free Tier:**
- 100 emails/día gratis
- Ilimitado para siempre

**Si necesitas más:**
- Essentials: $19.95/mes (40,000 emails)
- Pro: $89.95/mes (100,000 emails)

---

## 🎯 Próximos Pasos

1. ✅ Crear cuenta en SendGrid
2. ✅ Obtener API Key
3. ✅ Verificar dominio `iqmind.io`
4. ✅ Agregar `SENDGRID_API_KEY` en Vercel
5. ✅ Redeploy
6. ✅ Integrar triggers en el código
7. ✅ Probar flujo completo

---

## 📝 Notas

- Los emails se envían desde `support@iqmind.io`
- Todos los emails son responsive (móvil + desktop)
- Todos los emails tienen versión en español e inglés
- Los emails incluyen botones de acción (CTAs)
- Los emails tienen footer con info de contacto

---

**¿Necesitas ayuda con algún paso?** 📧

