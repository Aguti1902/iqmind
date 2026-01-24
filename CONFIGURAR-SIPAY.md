# 💳 Configuración de Sipay para MindMetric

Guía completa para integrar Sipay como pasarela de pagos en MindMetric.

---

## 📋 Índice

1. [Resumen](#resumen)
2. [Requisitos Previos](#requisitos-previos)
3. [Configuración de Credenciales](#configuración-de-credenciales)
4. [Variables de Entorno](#variables-de-entorno)
5. [Arquitectura de la Integración](#arquitectura-de-la-integración)
6. [Flujo de Pago](#flujo-de-pago)
7. [Tarjetas de Prueba (Sandbox)](#tarjetas-de-prueba-sandbox)
8. [Endpoints Creados](#endpoints-creados)
9. [Testing](#testing)
10. [Deploy a Producción](#deploy-a-producción)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen

**Sipay** es una pasarela de pagos europea que soporta:

- ✅ Pagos con tarjeta (Visa, Mastercard)
- ✅ Tokenización para pagos recurrentes
- ✅ Apple Pay
- ✅ Google Pay
- ✅ Devoluciones (refunds)
- ✅ Autenticación 3D Secure (EMV3DS 2.2)

**Entorno Sandbox:** `https://sandbox.sipay.es`

---

## 📦 Requisitos Previos

Para completar la integración necesitas solicitar a Sipay:

### 1. Alta de Cliente y Establecimiento

Completa el formulario de alta en Sipay con:
- Nombre de la empresa: **MindMetric**
- URL del sitio web: **https://mindmetric.io**
- Tipo de negocio: **Tests psicológicos online**
- Email de contacto
- Teléfono
- DNI/NIF

### 2. Recurso MSTK (Identidad y Resource)

Solicita la configuración del recurso MSTK para:
- Tokenización de tarjetas (mdwr + fpay + payment wall)
- Google Pay
- Apple Pay

### 3. Backoffice Sipay (SUWE)

Para visualizar transacciones, proporciona:
- **Nombre y apellidos:** Tu nombre completo
- **Email:** Buzón de correo con acceso para reseteos y 2FA
- **Teléfono:** Tu número de contacto
- **DNI:** Tu documento de identidad

---

## 🔐 Configuración de Credenciales

Una vez que Sipay te proporcione las credenciales, recibirás:

```
API Key: xxxx-xxxx-xxxx-xxxx
API Secret: xxxxxxxxxxxxxxxx
Resource ID: xxxxxxxxxxxxxxxx
Endpoint: https://sandbox.sipay.es (o https://api.sipay.es para producción)
```

---

## 🔧 Variables de Entorno

Configura estas variables en Vercel (o en tu `.env.local` para desarrollo):

### Desarrollo Local (`.env.local`):

```bash
# Sipay Configuration
SIPAY_API_KEY=tu_api_key_aqui
SIPAY_API_SECRET=tu_api_secret_aqui
SIPAY_RESOURCE=tu_resource_id_aqui
SIPAY_ENDPOINT=https://sandbox.sipay.es

# Claves públicas para el frontend
NEXT_PUBLIC_SIPAY_KEY=tu_api_key_aqui
NEXT_PUBLIC_SIPAY_RESOURCE=tu_resource_id_aqui
NEXT_PUBLIC_SIPAY_ENDPOINT=https://sandbox.sipay.es
```

### Producción (Vercel):

```bash
vercel env add SIPAY_API_KEY production
vercel env add SIPAY_API_SECRET production
vercel env add SIPAY_RESOURCE production
vercel env add SIPAY_ENDPOINT production
vercel env add NEXT_PUBLIC_SIPAY_KEY production
vercel env add NEXT_PUBLIC_SIPAY_RESOURCE production
vercel env add NEXT_PUBLIC_SIPAY_ENDPOINT production
```

---

## 🏗️ Arquitectura de la Integración

### Archivos Creados:

```
lib/
  └── sipay-client.ts              # Cliente de Sipay (servidor)

app/api/sipay/
  ├── create-payment/route.ts      # Crear pago inicial
  ├── process-payment/route.ts     # Procesar pago + tokenización
  ├── recurring-payment/route.ts   # Pagos recurrentes (MIT)
  ├── refund/route.ts              # Devoluciones
  ├── card-info/route.ts           # Consultar tarjeta
  ├── delete-card/route.ts         # Eliminar token de tarjeta
  ├── apple-pay/route.ts           # Pagos con Apple Pay
  └── google-pay/route.ts          # Pagos con Google Pay

app/[lang]/checkout/
  └── checkout-sipay.tsx           # Componente de checkout frontend
```

---

## 💰 Flujo de Pago

### 1. **Pago Inicial con Tokenización**

Usuario completa el test → Checkout → Sipay → Token guardado

```mermaid
Usuario → Checkout Sipay → API create-payment → Formulario Sipay → Autorización + Token → Return URL → BD
```

**Monto:** 0,50€  
**Trial:** 2 días gratis  
**Después:** 9,99€/mes automático

### 2. **Pagos Recurrentes (MIT)**

Sistema cobra automáticamente usando el token guardado

```mermaid
Cron Job → recurring-payment API → Sipay MIT → Cobro sin presencia del cliente → BD actualizada
```

### 3. **Devoluciones**

Usuario solicita reembolso → Sistema procesa → Sipay devuelve dinero

```mermaid
Usuario → Solicitud de reembolso → API refund → Sipay → Reembolso procesado → BD + Email
```

---

## 🧪 Tarjetas de Prueba (Sandbox)

### Tarjetas para Pruebas:

| Marca | Número | Caducidad | CVV | Caso de Uso |
|-------|--------|-----------|-----|-------------|
| **VISA** | `4548819407777774` | 12/25 | 123 | Pago exitoso con 3DS 2.2 |
| **VISA** | `4548810000000003` | 12/49 | 123 | Pago exitoso con 3DS 2.2 |
| **Mastercard** | `5576 4415 6304 5037` | 12/49 | 123 | Pago exitoso con 3DS 2.1 |

### Códigos CVV Especiales:

| CVV | Resultado |
|-----|-----------|
| `999` | Denegada - Autenticación exitosa |
| `172` | Denegada - No repetir |
| `173` | Denegada - No repetir sin actualizar datos |
| `174` | Denegada - No repetir hasta 72 horas |

### Códigos de Error por Importe:

| Importe | Resultado |
|---------|-----------|
| `X,96€` | Denegación genérica |
| `X,72€` | Error de conexión |
| `X,73€` | Error de autenticación |
| `X,74€` | Tiempo de espera agotado |

**Documentación completa:** https://developer.sipay.es/docs/documentation/testing/response_codes

---

## 🔌 Endpoints Creados

### API Backend:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/sipay/create-payment` | POST | Crear pago inicial |
| `/api/sipay/process-payment` | POST | Procesar pago + tokenización |
| `/api/sipay/recurring-payment` | POST | Cobro recurrente (MIT) |
| `/api/sipay/refund` | POST | Procesar devolución |
| `/api/sipay/card-info` | POST | Consultar datos de token |
| `/api/sipay/delete-card` | POST | Eliminar token |
| `/api/sipay/apple-pay` | POST | Pago con Apple Pay |
| `/api/sipay/google-pay` | POST | Pago con Google Pay |

**Nota:** Sipay NO utiliza webhooks. Las notificaciones de pago se manejan mediante las URLs de retorno (`returnUrl` y `cancelUrl`).

### Frontend:

| Ruta | Componente |
|------|------------|
| `/[lang]/checkout` | Checkout con Sipay (formulario embebido) |

---

## 🧪 Testing

### 1. Probar Pago Inicial

```bash
curl -X POST https://mindmetric.io/api/sipay/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mindmetric.io",
    "amount": 0.50,
    "userName": "Usuario Test",
    "userIQ": 120,
    "lang": "es"
  }'
```

### 2. Ver Logs

```bash
vercel logs --follow
```

O desde Vercel Dashboard → Tu proyecto → Logs

---

## 🚀 Deploy a Producción

### Paso 1: Configurar Variables en Vercel

```bash
# Configurar en producción
vercel env add SIPAY_API_KEY production
vercel env add SIPAY_API_SECRET production
vercel env add SIPAY_RESOURCE production
vercel env add SIPAY_ENDPOINT production

# Configurar para preview/development también
vercel env add SIPAY_API_KEY preview
vercel env add SIPAY_API_KEY development
```

### Paso 2: Actualizar Endpoint a Producción

Cambiar en las variables de entorno:
```
SIPAY_ENDPOINT=https://api.sipay.es
```

### Paso 3: Deploy

```bash
git add .
git commit -m "Add Sipay payment integration"
git push
```

Vercel desplegará automáticamente.

---

## 🔧 Troubleshooting

### Error: "Sipay configuration is missing"

**Causa:** Variables de entorno no configuradas

**Solución:**
```bash
vercel env ls  # Verificar variables
vercel env add SIPAY_API_KEY production  # Agregar las que falten
```

### Error: "Card token not found"

**Causa:** Token no guardado en BD

**Solución:**
1. Verificar que el usuario complete el pago correctamente
2. Revisar logs: `vercel logs --follow`
3. Verificar que `subscriptionId` se guarde en la BD después del return URL
4. Verificar que el proceso de tokenización en `/api/sipay/process-payment` funcione correctamente

### Pagos Recurrentes No Funcionan

**Causa:** Token de tarjeta no válido o expirado

**Solución:**
1. Verificar que el usuario tenga `subscriptionId` en BD
2. Consultar estado del token: `/api/sipay/card-info`
3. Solicitar al usuario actualizar su tarjeta

---

## 📚 Documentación de Referencia

### Documentación Oficial Sipay:
- **Documentación oficial:** https://developer.sipay.es/docs/
- **Tarjeta (Frontend):** https://developer.sipay.es/docs/documentation/online/selling/only_card
- **Autorización + Tokenización:** https://developer.sipay.es/docs/api/mdwr/allinone#2-autorizaci%C3%B3n-con-autenticaci%C3%B3n-con-almacenamiento-de-tarjeta-tokenizaci%C3%B3n
- **Pagos MIT:** https://developer.sipay.es/docs/api/mdwr/allinone#4-autorizaci%C3%B3n-con-exenci%C3%B3n-mit-r
- **Devoluciones:** https://developer.sipay.es/docs/api/mdwr/refund
- **Gestión de Tokens - Borrado:** https://developer.sipay.es/docs/api/mdwr/unregister
- **Gestión de Tokens - Consulta:** https://developer.sipay.es/docs/api/mdwr/card
- **Apple Pay:** https://developer.sipay.es/docs/documentation/online/selling/wallets/apay
- **Google Pay:** https://developer.sipay.es/docs/documentation/online/selling/wallets/gpay

### Documentación Interna MindMetric:
- **`SIPAY-GUIA-COMPLETA-OFICIAL.md`** - Guía completa con todos los detalles
- **`SIPAY-PROXIMOS-PASOS.md`** - Checklist de implementación paso a paso
- **`sipay-example-integration.html`** - Ejemplo HTML completo funcional
- **`test-sipay-integration.js`** - Script para probar todos los endpoints
- **`SIPAY-VARIABLES-ENTORNO.md`** - Configuración de variables de entorno

---

## ✅ Checklist de Implementación

- [ ] Solicitar credenciales a Sipay
- [ ] Configurar variables de entorno
- [ ] Probar pago en sandbox
- [ ] Probar tokenización
- [ ] Probar pagos recurrentes
- [ ] Probar devoluciones
- [ ] Configurar URLs de retorno
- [ ] Probar Apple Pay
- [ ] Probar Google Pay
- [ ] Deploy a producción
- [ ] Configurar credenciales de producción
- [ ] Realizar prueba end-to-end en producción
- [ ] Monitorear primeros pagos reales

**Nota importante:** Sipay NO usa webhooks. Las notificaciones se manejan mediante las URLs de retorno configuradas en cada pago.

---

---

## 🚀 Empezar Ahora

### Ruta Recomendada:

1. **Lee primero:** `SIPAY-PROXIMOS-PASOS.md` (checklist completo)
2. **Consulta detalles:** `SIPAY-GUIA-COMPLETA-OFICIAL.md` (guía técnica)
3. **Mira ejemplo:** `sipay-example-integration.html` (código funcional)
4. **Prueba endpoints:** `node test-sipay-integration.js`

---

**Última actualización:** Enero 2026  
**Estado:** ✅ Integración completa implementada  
**Próximo paso:** Ver `SIPAY-PROXIMOS-PASOS.md`

