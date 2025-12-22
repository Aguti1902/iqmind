# 🔧 Configuración Completa de Stripe para MindMetric

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#1-configuración-inicial)
2. [Productos y Precios en Stripe](#2-productos-y-precios-en-stripe)
3. [Webhooks de Stripe](#3-webhooks-de-stripe)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Flujo de Pagos](#5-flujo-de-pagos)
6. [Correos Electrónicos](#6-correos-electrónicos)
7. [Testing Local](#7-testing-local)
8. [Resolución de Problemas](#8-resolución-de-problemas)

---

## 1. Configuración Inicial

### 1.1 Crear Cuenta de Stripe
1. Ve a [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Completa el registro
3. Activa tu cuenta proporcionando la información de negocio

### 1.2 Obtener Claves API
1. Ve a [Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copia las siguientes claves:
   - **Publishable key** (empieza con `pk_`)
   - **Secret key** (empieza con `sk_`)

---

## 2. Productos y Precios en Stripe

### 2.1 Crear el Pago Inicial (€1.00)

Este es un pago único para desbloquear el resultado del test y activar el trial de 30 días.

**No necesitas crear producto en Stripe** - El código actual usa `PaymentIntent` directamente:

```typescript
// Ya está implementado en: app/api/create-payment-intent/route.ts
const paymentIntent = await stripe.paymentIntents.create({
  amount: 100, // €1.00 en céntimos
  currency: 'eur',
  automatic_payment_methods: {
    enabled: true,
  },
  description: 'Desbloqueo Test IQ',
  setup_future_usage: 'off_session', // Guarda el método de pago para la suscripción
})
```

**✅ SEGURO Y CONFORME:** El cliente autoriza explícitamente este único pago de €1.00, cumpliendo con las políticas de Stripe.

### 2.2 Crear Productos de Suscripción

#### **Paso 1: Crear Producto Base**
1. Ve a [Dashboard → Products](https://dashboard.stripe.com/test/products)
2. Click en **"Add product"**
3. Completa:
   - **Name**: `MindMetric Premium`
   - **Description**: `Acceso completo a todos los tests psicológicos`
   - **Statement descriptor**: `MINDMETRIC` (aparece en el extracto bancario)

#### **Paso 2: Crear Plan Quincenal**
1. En el producto creado, click **"Add another price"**
2. Configura:
   - **Price**: `9.99 EUR`
   - **Billing period**: `Every 2 weeks`
   - **Price description**: `Plan Quincenal`
3. Click **"Add price"**
4. **Copia el Price ID** (empieza con `price_...`)
   - Ejemplo: `price_1234567890quincenal`

#### **Paso 3: Crear Plan Mensual**
1. En el mismo producto, click **"Add another price"**
2. Configura:
   - **Price**: `19.99 EUR`
   - **Billing period**: `Monthly`
   - **Price description**: `Plan Mensual`
3. Click **"Add price"**
4. **Copia el Price ID** (empieza con `price_...`)
   - Ejemplo: `price_1234567890mensual`

---

## 3. Webhooks de Stripe

### 3.1 ¿Por Qué Necesitas Webhooks?

Los webhooks permiten que Stripe notifique a tu aplicación cuando ocurren eventos importantes:
- ✅ Pago completado
- 🔄 Suscripción renovada
- ❌ Pago fallido
- 🚫 Suscripción cancelada
- 💳 Método de pago actualizado

### 3.2 Eventos que Debes Escuchar

Tu aplicación ya tiene un webhook implementado en `app/api/webhooks/stripe/route.ts`. Estos son los eventos críticos:

| Evento | Descripción | Acción en tu App |
|--------|-------------|------------------|
| `payment_intent.succeeded` | Pago de €1.00 completado | Desbloquear resultado del test + crear suscripción con trial |
| `checkout.session.completed` | Suscripción creada exitosamente | Activar cuenta premium |
| `customer.subscription.updated` | Cambio en suscripción | Actualizar estado en BD |
| `customer.subscription.deleted` | Usuario cancela suscripción | Desactivar acceso premium |
| `invoice.payment_succeeded` | Pago recurrente exitoso | Extender suscripción |
| `invoice.payment_failed` | Fallo en pago recurrente | Enviar email de aviso |

### 3.3 Configurar Webhook en Stripe Dashboard

#### **Para Producción:**

1. Ve a [Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Configura:
   - **Endpoint URL**: `https://tudominio.com/api/webhooks/stripe`
   - **Description**: `MindMetric Production Webhook`
   - **Events to send**: Selecciona estos eventos:
     ```
     payment_intent.succeeded
     checkout.session.completed
     customer.subscription.created
     customer.subscription.updated
     customer.subscription.deleted
     invoice.payment_succeeded
     invoice.payment_failed
     invoice.upcoming
     ```
4. Click **"Add endpoint"**
5. **Copia el Signing Secret** (empieza con `whsec_...`)
   - Lo necesitarás para `STRIPE_WEBHOOK_SECRET`

#### **Para Desarrollo Local:**

Usa Stripe CLI (ver sección 7.2)

---

## 4. Variables de Entorno

### 4.1 Archivo `.env.local`

Crea o actualiza tu archivo `.env.local` con:

```bash
# ========================================
# STRIPE - Claves API
# ========================================
# Obtén estas claves en: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI

# ========================================
# STRIPE - Webhook
# ========================================
# Para producción: Obtén en https://dashboard.stripe.com/webhooks
# Para desarrollo: Usa stripe CLI (ver sección 7.2)
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI

# ========================================
# STRIPE - Precios de Suscripción
# ========================================
# Crea los productos en: https://dashboard.stripe.com/products
# Copia los Price IDs (empiezan con price_...)
NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL=price_TU_PRICE_ID_QUINCENAL
NEXT_PUBLIC_STRIPE_PRICE_MENSUAL=price_TU_PRICE_ID_MENSUAL

# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL=postgresql://usuario:password@localhost:5432/mindmetric

# ========================================
# JWT
# ========================================
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# ========================================
# EMAIL (Para notificaciones)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM=noreply@mindmetric.io
```

### 4.2 Variables en Vercel

Si despliegas en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade cada variable con su valor
4. Marca **Production**, **Preview**, y **Development**

---

## 5. Flujo de Pagos

### 5.1 Flujo del Trial (€1.00)

```mermaid
Usuario completa test
      ↓
Ve resultado borroso + botón "Desbloquear por €1.00"
      ↓
Click → /checkout
      ↓
API: create-payment-intent (crea PaymentIntent de €1.00)
      ↓
Usuario ingresa tarjeta en Stripe Elements
      ↓
Pago procesado por Stripe
      ↓
Webhook: payment_intent.succeeded
      ↓
Backend: Guarda resultado en BD + Envía email
      ↓
Usuario ve resultado completo
```

**Archivos involucrados:**
- `app/[lang]/resultado-estimado/page.tsx` - Muestra resultado bloqueado
- `app/[lang]/checkout/page.tsx` - Página de pago
- `app/api/create-payment-intent/route.ts` - Crea el PaymentIntent
- `app/api/webhooks/stripe/route.ts` - Recibe confirmación

### 5.2 Flujo de Suscripción

```mermaid
Usuario en página principal
      ↓
Click en "Comenzar" (Plan Quincenal o Mensual)
      ↓
Modal de suscripción se abre
      ↓
Usuario selecciona plan y click "Suscribirme"
      ↓
API: create-checkout-session (crea sesión con price_id)
      ↓
Redirige a Stripe Checkout
      ↓
Usuario completa pago
      ↓
Stripe redirige a /success
      ↓
Webhook: checkout.session.completed
      ↓
Backend: Activa suscripción en BD
      ↓
Usuario tiene acceso premium
```

**Archivos involucrados:**
- `app/[lang]/page.tsx` - Botones de suscripción
- `components/SubscriptionModal.tsx` - Modal de selección
- `app/api/create-checkout-session/route.ts` - Crea sesión de Checkout
- `app/api/webhooks/stripe/route.ts` - Activa suscripción
- `app/[lang]/success/page.tsx` - Página de éxito

### 5.3 Flujo de Cancelación

```mermaid
Usuario en /cuenta
      ↓
Click en "Cancelar Suscripción"
      ↓
Confirmación
      ↓
API: cancel-subscription (cancela en Stripe)
      ↓
Stripe cancela la suscripción
      ↓
Webhook: customer.subscription.deleted
      ↓
Backend: Desactiva acceso premium en BD
      ↓
Usuario pierde acceso al finalizar periodo actual
```

**Archivos involucrados:**
- `app/[lang]/cuenta/page.tsx` - Botón de cancelar
- `app/api/cancel-subscription/route.ts` - Cancela en Stripe
- `app/api/webhooks/stripe/route.ts` - Actualiza BD

---

## 6. Correos Electrónicos

### 6.1 Configurar SMTP (Gmail Ejemplo)

#### **Paso 1: Crear App Password en Gmail**
1. Ve a [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Activa verificación en 2 pasos
3. Ve a "App passwords"
4. Genera una contraseña para "Mail"
5. Copia la contraseña de 16 caracteres

#### **Paso 2: Configurar en .env.local**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App password
SMTP_FROM=noreply@mindmetric.io
```

### 6.2 Emails que Debes Enviar

Tu aplicación ya tiene plantillas de email. Estos son los eventos y sus emails:

| Evento | Email | Template |
|--------|-------|----------|
| Test completado + pago | Resultado del test | `lib/email-templates.ts` → `getTestResultEmail()` |
| Suscripción creada | Bienvenida premium | `lib/email-templates.ts` → `getSubscriptionConfirmationEmail()` |
| Pago recurrente exitoso | Confirmación de renovación | `lib/email-templates.ts` → `getPaymentSuccessEmail()` |
| Pago fallido | Problema con pago | `lib/email-templates.ts` → `getPaymentFailedEmail()` |
| Suscripción cancelada | Confirmación de cancelación | `lib/email-templates.ts` → `getCancellationEmail()` |
| Factura próxima | Recordatorio de cobro | `lib/email-templates.ts` → `getUpcomingInvoiceEmail()` |

### 6.3 Implementación de Envío de Emails

Crea el archivo `lib/email-service.ts`:

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@mindmetric.io',
      to,
      subject,
      html,
    })
    
    console.log('Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error }
  }
}
```

### 6.4 Instalar Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## 7. Testing Local

### 7.1 Usar Tarjetas de Prueba de Stripe

Cuando estés en modo test, usa estas tarjetas:

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | ✅ Pago exitoso |
| `4000 0000 0000 0002` | ❌ Pago rechazado |
| `4000 0025 0000 3155` | 🔐 Requiere autenticación 3D Secure |

- **Fecha de expiración**: Cualquier fecha futura (ej: 12/34)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquiera (ej: 12345)

### 7.2 Probar Webhooks Localmente con Stripe CLI

#### **Paso 1: Instalar Stripe CLI**

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Descarga desde [https://github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases)

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

#### **Paso 2: Autenticar**
```bash
stripe login
```

Esto abrirá tu navegador para autorizar.

#### **Paso 3: Escuchar Webhooks**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Esto te dará un **webhook signing secret** que empieza con `whsec_...`

Cópialo y ponlo en `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_el_secret_que_te_dio_stripe_cli
```

#### **Paso 4: Probar un Evento**
```bash
stripe trigger payment_intent.succeeded
```

Deberías ver el evento procesado en tu consola.

---

## 8. Resolución de Problemas

### 8.1 Error: "No signatures found matching the expected signature"

**Causa**: El `STRIPE_WEBHOOK_SECRET` no coincide.

**Solución**:
1. Verifica que copiaste correctamente el secret desde Stripe Dashboard
2. En desarrollo local, usa `stripe listen` y copia el secret que te da
3. Reinicia tu servidor Next.js después de cambiar `.env.local`

### 8.2 Error: "Payment requires authentication"

**Causa**: La tarjeta requiere autenticación 3D Secure.

**Solución**:
- Esto es normal. Stripe mostrará un popup de autenticación.
- En producción, algunos bancos europeos requieren esto (PSD2).
- Tu código ya maneja esto con `automatic_payment_methods`.

### 8.3 Webhook no se ejecuta en producción

**Checklist**:
- [ ] ¿Está el webhook configurado en Stripe Dashboard con la URL correcta?
- [ ] ¿La URL es HTTPS? (Stripe solo envía a HTTPS en producción)
- [ ] ¿El endpoint responde 200? Verifica logs en Vercel
- [ ] ¿El `STRIPE_WEBHOOK_SECRET` está en las variables de entorno de Vercel?

### 8.4 Suscripción no se activa

**Checklist**:
1. Verifica que el webhook `checkout.session.completed` se está recibiendo
2. Mira los logs de Stripe Dashboard → Webhooks → [tu endpoint] → View logs
3. Verifica que el `subscriptionId` se guarda en la base de datos
4. Comprueba que `isSubscribed` se marca como `true`

### 8.5 Emails no se envían

**Checklist**:
- [ ] ¿Está configurado SMTP correctamente en `.env.local`?
- [ ] Si usas Gmail, ¿generaste una "App Password"?
- [ ] ¿Está instalado `nodemailer`?
- [ ] Verifica logs del servidor para errores de email

---

## 9. Checklist Pre-Producción

Antes de lanzar a producción, verifica:

### 9.1 Stripe Dashboard
- [ ] Cuenta de Stripe completamente activada
- [ ] Productos creados (Quincenal €9.99, Mensual €19.99)
- [ ] Price IDs copiados a variables de entorno
- [ ] Webhook configurado con URL de producción
- [ ] Webhook secret copiado a Vercel

### 9.2 Variables de Entorno
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (de producción)
- [ ] `STRIPE_SECRET_KEY` (de producción)
- [ ] `STRIPE_WEBHOOK_SECRET` (de producción)
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_QUINCENAL`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_MENSUAL`
- [ ] Todas las variables de email configuradas

### 9.3 Testing
- [ ] Pago de €1.00 funciona
- [ ] Suscripción quincenal se crea correctamente
- [ ] Suscripción mensual se crea correctamente
- [ ] Cancelación funciona
- [ ] Emails se envían correctamente
- [ ] Webhooks se reciben y procesan

### 9.4 Base de Datos
- [ ] Tabla `users` tiene columnas: `stripeCustomerId`, `subscriptionId`, `isSubscribed`
- [ ] Tabla `test_results` guarda correctamente los resultados
- [ ] Backup configurado

---

## 10. Recursos Útiles

- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Documentación de Stripe**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe CLI**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **Testing**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Webhooks**: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Soporte de Stripe**: [https://support.stripe.com](https://support.stripe.com)

---

## 11. Código de Implementación Recomendado

### 11.1 Actualizar Webhook Handler

Mejora tu `app/api/webhooks/stripe/route.ts` para manejar todos los eventos:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email-service'
import {
  getSubscriptionConfirmationEmail,
  getPaymentSuccessEmail,
  getPaymentFailedEmail,
  getCancellationEmail,
  getUpcomingInvoiceEmail,
} from '@/lib/email-templates'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log('✅ Webhook recibido:', event.type)

  try {
    switch (event.type) {
      // 💳 Pago de €1.00 completado (desbloquear resultado + crear suscripción)
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('💰 Pago completado:', paymentIntent.id)
        
        // Aquí ya tienes lógica para guardar el resultado
        // Asegúrate de enviar email
        
        break
      }

      // 🎉 Suscripción creada exitosamente
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          
          // Buscar usuario por email o metadata
          const customerEmail = session.customer_details?.email
          
          if (customerEmail) {
            await db.updateUserSubscription(customerEmail, {
              stripeCustomerId: customerId,
              subscriptionId: subscriptionId,
              isSubscribed: true,
            })
            
            // Enviar email de bienvenida
            await sendEmail({
              to: customerEmail,
              subject: '¡Bienvenido a MindMetric Premium! 🎉',
              html: getSubscriptionConfirmationEmail(customerEmail),
            })
            
            console.log('✅ Suscripción activada para:', customerEmail)
          }
        }
        break
      }

      // 🔄 Pago recurrente exitoso
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const email = (customer as Stripe.Customer).email
          
          if (email) {
            // Extender suscripción
            await db.extendSubscription(email, new Date(subscription.current_period_end * 1000))
            
            // Enviar confirmación de pago
            await sendEmail({
              to: email,
              subject: 'Pago procesado correctamente ✅',
              html: getPaymentSuccessEmail(email, invoice.amount_paid / 100),
            })
            
            console.log('✅ Pago recurrente procesado para:', email)
          }
        }
        break
      }

      // ❌ Pago recurrente fallido
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const email = (customer as Stripe.Customer).email
          
          if (email) {
            // Enviar email de aviso
            await sendEmail({
              to: email,
              subject: '⚠️ Problema con tu pago - MindMetric',
              html: getPaymentFailedEmail(email, invoice.amount_due / 100),
            })
            
            console.log('⚠️ Pago fallido para:', email)
          }
        }
        break
      }

      // 🚫 Suscripción cancelada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const email = (customer as Stripe.Customer).email
        
        if (email) {
          await db.updateUserSubscription(email, {
            isSubscribed: false,
            subscriptionId: null,
          })
          
          // Enviar confirmación de cancelación
          await sendEmail({
            to: email,
            subject: 'Suscripción cancelada - MindMetric',
            html: getCancellationEmail(email),
          })
          
          console.log('❌ Suscripción cancelada para:', email)
        }
        break
      }

      // 📅 Próxima factura (recordatorio)
      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const email = (customer as Stripe.Customer).email
          
          if (email) {
            await sendEmail({
              to: email,
              subject: 'Tu próximo pago de MindMetric',
              html: getUpcomingInvoiceEmail(email, invoice.amount_due / 100, new Date(invoice.period_end * 1000)),
            })
            
            console.log('📅 Recordatorio de pago enviado a:', email)
          }
        }
        break
      }

      default:
        console.log('ℹ️ Evento no manejado:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
```

### 11.2 Crear API para Checkout de Suscripción

Actualiza o crea `app/api/create-checkout-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, userEmail } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Crear o recuperar customer
    let customer
    if (userEmail) {
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
        })
      }
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customer?.id,
      customer_email: !customer ? userEmail : undefined,
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      metadata: {
        userEmail: userEmail || '',
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 📞 Soporte

Si encuentras problemas, consulta:
1. Los logs de tu aplicación (Vercel logs)
2. Los logs de webhooks en Stripe Dashboard
3. La documentación de Stripe
4. Este documento

**¡Stripe configurado y listo para procesar pagos!** 💳✨

