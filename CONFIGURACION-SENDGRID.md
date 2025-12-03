# 📧 Guía Completa de Configuración SendGrid

## 🎯 Resumen

Esta guía te ayudará a configurar SendGrid con tu nuevo dominio **info@mindmetric.io** para enviar todos los emails transaccionales de MindMetric.

---

## 📝 **Tipos de Emails Configurados**

Tu sistema enviará automáticamente **9 tipos de correos** en **9 idiomas**:

| # | Email | Cuándo se envía | Idiomas |
|---|---|---|---|
| 1 | **Test Completado** | Cuando el usuario termina el test | 9 |
| 2 | **Checkout Abandonado** | Si el usuario no completa el pago | 9 |
| 3 | **Pago Exitoso** | Cuando se procesa el pago de €0.50 | 9 |
| 4 | **Trial Iniciado** | Al activar los 2 días de trial | 9 |
| 5 | **Trial Termina Mañana** | 1 día antes de que termine el trial | 9 |
| 6 | **Suscripción Activada** | Al convertirse en suscriptor pagado | 9 |
| 7 | **Pago Mensual Exitoso** | Cada cobro mensual exitoso | 9 |
| 8 | **Pago Fallido** | Cuando un pago falla (hasta 3 intentos) | 9 |
| 9 | **Suscripción Cancelada** | Cuando el usuario cancela | 9 |

**Total:** 81 combinaciones de emails (9 templates × 9 idiomas)

---

## 🚀 **Paso 1: Crear Cuenta en SendGrid**

