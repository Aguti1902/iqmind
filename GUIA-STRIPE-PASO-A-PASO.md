# 📝 Guía Paso a Paso: Configurar Stripe en MindMetric

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Crear Cuenta y Obtener Claves

1. Ve a https://dashboard.stripe.com/register
2. Completa el registro
3. Ve a **Developers → API Keys**
4. Copia:
   - `pk_test_...` (Publishable key)
   - `sk_test_...` (Secret key)

### 2️⃣ Crear Productos de Suscripción

1. Ve a https://dashboard.stripe.com/test/products
2. Click **"Add product"**
3. Completa:
   - **Name**: `MindMetric Premium`
   - **Description**: `Acceso completo a todos los tests psicológicos`
   
4. **Precio Quincenal**:
   - Click **"Add price"**
   - Amount: `9.99 EUR`
   - Billing period: **Custom** → `Every 2 weeks`
   - Click **"Add price"**
   - **COPIA EL PRICE ID** → `price_xxxxxxxxxxxxx`

5. **Precio Mensual**:
   - Click **"Add another price"**
   - Amount: `19.99 EUR`
   - Billing period: `Monthly`
   - Click **"Add price"**
   - **COPIA EL PRICE ID** → `price_yyyyyyyyyyy`

### 3️⃣ Configurar Variables de Entorno

Edita tu archivo `.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI

# Price IDs (de los productos que creaste)
NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_MENSUAL=price_yyyyyyyyyyy

# Email (opcional pero recomendado)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
```

### 4️⃣ Instalar Stripe CLI (Para Testing Local)

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Descarga desde: https://github.com/stripe/stripe-cli/releases

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### 5️⃣ Autenticar Stripe CLI

```bash
stripe login
```

Esto abrirá tu navegador para autorizar.

### 6️⃣ Probar Webhooks Localmente

En una terminal separada:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copia el **webhook signing secret** (`whsec_...`) y añádelo a `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_el_secret_que_aparece_en_terminal
```

### 7️⃣ Iniciar tu Aplicación

```bash
npm run dev
```

### 8️⃣ Probar un Pago

1. Ve a http://localhost:3000/es/checkout
2. Usa la tarjeta de prueba: `4242 4242 4242 4242`
3. Fecha: `12/34` | CVC: `123`
4. Observa los eventos en la terminal de Stripe CLI

---

## 🧪 Pruebas Completas

### Probar Pago de €0.50

```bash
# 1. Completa un test en tu aplicación
# 2. Llega a la página de checkout
# 3. Usa tarjeta de prueba: 4242 4242 4242 4242
# 4. Verifica que recibes el email
# 5. Verifica que el resultado se desbloquea
```

### Probar Suscripción Quincenal

```bash
# 1. Ve a la página principal
# 2. Click en "Comenzar" del plan quincenal
# 3. Completa el checkout con tarjeta de prueba
# 4. Verifica que recibes email de bienvenida
# 5. Verifica acceso premium en /cuenta
```

### Probar Cancelación

```bash
# 1. Ve a /cuenta
# 2. Click en "Cancelar Suscripción"
# 3. Confirma
# 4. Verifica que recibes email de confirmación
# 5. Verifica que el acceso continúa hasta el final del periodo
```

### Probar Eventos con Stripe CLI

```bash
# Simular pago exitoso
stripe trigger payment_intent.succeeded

# Simular suscripción creada
stripe trigger checkout.session.completed

# Simular pago recurrente
stripe trigger invoice.payment_succeeded

# Simular pago fallido
stripe trigger invoice.payment_failed

# Simular cancelación
stripe trigger customer.subscription.deleted
```

---

## 🚀 Configurar Producción

### 1️⃣ Activar Cuenta de Stripe

1. Ve a https://dashboard.stripe.com/account/onboarding
2. Completa la información de negocio
3. Proporciona información bancaria
4. Espera aprobación (24-48 horas)

### 2️⃣ Crear Productos en Producción

**IMPORTANTE**: Los productos de test NO se transfieren a producción. Debes crearlos nuevamente:

1. **Cambia a modo Live** en el dashboard (toggle arriba a la derecha)
2. Ve a **Products** → **Add product**
3. Crea los mismos productos que en test:
   - MindMetric Premium
   - Plan Quincenal: €9.99 cada 2 semanas
   - Plan Mensual: €19.99 al mes
4. **COPIA LOS NUEVOS PRICE IDs** (serán diferentes a los de test)

### 3️⃣ Obtener Claves de Producción

1. Ve a **Developers → API Keys**
2. Copia las claves de **Live mode**:
   - `pk_live_...`
   - `sk_live_...`

### 4️⃣ Configurar Webhook de Producción

