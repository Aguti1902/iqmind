# 🤖 Agente de IA para Reembolsos - Quick Start

Sistema automatizado para gestionar solicitudes de reembolso usando n8n, OpenAI y Stripe.

---

## ⚡ INICIO RÁPIDO (5 minutos)

### 1. Instalar n8n

```bash
# Opción A: n8n Cloud (Recomendado)
# Ve a: https://n8n.io y crea cuenta

# Opción B: Local (para testing)
npm install -g n8n
n8n
# Abre: http://localhost:5678
```

### 2. Importar Workflow

```bash
1. En n8n, click en "Import workflow"
2. Sube el archivo: n8n-workflow-reembolsos.json
3. El workflow completo se cargará automáticamente ✅
```

### 3. Configurar Credenciales

En n8n, ve a **Settings → Credentials** y añade:

#### 🔑 OpenAI API
- Nombre: `OpenAI API`
- API Key: `sk-proj-xxxxxxxxxxxxx`
- Obtener en: https://platform.openai.com/api-keys

#### 💳 Stripe API
- Nombre: `Stripe API`
- Secret Key: `sk_test_xxxxxxxxxxxxx` (test) o `sk_live_xxxxxxxxxxxxx` (prod)
- Obtener en: https://dashboard.stripe.com/apikeys

#### 📧 Gmail IMAP
- Nombre: `Gmail Refunds`
- Email: `refunds@mindmetric.io`
- App Password: `xxxx xxxx xxxx xxxx`
- Generar en: https://myaccount.google.com/apppasswords

#### 📤 SendGrid SMTP
- Nombre: `SendGrid SMTP`
- Host: `smtp.sendgrid.net`
- Port: `587`
- User: `apikey`
- Password: `SG.xxxxxxxxxxxxx` (tu API key de SendGrid)
- Obtener en: https://app.sendgrid.com/settings/api_keys

### 4. Activar Workflow

```bash
1. En n8n, abre el workflow importado
2. Click en toggle "Active" (arriba a la derecha)
3. ✅ El workflow está ahora activo 24/7
```

---

## 🧪 TESTING ANTES DE PRODUCCIÓN

### Test con Script de Node.js

Prueba la lógica ANTES de activar n8n:

```bash
# 1. Configurar Stripe Key
export STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# 2. Ejecutar test
node test-stripe-refund.js test@example.com

# 3. Ver resultado:
# ✅ SÍ cumple política → Simulará reembolso
# ❌ NO cumple política → Explicará por qué
```

### Test en n8n

```bash
1. En n8n, click en "Execute Workflow"
2. Envía un email de prueba a refunds@mindmetric.io
3. Espera 1 minuto (el trigger revisa cada minuto)
4. Verifica en "Executions" que funcionó
```

---

## 📧 CASOS DE PRUEBA

### ❌ Caso 1: Reembolso NO VÁLIDO (Pago Inicial)

**Email de prueba:**
```
Para: refunds@mindmetric.io
Asunto: Solicitud de reembolso

Hola,

Pagué 1€ hace 3 días para ver mi resultado del test,
pero no quedé satisfecho con la información proporcionada.

¿Pueden devolverme mi dinero?

Gracias.
```

**Resultado esperado:**
- ✅ IA detecta: REEMBOLSO_INICIAL
- ❌ Evalúa: cumple_politica = false
- ❌ NO crea reembolso
- ✅ Envía email explicando que pago inicial NO es reembolsable
- ✅ Ofrece soporte técnico si hubo problemas

---

### ❌ Caso 2: Reembolso NO VÁLIDO (Olvidó cancelar)

**Email de prueba:**
```
Para: refunds@mindmetric.io
Asunto: Reembolso

Hola,

Olvidé cancelar mi suscripción y me cobraron 19.99€.
Ya no quiero el servicio.

Devuélvanme el dinero.
```

**Resultado esperado:**
- ✅ IA detecta: REEMBOLSO_SUSCRIPCION
- ❌ Evalúa: cumple_politica = false (olvidar cancelar NO es motivo válido)
- ❌ NO crea reembolso
- ✅ Envía email explicando política
- ✅ Ofrece cancelación inmediata sin reembolso
- ✅ Mantiene acceso hasta fin del período pagado

---

### ✅ Caso 3: Reembolso VÁLIDO (Problema Técnico)

**Email de prueba:**
```
Para: refunds@mindmetric.io
Asunto: Web caída

La web estuvo caída todo el fin de semana.
No pude acceder a mis resultados.

Quiero un reembolso de los 19.99€.
```

**Resultado esperado:**
- ✅ IA detecta: REEMBOLSO_SUSCRIPCION + problema técnico
- ✅ Evalúa: cumple_politica = true
- ✅ Crea reembolso en Stripe
- ✅ Cancela suscripción
- ✅ Envía email con disculpas

---

## 📊 DOCUMENTACIÓN COMPLETA

Para detalles completos, ver:

```
📄 N8N-AGENTE-IA-REEMBOLSOS.md
   - Política de reembolsos detallada
   - Explicación del workflow completo
   - Configuración avanzada
   - Monitoreo y métricas
   - Troubleshooting
```

---

## 🔍 VERIFICAR QUE FUNCIONA

### 1. Check de Credenciales

