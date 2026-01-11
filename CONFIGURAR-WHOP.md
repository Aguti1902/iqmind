# 🚀 CONFIGURACIÓN DE WHOP PARA MINDMETRIC

## 📋 RESUMEN

MindMetric ha migrado de **Stripe a Whop** como pasarela de pago.

**Whop** es una plataforma diseñada para vender membresías digitales, cursos, comunidades y suscripciones.

---

## ⚠️ NOTA IMPORTANTE: PRIME PAYMENTS

Actualmente también se está configurando **Prime Payments** como pasarela alternativa de pago.

**Documentación de Prime Payments:**
- 📄 [CONFIGURAR-PRIME-PAYMENTS.md](./CONFIGURAR-PRIME-PAYMENTS.md) - Configuración completa
- 🔐 [PRIME-PAYMENTS-ENV-VARS.md](./PRIME-PAYMENTS-ENV-VARS.md) - Variables de entorno

**URLs de Prime Payments:**
- ✅ URL de éxito: `https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}`
- ❌ URL de cancelación: `https://mindmetric.io/es?canceled=true`
- 🪝 Webhook: `https://mindmetric.io/api/prime-payments-webhook`

---

## 🔧 PASO 1: CREAR CUENTA EN WHOP

1. Ve a [https://whop.com/](https://whop.com/)
2. Haz clic en "Create a business"
3. Completa el registro con tus datos
4. Verifica tu email

---

## 📦 PASO 2: CREAR PRODUCTOS EN WHOP

### Producto 1: Plan Mensual MindMetric

1. En tu [Dashboard de Whop](https://whop.com/dashboard), ve a **Products**
2. Haz clic en **Create Product**
3. Configura:
   - **Name:** MindMetric Premium - Plan Mensual
   - **Description:** Acceso completo a todos los tests psicológicos (IQ, Personalidad, TDAH, Ansiedad, Depresión, EQ)
   - **Price:** €9.99/mes (o el precio que prefieras)
   - **Trial:** 2 días
   - **Initial Payment:** €1.00 (mínimo de Whop)
   - **Billing:** Monthly (Mensual)
4. Guarda el **Plan ID** (lo necesitarás para las variables de entorno)

### Producto 2: Plan Quincenal (Opcional)

1. Crea otro producto similar
2. Configura:
   - **Name:** MindMetric Premium - Plan Quincenal
   - **Price:** €5.99/quincena
   - **Trial:** 2 días
   - **Initial Payment:** €1.00 (mínimo de Whop)
   - **Billing:** Bi-weekly (Quincenal)
3. Guarda el **Plan ID**

---

## 🔑 PASO 3: OBTENER API KEY

1. En tu Dashboard de Whop, ve a **Developer** (sección izquierda)
2. Haz clic en **API Keys**
3. Haz clic en **Create API Key**
4. Configura:
   - **Name:** MindMetric Production
   - **Permissions:** 
     - ✅ Read memberships
     - ✅ Write memberships
     - ✅ Read payments
5. Copia la **API Key** generada (solo se muestra una vez)
6. Guárdala en un lugar seguro

**Documentación oficial:** [https://help.whop.com/en/articles/10408817-how-to-create-an-api-key](https://help.whop.com/en/articles/10408817-how-to-create-an-api-key)

---

## 🔔 PASO 4: CONFIGURAR WEBHOOKS

Los webhooks permiten que Whop notifique a tu aplicación cuando ocurren eventos (pagos, cancelaciones, etc.)

### Configuración:

1. En tu Dashboard de Whop, ve a **Settings** → **Webhooks**
2. Haz clic en **Create Webhook**
3. Configura:
   - **URL:** `https://tu-dominio.com/api/whop/webhook`
   - **Events** (selecciona estos):
     - ✅ `membership.went_valid` - Cuando un usuario activa su membresía
     - ✅ `membership.went_invalid` - Cuando expira o se cancela
     - ✅ `payment.succeeded` - Pago exitoso
     - ✅ `payment.failed` - Pago fallido
4. Guarda el **Webhook Secret** (para verificar firmas)

**Documentación oficial:** [https://help.whop.com/en/articles/11436427-how-to-use-whop-webhooks](https://help.whop.com/en/articles/11436427-how-to-use-whop-webhooks)

---

## ⚙️ PASO 5: CONFIGURAR VARIABLES DE ENTORNO

### En Vercel (Production):

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables** y añade:

```bash
# Whop Configuration (servidor)
WHOP_API_KEY=tu_api_key_de_whop
WHOP_COMPANY_ID=tu_company_id
WHOP_PLAN_ID=tu_plan_id_mensual
WHOP_WEBHOOK_SECRET=tu_webhook_secret
WHOP_MODE=production

# Whop Configuration (público - REQUERIDO para checkout embebido)
NEXT_PUBLIC_WHOP_PLAN_ID=tu_plan_id_mensual

# App URL
NEXT_PUBLIC_APP_URL=https://mindmetric.io

# Database (Railway)
DATABASE_URL=postgresql://postgres:...@switchback.proxy.rlwy.net:58127/railway
```

⚠️ **IMPORTANTE:** La variable `NEXT_PUBLIC_WHOP_PLAN_ID` debe ser la **misma** que `WHOP_PLAN_ID` pero con el prefijo `NEXT_PUBLIC_` para que sea accesible desde el cliente (necesaria para el checkout embebido).

### En Railway (Database ya configurado):

Las variables de Whop se leen desde Vercel. Railway solo necesita `DATABASE_URL`.

---

## 📍 PASO 6: OBTENER COMPANY ID

1. En tu Dashboard de Whop, haz clic en tu **perfil** (esquina superior derecha)
2. Ve a **Company Settings**
3. Copia tu **Company ID**

---

## 🧪 PASO 7: TESTING

### Modo Test:

1. Whop tiene un **modo sandbox** para pruebas
2. Configura `WHOP_MODE=test` en variables de entorno
3. Usa tarjetas de prueba de Whop

### Tarjetas de Prueba:

- **Éxito:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **CVV:** Cualquier 3 dígitos
- **Fecha:** Cualquier fecha futura

---

## 🔄 PASO 8: CAMBIAR A PRODUCCIÓN

Cuando estés listo para aceptar pagos reales:

1. Verifica tu identidad en Whop (KYC)
2. Configura método de pago en Whop
3. Cambia `WHOP_MODE=production` en Vercel
4. Redeploy tu aplicación

---

## 🎯 CHECKOUT EMBEBIDO (IFRAME)

MindMetric utiliza el **checkout embebido de Whop** para ofrecer una experiencia de pago integrada sin redirecciones externas.

### 📦 Paquete NPM:

```bash
npm install @whop/checkout
```

### 🔧 Implementación:

El checkout se implementa usando el componente oficial de React:

```tsx
import { WhopCheckoutEmbed } from '@whop/checkout/react'

<WhopCheckoutEmbed
  planId={process.env.NEXT_PUBLIC_WHOP_PLAN_ID}
  prefill={{ email: userEmail }}
  theme="light"
  returnUrl={`${window.location.origin}/${lang}/resultado`}
  onComplete={(payment) => {
    // Guardar estado de pago
    localStorage.setItem('paymentCompleted', 'true')
    // Redirigir a resultados
    router.push(`/${lang}/resultado`)
  }}
/>
```

### ✅ Ventajas:

- **Sin popups bloqueados** por el navegador
- **Sin redirecciones** externas (mejor UX)
- **Email pre-rellenado** automáticamente
- **Callback inmediato** al completar el pago
- **Totalmente responsive** en móvil y desktop
- **Integrado** en el diseño de la web

### 📖 Documentación Oficial:

[https://docs.whop.com/payments/checkout-embed](https://docs.whop.com/payments/checkout-embed)

---

## 📊 FLUJO DE PAGO COMPLETO

```
1. Usuario completa test
   ↓
2. Click en "Desbloquear Resultado"
   ↓
3. Usuario redirigido a /checkout
   ↓
4. Se carga el checkout embebido de Whop (iframe)
   - Email pre-rellenado
   - Formulario de pago integrado en la web
   ↓
5. Usuario paga €1.00 dentro del iframe
   ↓
6. Whop activa membresía con trial de 2 días
   ↓
7. Callback onComplete() se ejecuta automáticamente
   ↓
8. Usuario redirigido a /resultado
   ↓
9. Whop envía webhook "membership.went_valid"
   ↓
10. App recibe webhook y actualiza BD
   ↓
11. App envía emails de bienvenida
   ↓
12. Usuario accede a resultados completos
```

---

## 🎯 MODELO DE NEGOCIO

### Actual:
- **Pago inicial:** €1.00
- **Trial:** 2 días gratis
- **Después del trial:** €9.99/mes (o el precio que configures)
- **Cancelación:** En cualquier momento

### Comisiones de Whop:
- **3% de comisión** + comisiones del procesador de pagos
- Sin costos mensuales
- Sin costos de setup

---

## 📚 RECURSOS ÚTILES

### Documentación de Whop:
- **API Docs:** [https://docs.whop.com/developer/api/getting-started](https://docs.whop.com/developer/api/getting-started)
- **SDK Reference:** [https://dev.whop.com/sdk/api](https://dev.whop.com/sdk/api)
- **Webhooks Guide:** [https://help.whop.com/en/articles/11436427-how-to-use-whop-webhooks](https://help.whop.com/en/articles/11436427-how-to-use-whop-webhooks)
- **Dashboard:** [https://whop.com/dashboard](https://whop.com/dashboard)

### Soporte:
- **Email:** support@whop.com
- **Discord:** [Whop Community](https://discord.gg/whop)

---

## ⚠️ IMPORTANTE

### Antes de ir a producción:

1. ✅ Crear productos en Whop dashboard
2. ✅ Obtener API Key
3. ✅ Configurar webhooks
4. ✅ Añadir variables de entorno en Vercel
5. ✅ Verificar identidad en Whop (KYC)
6. ✅ Probar checkout en modo test
7. ✅ Verificar que webhooks funcionen
8. ✅ Cambiar a modo production

### Checklist de Variables:

```bash
WHOP_API_KEY=sk_... ✅
WHOP_COMPANY_ID=comp_... ✅
WHOP_PLAN_ID=plan_... ✅
WHOP_WEBHOOK_SECRET=whsec_... ✅
WHOP_MODE=production ✅
NEXT_PUBLIC_APP_URL=https://mindmetric.io ✅
DATABASE_URL=postgresql://... ✅
```

---

## 🔧 TROUBLESHOOTING

### Error: "WHOP_API_KEY no configurada"
**Solución:** Añade la API Key en variables de entorno de Vercel y redeploy.

### Error: "WHOP_PLAN_ID no configurada"
**Solución:** Crea el producto en Whop, copia el Plan ID y añádelo a variables de entorno.

### Webhook no se recibe:
**Solución:** 
1. Verifica que la URL del webhook sea correcta
2. Comprueba que los eventos estén seleccionados
3. Revisa los logs en Whop dashboard

### Pago no crea membresía:
**Solución:**
1. Verifica que el producto tenga configurado el trial
2. Comprueba que el webhook esté activo
3. Revisa los logs de `/api/whop/webhook`

---

## ✅ MIGRACIÓN DE STRIPE COMPLETA

### Archivos creados:
- ✅ `lib/whop-config.ts` - Configuración centralizada
- ✅ `app/api/whop/create-checkout/route.ts` - Crear checkout
- ✅ `app/api/whop/webhook/route.ts` - Recibir eventos
- ✅ `app/[lang]/checkout/checkout-whop.tsx` - UI de checkout

### Archivos modificados:
- ✅ `app/[lang]/checkout-stripe/page.tsx` - Redirige a Whop
- ✅ `app/[lang]/checkout/checkout-router.tsx` - Actualizado mensaje

### Base de datos:
- ✅ `trial_days` actualizado de 15 a **2 días**
- ✅ `initial_payment` mantenido en **€1.00**

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Una vez completados todos los pasos, tu aplicación estará lista para aceptar pagos a través de Whop.

**Fecha de migración:** 7 de Enero de 2026  
**Versión:** 2.0.0 (Whop Integration)

---

**¿Preguntas? Consulta la [documentación de Whop](https://docs.whop.com/) o contacta con su soporte.**