1. Ve a **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://tudominio.com/api/webhooks/stripe`
4. Selecciona estos eventos:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.upcoming`
5. Click **"Add endpoint"**
6. **COPIA EL SIGNING SECRET** (`whsec_...`)

### 5️⃣ Configurar Variables en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings → Environment Variables**
3. Añade TODAS las variables:

```bash
# Claves de producción
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_TU_CLAVE
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA

# Webhook de producción
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_PRODUCCION

# Price IDs de producción (diferentes a los de test)
NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL=price_live_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_MENSUAL=price_live_yyyyy

# Email
SENDGRID_API_KEY=SG.tu_api_key

# Base de datos de producción
DATABASE_URL=postgresql://...
JWT_SECRET=tu_jwt_secreto_muy_largo_y_seguro
```

4. Marca **Production** para cada variable
5. Click **"Save"**

### 6️⃣ Redesplegar

```bash
git add .
git commit -m "✅ Configurar Stripe para producción"
git push origin main
```

Vercel desplegará automáticamente.

### 7️⃣ Verificar Webhook en Producción

1. Ve a https://dashboard.stripe.com/webhooks
2. Click en tu webhook de producción
3. Click en **"Send test webhook"**
4. Selecciona `payment_intent.succeeded`
5. Click **"Send test webhook"**
6. Verifica que aparece ✅ en el log

---

## 🔍 Monitoreo y Debugging

### Ver Logs de Stripe

**Dashboard de Stripe:**
1. Ve a https://dashboard.stripe.com/test/logs
2. Aquí verás todos los eventos y requests
3. Click en cualquier evento para ver detalles

**Logs de Webhooks:**
1. Ve a https://dashboard.stripe.com/test/webhooks
2. Click en tu webhook
3. Ve la pestaña **"Logs"**
4. Verás todos los eventos enviados y sus respuestas

### Ver Logs de Vercel

```bash
vercel logs tu-proyecto-mindmetric
```

O en el dashboard de Vercel:
1. Ve a tu proyecto
2. Click en un deployment
3. Ve la pestaña **"Logs"**

### Debugging Común

**❌ Webhook no se ejecuta:**
```bash
# Verifica que el secret sea correcto
echo $STRIPE_WEBHOOK_SECRET

# Verifica que el endpoint responda
curl https://tudominio.com/api/webhooks/stripe

# Verifica logs de Stripe Dashboard
```

**❌ Pago no se procesa:**
```bash
# Verifica que las claves sean correctas
# Modo test: pk_test_... y sk_test_...
# Modo live: pk_live_... y sk_live_...
```

**❌ Suscripción no se activa:**
```bash
# Verifica que los Price IDs sean correctos
# Verifica que el webhook recibe checkout.session.completed
# Verifica logs de tu aplicación
```

---

## 📊 Dashboard de Stripe - Qué Puedes Ver

### Pagos
https://dashboard.stripe.com/payments
- Ver todos los pagos (€0.50 de tests)
- Estado: Succeeded, Failed, Pending
- Reembolsar pagos si es necesario

### Suscripciones
https://dashboard.stripe.com/subscriptions
- Ver todas las suscripciones activas
- Cancelar manualmente si un usuario lo pide
- Ver historial de pagos de cada suscripción

### Clientes
https://dashboard.stripe.com/customers
- Ver todos los clientes registrados
- Ver suscripciones de cada cliente
- Ver métodos de pago guardados

### Disputas
https://dashboard.stripe.com/disputes
- Ver chargebacks o disputas
- Responder con evidencia si es necesario

### Balances
https://dashboard.stripe.com/balance
- Ver dinero disponible
- Ver próximos pagos a tu cuenta bancaria
- Programar pagos manuales

---

## 💳 Tarjetas de Prueba de Stripe

### Pagos Exitosos
```
4242 4242 4242 4242  → Visa
5555 5555 5555 4444  → Mastercard
3782 822463 10005    → American Express
```

### Pagos Fallidos
```
4000 0000 0000 0002  → Tarjeta rechazada
4000 0000 0000 9995  → Fondos insuficientes
4000 0000 0000 9987  → Tarjeta perdida
4000 0000 0000 9979  → Tarjeta robada
```

### 3D Secure (Autenticación)
```
4000 0025 0000 3155  → Requiere autenticación
```

**Datos adicionales** (funcionan con cualquier tarjeta):
- **Fecha**: Cualquier fecha futura (ej: 12/34)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquiera (ej: 28001)

---

## 📧 Configurar Emails (SendGrid)

### 1️⃣ Crear Cuenta en SendGrid

1. Ve a https://signup.sendgrid.com/
2. Completa el registro (plan gratuito: 100 emails/día)
3. Verifica tu email

### 2️⃣ Crear API Key

1. Ve a **Settings → API Keys**
2. Click **"Create API Key"**
3. Name: `MindMetric Production`
4. Permissions: **Full Access**
5. Click **"Create & View"**
6. **COPIA LA API KEY** (solo se muestra una vez)

### 3️⃣ Verificar Dominio (Recomendado)

**Opción 1: Single Sender (Más rápido)**
1. Ve a **Settings → Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Completa con tu email (ej: support@mindmetric.io)
4. Verifica el email que recibes

**Opción 2: Domain Authentication (Profesional)**
1. Ve a **Settings → Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. Selecciona tu proveedor DNS
4. Añade los registros DNS que te proporciona
5. Verifica (puede tardar hasta 48 horas)

### 4️⃣ Añadir a Variables de Entorno

```bash
SENDGRID_API_KEY=SG.tu_api_key_aqui
```

### 5️⃣ Probar Email

Crea un archivo `test-email.ts`:

```typescript
import { sendEmail } from './lib/email-service'