En n8n:
```
Settings → Credentials
- ✅ OpenAI API (verde)
- ✅ Stripe API (verde)
- ✅ Gmail IMAP (verde)
- ✅ SendGrid SMTP (verde)
```

### 2. Check de Workflow

```
1. Envía email de prueba a refunds@mindmetric.io
2. Espera 1-2 minutos
3. Ve a "Executions" en n8n
4. Verifica que todos los nodos se ejecutaron ✅
```

### 3. Check de Stripe

```
1. Ve a: https://dashboard.stripe.com/test/payments
2. Busca el reembolso recién creado
3. Verifica que aparece con estado "Succeeded"
```

### 4. Check de Email

```
1. Revisa el inbox del email de prueba
2. Deberías recibir la respuesta del agente de IA
3. Verifica que el tono es profesional y empático
```

---

## ⚙️ CONFIGURACIÓN AVANZADA

### Cambiar Frecuencia de Revisión de Emails

```
En n8n:
1. Click en nodo "Gmail Trigger"
2. Cambia "Poll Times" de "Every Minute" a tu preferencia
3. Guardar
```

### Añadir Notificaciones a Slack

```
1. En n8n, añade nodo "Slack"
2. Conéctalo después de "Email: Reembolso Aprobado"
3. Configura canal y mensaje
4. ¡Recibirás notificaciones en tiempo real!
```

### Guardar en Airtable/Google Sheets

```
1. En n8n, añade nodo "Airtable" o "Google Sheets"
2. Conéctalo al final del workflow
3. Mapea campos:
   - Email cliente
   - Tipo solicitud
   - Cumple política
   - Monto reembolsado
   - Fecha
```

---

## 🆘 PROBLEMAS COMUNES

### "Gmail credentials not working"

```bash
Solución:
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera nueva App Password
3. Usa esa contraseña (NO tu contraseña de Gmail)
4. En Gmail, habilita IMAP:
   Settings → Forwarding and POP/IMAP → Enable IMAP
```

### "OpenAI API error: insufficient_quota"

```bash
Solución:
1. Ve a: https://platform.openai.com/account/billing
2. Añade crédito (mínimo $5)
3. Espera 5-10 minutos
4. Prueba de nuevo
```

### "Stripe: No such customer"

```bash
Solución:
1. Verifica que el email del test existe en Stripe
2. Ve a: https://dashboard.stripe.com/test/customers
3. Busca el email manualmente
4. Si no existe, crea un pago de prueba primero
```

### "Workflow no ejecuta automáticamente"

```bash
Solución:
1. Verifica que el workflow está "Active" (toggle verde)
2. Verifica que Gmail credentials funcionan
3. Envía email de prueba y espera 1-2 minutos
4. Revisa "Executions" para ver errores
```

---

## 💰 COSTOS ESTIMADOS

```
n8n Cloud:           $20/mes (Plan Starter)
OpenAI API:          ~$5/mes (500 solicitudes)
SendGrid:            Gratis (100 emails/día)
Stripe API:          Gratis
Gmail:               Gratis

TOTAL:               ~$25/mes
```

---

## 📈 MÉTRICAS A MONITOREAR

```
📊 Tasa de Aprobación:
   (Reembolsos Aprobados / Total Solicitudes) × 100
   Objetivo: 20-30%

⏱️ Tiempo de Respuesta:
   Promedio desde email recibido hasta respuesta
   Objetivo: < 5 minutos

🎯 Precisión de IA:
   (Decisiones Correctas / Total Decisiones) × 100
   Objetivo: > 95%

💰 Monto Total Reembolsado:
   Suma mensual de todos los reembolsos
   Análisis: Comparar con ingresos
```

---

## ✅ CHECKLIST PRE-PRODUCCIÓN

```
SETUP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ n8n instalado/cuenta creada
□ Workflow importado
□ Credenciales configuradas (4 en total)
□ Workflow activado

TESTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Test 1: Reembolso inicial válido
□ Test 2: Reembolso suscripción válido
□ Test 3: Reembolso denegado (cambio opinión)
□ Test 4: Cliente no encontrado
□ Emails se reciben correctamente
□ Reembolsos se crean en Stripe

PRODUCCIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Cambiar a claves LIVE de Stripe
□ Configurar email refunds@mindmetric.io
□ Monitoreo activo (primera semana)
□ Documentación para equipo
□ Backup del workflow en JSON
```

---

## 📞 SOPORTE

**Documentación completa:**
- `N8N-AGENTE-IA-REEMBOLSOS.md` - Guía detallada
- `n8n-workflow-reembolsos.json` - Workflow para importar
- `test-stripe-refund.js` - Script de testing

**Recursos externos:**
- n8n Docs: https://docs.n8n.io
- OpenAI Docs: https://platform.openai.com/docs
- Stripe Docs: https://stripe.com/docs/api

---

## 🎉 ¡LISTO!

Tu agente de IA está configurado y listo para procesar reembolsos 24/7.

**Ahorro estimado:** 10 horas/mes
**ROI:** 8x
**Satisfacción del cliente:** ⬆️ (respuestas en < 5 minutos)

---

**Creado para MindMetric** 🧠
**Fecha:** Diciembre 2025
**Versión:** 1.0

