# 🔧 Troubleshooting: Emails No Se Envían

## ❌ Problema

Has realizado una compra de prueba y **NO recibiste ningún email**.

---

## ✅ Solución: 3 Pasos Críticos

Para que los emails funcionen, necesitas configurar:

1. ✅ **SendGrid API Key** (para enviar emails)
2. ✅ **Stripe Webhook** (para recibir notificaciones de pagos)
3. ✅ **Variables de entorno en Vercel**

---

## 📧 **Paso 1: Configurar SendGrid (5 minutos)**

### **1.1 Crear Cuenta en SendGrid**

```bash
1. Ir a https://sendgrid.com
2. Sign up → Crear cuenta gratis
3. Verificar tu email
```

### **1.2 Obtener API Key**

```bash
1. Ir a Settings → API Keys
2. Create API Key
3. Name: "MindMetric Production"
4. Type: Full Access
5. Copiar la key (empieza con SG.)
```

⚠️ **¡IMPORTANTE!** La API Key solo se muestra UNA VEZ. Guárdala.

### **1.3 Verificar Email Remitente**

```bash
1. Ir a Settings → Sender Authentication
2. Single Sender Verification
3. Create New Sender:
   - From Email: info@mindmetric.io
   - From Name: MindMetric
   - Reply To: info@mindmetric.io
   - [Completar dirección]
4. Verificar email en tu bandeja de entrada
```

✅ **Verificado!** Ya puedes enviar emails desde `info@mindmetric.io`

---

## 🔔 **Paso 2: Configurar Webhook de Stripe (5 minutos)**

### **¿Por qué necesito un webhook?**

Los emails se envían **automáticamente** cuando Stripe notifica a tu aplicación que:
- ✅ El pago de €0.50 fue exitoso → Email "Pago confirmado"
- ✅ El trial inició → Email "Bienvenido a Premium"
- ✅ El trial termina mañana → Email de recordatorio
- ✅ La suscripción se activó → Email de confirmación
- ✅ etc.

**Sin webhook, tu aplicación NO recibe estas notificaciones** y no envía emails.

---

### **2.1 Configurar Webhook en Stripe**

```bash
1. Ir a https://dashboard.stripe.com
2. Developers → Webhooks
3. Add endpoint
4. URL: https://mindmetric.io/api/webhooks/stripe
5. Seleccionar eventos:
   ✅ payment_intent.succeeded
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ customer.subscription.trial_will_end
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
6. Add endpoint
7. Copiar el "Signing secret" (empieza con whsec_)
```

---

## ⚙️ **Paso 3: Configurar Variables en Vercel (2 minutos)**

```bash
1. Ir a https://vercel.com/[tu-usuario]/mindmetric
2. Settings → Environment Variables
3. Añadir estas variables:

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

4. Apply to: Production, Preview, Development
5. Save
6. Redeploy el proyecto
```

---

## 🧪 **Paso 4: Probar el Flujo Completo**

### **Test 1: Verificar que Stripe recibe el webhook**

```bash
1. Ir a Stripe Dashboard → Developers → Webhooks
2. Click en tu webhook
3. Debería decir "Endpoint is responding"
```

### **Test 2: Hacer una compra de prueba**

```bash
1. Ir a https://mindmetric.io/es/test
2. Completar el test
3. En checkout:
   - Email: tu-email@gmail.com
   - Tarjeta de prueba: 4242 4242 4242 4242
   - Fecha: 12/28
   - CVC: 123
4. Pagar €0.50
```

**Deberías recibir:**
- ✅ Email 1: "¡Pago confirmado! Tu CI: [tu resultado]"
- ✅ Email 2: "¡Bienvenido a Premium! 🚀" (si el trial se activó)

---

## 🔍 **Verificar si el Webhook Funciona**

### **Opción A: Ver los Logs de Stripe**

```bash
1. Ir a Stripe Dashboard
2. Developers → Webhooks
3. Click en tu webhook
4. Ver la pestaña "Events"
```

Deberías ver eventos como:
```
✅ payment_intent.succeeded - 200 OK
✅ customer.subscription.created - 200 OK
```

❌ Si ves **500 errors**, significa que tu aplicación tiene un problema.

---

### **Opción B: Ver los Logs de Vercel**

```bash
1. Ir a Vercel → Tu proyecto
2. Deployments → Click en el último deployment
3. Functions → Click en cualquier función
4. Ver los logs
```