sendEmail({
  to: 'tu-email@gmail.com',
  subject: '🧪 Test Email',
  html: '<h1>¡Funciona!</h1><p>Tu configuración de email es correcta.</p>'
}).then(result => {
  console.log('Resultado:', result)
})
```

Ejecuta:
```bash
npx ts-node test-email.ts
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "No signatures found matching the expected signature"

**Causa**: El webhook secret no coincide.

**Solución**:
1. Verifica que `STRIPE_WEBHOOK_SECRET` en `.env.local` sea correcto
2. En local: usa `stripe listen` y copia el secret que aparece
3. En producción: copia el secret del dashboard de webhooks
4. Reinicia tu servidor después de cambiar `.env.local`

---

### Error: "Invalid API Key provided"

**Causa**: La clave de Stripe no es válida o está en el modo incorrecto.

**Solución**:
1. Verifica que `STRIPE_SECRET_KEY` sea correcta
2. Test: debe empezar con `sk_test_`
3. Live: debe empezar con `sk_live_`
4. No confundas la publishable key (pk_) con la secret key (sk_)

---

### Error: "Payment requires authentication"

**Causa**: El banco requiere autenticación 3D Secure.

**Solución**:
- Esto es NORMAL, especialmente en Europa (PSD2)
- Tu código ya lo maneja con `automatic_payment_methods`
- Stripe mostrará un popup de autenticación
- El usuario debe completar la autenticación en su banco

---

### Error: "Webhook endpoint returned response 500"

**Causa**: Tu código tiene un error al procesar el webhook.

**Solución**:
1. Verifica logs en Vercel o consola local
2. Añade try-catch en tu webhook handler
3. Verifica que la base de datos esté accesible
4. Verifica que todas las funciones existan

---

### Suscripción no se activa después del pago

**Checklist**:
- [ ] Webhook configurado correctamente
- [ ] Evento `checkout.session.completed` seleccionado
- [ ] Webhook secret correcto en variables de entorno
- [ ] Función `db.updateUserSubscription()` funciona
- [ ] Base de datos accesible desde el webhook

**Debug**:
```typescript
// Añade logs en tu webhook handler
console.log('📥 Webhook recibido:', event.type)
console.log('📧 Email del cliente:', customerEmail)
console.log('💳 Subscription ID:', subscriptionId)
```

---

### Emails no se envían

**Checklist**:
- [ ] `SENDGRID_API_KEY` configurada
- [ ] API key con permisos **Full Access**
- [ ] Sender verificado en SendGrid
- [ ] `sendEmail()` se llama correctamente
- [ ] No hay errores en la consola

**Debug**:
```typescript
// Verifica resultado de sendEmail
const result = await sendEmail({...})
console.log('📧 Resultado email:', result)
```

---

## 📱 Contacto y Soporte

### Stripe Support
- Dashboard: https://support.stripe.com
- Docs: https://stripe.com/docs
- Community: https://github.com/stripe

### SendGrid Support
- Dashboard: https://app.sendgrid.com
- Docs: https://docs.sendgrid.com
- Support: support@sendgrid.com

---

## ✅ Checklist Final

Antes de lanzar a producción:

### Stripe
- [ ] Cuenta de Stripe completamente activada
- [ ] Información bancaria proporcionada
- [ ] Productos creados en modo Live
- [ ] Price IDs copiados
- [ ] Claves Live configuradas en Vercel
- [ ] Webhook de producción configurado
- [ ] Webhook secret configurado en Vercel
- [ ] Pago de prueba exitoso en producción

### Email
- [ ] SendGrid API key creada
- [ ] Sender verificado
- [ ] API key en Vercel
- [ ] Email de prueba enviado

### Testing
- [ ] Pago de €0.50 funciona
- [ ] Suscripción quincenal funciona
- [ ] Suscripción mensual funciona
- [ ] Cancelación funciona
- [ ] Emails se envían correctamente
- [ ] Webhooks se procesan correctamente

### Base de Datos
- [ ] Columnas de suscripción existen
- [ ] Funciones de BD funcionan
- [ ] Backup configurado

---

**¡Listo! Tu integración con Stripe está completa** 🎉

Si tienes dudas, revisa los logs de Stripe Dashboard y Vercel.