1. Ve a [https://sendgrid.com](https://sendgrid.com)
2. Haz clic en **"Start for free"**
3. Completa el formulario de registro:
   - Email: (tu email personal)
   - Compañía: `MindMetric`
   - Sitio Web: `https://mindmetric.io`
4. Confirma tu cuenta por email

---

## 🔑 **Paso 2: Obtener API Key**

1. Inicia sesión en SendGrid
2. Ve a **Settings** → **API Keys** (https://app.sendgrid.com/settings/api_keys)
3. Haz clic en **"Create API Key"**
4. **Configuración:**
   - **Name:** `MindMetric Production`
   - **Type:** **Full Access** ✅
5. Copia la **API Key** (empieza con `SG.`)
6. ⚠️ **¡IMPORTANTE!** Guárdala en un lugar seguro, **solo se muestra una vez**

---

## 📧 **Paso 3: Verificar Dominio (Sender Authentication)**

### **Opción A: Single Sender Verification (Rápido - Ideal para empezar)**

1. Ve a **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Haz clic en **"Create New Sender"**
3. Completa el formulario:
   ```
   From Name: MindMetric
   From Email Address: info@mindmetric.io
   Reply To: info@mindmetric.io
   Company Address: [Tu dirección]
   City: [Tu ciudad]
   State: [Tu estado/provincia]
   Zip Code: [Tu código postal]
   Country: Spain
   ```
4. Haz clic en **"Create"**
5. **Verifica tu email:** SendGrid enviará un email a `info@mindmetric.io`
6. Abre el email y haz clic en **"Verify Single Sender"**

✅ **Listo!** Ya puedes enviar emails desde `info@mindmetric.io`

---

### **Opción B: Domain Authentication (Recomendado para producción)**

Esta opción requiere añadir registros DNS pero da mejor deliverability.

1. Ve a **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Haz clic en **"Get Started"**
3. Selecciona:
   - **DNS Host:** (donde tienes tu dominio, ej. Namecheap, GoDaddy, Cloudflare)
   - **Domain:** `mindmetric.io`
   - **Advanced Settings:**
     - ✅ Use automated security
     - ✅ Custom Return Path
     - Subdomain: `email` (opcional)
4. Haz clic en **"Next"**

#### **Añadir Registros DNS**

SendGrid te dará **3 registros CNAME** para añadir a tu DNS:

```dns
CNAME em1234.mindmetric.io → u1234567.wl.sendgrid.net
CNAME s1._domainkey.mindmetric.io → s1.domainkey.u1234567.wl.sendgrid.net
CNAME s2._domainkey.mindmetric.io → s2.domainkey.u1234567.wl.sendgrid.net
```

**Cómo añadirlos (ejemplo Namecheap):**

1. Ve a tu panel de DNS (Namecheap, GoDaddy, Cloudflare...)
2. Añade cada registro CNAME:
   - **Type:** CNAME
   - **Host:** (el valor a la izquierda sin `mindmetric.io`)
   - **Value:** (el valor a la derecha)
   - **TTL:** Automatic

3. Espera 24-48 horas para propagación DNS
4. En SendGrid, haz clic en **"Verify"**

✅ **Verificado!** Ahora SendGrid puede enviar emails de `@mindmetric.io` con máxima deliverability

---

## ⚙️ **Paso 4: Configurar Variables de Entorno en Vercel**

1. Ve a tu proyecto en Vercel: https://vercel.com/[tu-usuario]/mindmetric
2. Ve a **Settings** → **Environment Variables**
3. Añade la variable:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. **Aplica a:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Haz clic en **"Save"**
6. **Redeploy** tu proyecto para aplicar los cambios

---

## ⚙️ **Paso 5: Configurar Variables de Entorno Localmente (Opcional)**

Si quieres probar emails en local:

```bash
# .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **No commitees este archivo** (ya está en `.gitignore`)

---

## 🧪 **Paso 6: Probar el Envío de Emails**

### **Test Rápido desde la Terminal**

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer SG.YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{
      "to": [{"email": "tu-email@gmail.com"}]
    }],
    "from": {"email": "info@mindmetric.io", "name": "MindMetric"},
    "subject": "Test Email",
    "content": [{
      "type": "text/plain",
      "value": "Este es un email de prueba desde SendGrid"
    }]
  }'
```

Reemplaza:
- `SG.YOUR_API_KEY` → Tu API Key real
- `tu-email@gmail.com` → Tu email personal

---

### **Test Desde tu Aplicación**

1. Ve a tu aplicación: `https://mindmetric.io`
2. Completa un test de CI
3. Deberías recibir un email en tu bandeja de entrada

**Emails que se enviarán automáticamente:**
- ✅ Email 1: Test completado (inmediato)
- ✅ Email 2: Checkout abandonado (si no pagas en 24h)
- ✅ Email 3: Pago exitoso (al pagar €0.50)
- ✅ Email 4: Trial iniciado (al activar trial)
- ✅ Email 5: Trial termina mañana (1 día antes)
- ✅ Email 6: Suscripción activada (al convertirse en pago)
- ✅ Email 7: Pago mensual (cada mes)
- ✅ Email 8: Pago fallido (si un pago falla)
- ✅ Email 9: Cancelación (al cancelar)

---

## 📊 **Paso 7: Monitorear Envíos**

### **Dashboard de SendGrid**

1. Ve a **Activity** → **Email Activity** (https://app.sendgrid.com/email_activity)
2. Aquí verás:
   - ✅ **Delivered:** Emails entregados correctamente
   - 📤 **Processed:** Emails procesados
   - ⏳ **Deferred:** Emails temporalmente demorados
   - ❌ **Bounced:** Emails rebotados (email no existe)
   - 🚫 **Spam Report:** Marcados como spam

### **Estadísticas**

Ve a **Stats** → **Overview** para ver:
- Total de emails enviados hoy/mes
- Tasa de apertura
- Tasa de clicks
- Tasa de bounce
- Tasa de spam

---

## 🎨 **Diseño de Emails Actual**

Todos tus emails tienen:
- ✅ **Design profesional** con gradientes de MindMetric
- ✅ **Responsive** (se ven bien en móvil)
- ✅ **Logo** de MindMetric en el header
- ✅ **Colores de marca:** `#113240` y `#07C59A`
- ✅ **CTAs claros** con botones grandes
- ✅ **Footer** con copyright y email de contacto

---

## 🔧 **Archivos Involucrados**

| Archivo | Descripción |
|---------|-------------|
| `lib/email-service.ts` | **Función principal** de envío + 9 templates HTML |
| `lib/email-translations.ts` | **Traducciones** en 9 idiomas |
| `.env.local` | Variables de entorno (local) |
| Vercel → Environment Variables | Variables de entorno (producción) |

---

## ⚠️ **Límites del Plan Gratuito de SendGrid**

- ✅ **100 emails/día** gratis
- ✅ **Sender Verification** incluida
- ✅ **Email Activity** (últimos 7 días)
- ✅ **Analytics básicas**

**Si superas 100 emails/día:**
- **Essentials Plan:** $19.95/mes → 50,000 emails/mes
- **Pro Plan:** $89.95/mes → 100,000 emails/mes

---

## 🐛 **Troubleshooting**

### **Problema 1: Emails no se envían**

**Síntomas:**
```bash
⚠️ SENDGRID_API_KEY no configurado - Email no enviado
```

**Solución:**
1. Verifica que la API Key esté en Vercel Environment Variables
2. Redeploy tu proyecto
3. Verifica que la API Key sea correcta y tenga **Full Access**

---

### **Problema 2: Emails van a spam**

**Solución:**
1. ✅ Usa **Domain Authentication** (Opción B del Paso 3)
2. ✅ Añade registros **DKIM**, **SPF** y **DMARC**
3. ✅ Evita palabras como "GRATIS", "OFERTA", "URGENTE"
4. ✅ Incluye siempre un link de "unsubscribe"

---

### **Problema 3: Email no verificado**

**Síntomas:**
```bash
Sender email not verified
```

**Solución:**
1. Ve a SendGrid → **Settings** → **Sender Authentication**
2. Asegúrate de haber verificado `info@mindmetric.io`
3. Revisa tu bandeja de entrada para el email de verificación

---

### **Problema 4: Rate limit exceeded**

**Síntomas:**
```bash
Rate limit exceeded. You have sent 101 emails today.
```

**Solución:**
1. Espera hasta mañana (el límite se resetea cada 24h)
2. O actualiza a un plan de pago

---

## 📈 **Mejores Prácticas**

### **1. Sender Reputation**

- ✅ Usa siempre el mismo email remitente (`info@mindmetric.io`)
- ✅ No cambies el nombre frecuentemente
- ✅ Mantén una tasa de bounce < 5%
- ✅ Mantén una tasa de spam < 0.1%

### **2. Email Content**

- ✅ Incluye siempre texto plano además de HTML
- ✅ Evita imágenes muy grandes (< 100KB)
- ✅ Usa URLs cortas y descriptivas
- ✅ Incluye tu dirección física en el footer

### **3. Seguridad**

- ✅ Nunca compartas tu API Key
- ✅ Usa variables de entorno
- ✅ Habilita **2FA** en SendGrid
- ✅ Rota la API Key cada 3-6 meses

### **4. Deliverability**

- ✅ Haz **Domain Authentication**
- ✅ Warm up: Empieza enviando pocos emails y aumenta gradualmente
- ✅ Monitorea bounces y elimina emails inválidos
- ✅ Respeta los unsubscribes inmediatamente

---

## 🎯 **Resumen de Configuración**

```bash
# 1. Crear cuenta SendGrid → ✅
# 2. Obtener API Key → ✅
# 3. Verificar info@mindmetric.io → ✅
# 4. Añadir API Key a Vercel → ✅
# 5. Redeploy → ✅
# 6. Probar enviando un test → ✅
# 7. Monitorear en SendGrid Dashboard → ✅
```

---

## 📞 **Soporte**

- **SendGrid Support:** https://support.sendgrid.com
- **Documentation:** https://docs.sendgrid.com
- **API Reference:** https://docs.sendgrid.com/api-reference

---

## 🎉 **¡Listo!**

Tu sistema de emails está configurado y listo para:
- ✅ Enviar 9 tipos de emails diferentes
- ✅ En 9 idiomas automáticamente
- ✅ Con diseño profesional y responsive
- ✅ Desde info@mindmetric.io

**Próximos pasos:**
1. Verifica `info@mindmetric.io` en SendGrid
2. Añade la API Key a Vercel
3. Haz un test de pago completo
4. ¡Disfruta de emails automáticos! 🚀