Busca logs como:
```bash
✅ Webhook recibido: payment_intent.succeeded
📧 Datos para email: { customerEmail: 'tu@email.com', ... }
✅ Email de pago exitoso enviado a: tu@email.com
```

❌ Si ves errores como:
```bash
⚠️ SENDGRID_API_KEY no configurado - Email no enviado
```
→ Significa que **falta la API Key de SendGrid en Vercel**

---

## ⚠️ **Problemas Comunes**

### **Problema 1: "SENDGRID_API_KEY no configurado"**

**Causa:** La API Key no está en Vercel  
**Solución:**
```bash
1. Obtén la API Key de SendGrid (Paso 1.2)
2. Añádela a Vercel Environment Variables
3. Redeploy
```

---

### **Problema 2: "Webhook signature verification failed"**

**Causa:** El `STRIPE_WEBHOOK_SECRET` es incorrecto o no está configurado  
**Solución:**
```bash
1. Ir a Stripe → Developers → Webhooks
2. Copiar el "Signing secret" (whsec_...)
3. Añadirlo a Vercel Environment Variables
4. Redeploy
```

---

### **Problema 3: "Sender email not verified"**

**Causa:** No has verificado `info@mindmetric.io` en SendGrid  
**Solución:**
```bash
1. Ir a SendGrid → Settings → Sender Authentication
2. Single Sender Verification
3. Verificar info@mindmetric.io
4. Revisar tu email y hacer clic en "Verify"
```

---

### **Problema 4: Los emails van a spam**

**Causa:** Tu dominio no está autenticado  
**Solución:**
```bash
1. Ir a SendGrid → Settings → Sender Authentication
2. Authenticate Your Domain (en vez de Single Sender)
3. Añadir los registros DNS (CNAME) a tu dominio
4. Esperar 24-48h para propagación
```

---

### **Problema 5: El webhook no se activa**

**Causa:** La URL del webhook es incorrecta  
**Solución:**
```bash
✅ Correcta: https://mindmetric.io/api/webhooks/stripe
❌ Incorrecta: https://mindmetric.io/api/webhook (sin 's')
```

---

## 📊 **Verificar que Todo Funciona**

### **Checklist Final**

```bash
✅ SendGrid API Key obtenida
✅ info@mindmetric.io verificado en SendGrid
✅ Webhook de Stripe creado
✅ Webhook apuntando a https://mindmetric.io/api/webhooks/stripe
✅ SENDGRID_API_KEY en Vercel
✅ STRIPE_WEBHOOK_SECRET en Vercel
✅ Proyecto redeployado
✅ Compra de prueba realizada
✅ Email recibido ✨
```

---

## 🆘 **Si Aún No Funciona**

### **1. Ver Logs en Tiempo Real**

```bash
# En tu terminal local
vercel logs --follow [tu-proyecto-id]

# O en Vercel Dashboard
https://vercel.com/[tu-usuario]/mindmetric/logs
```

### **2. Probar el Webhook Manualmente**

```bash
# En Stripe Dashboard
Developers → Webhooks → Tu webhook → Send test webhook

Selecciona: payment_intent.succeeded
```

Deberías ver:
```bash
✅ 200 OK - Webhook procesado correctamente
```

### **3. Verificar que SendGrid Funciona**

```bash
# Test rápido con curl
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer SG.TU_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{
      "to": [{"email": "tu-email@gmail.com"}]
    }],
    "from": {"email": "info@mindmetric.io", "name": "MindMetric"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

✅ Si funciona → SendGrid está bien configurado  
❌ Si falla → Revisa la API Key o el email verificado

---

## 🎉 **Éxito!**

Una vez configurado todo correctamente, los emails se enviarán **automáticamente** cuando:

1. ✅ Usuario completa un test → Email de bienvenida
2. ✅ Usuario paga €0.50 → Email "Pago confirmado"
3. ✅ Trial inicia → Email "Bienvenido a Premium"
4. ✅ Trial termina mañana → Email de recordatorio
5. ✅ Suscripción se activa → Email de confirmación
6. ✅ Pago mensual → Email de recibo
7. ✅ Pago falla → Email de advertencia
8. ✅ Usuario cancela → Email de confirmación

**Total:** 9 tipos de emails en 9 idiomas = 81 emails diferentes 🚀

---

## 📞 **Soporte**

- **SendGrid Support:** https://support.sendgrid.com
- **Stripe Support:** https://support.stripe.com
- **Guía SendGrid:** Ver `CONFIGURACION-SENDGRID.md`
- **Guía Stripe:** Ver `CONFIGURACION-STRIPE.md`

