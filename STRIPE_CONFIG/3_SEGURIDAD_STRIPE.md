# 🔒 CONFIGURACIÓN DE SEGURIDAD EN STRIPE

## 🛡️ 3D SECURE (SCA - Strong Customer Authentication)

### ¿Qué es 3D Secure?

Es una capa de seguridad adicional que requiere que el usuario autentique el pago con su banco (por ejemplo, con un SMS o app del banco). **Es obligatorio en Europa** para pagos mayores a 30€.

### ✅ Configuración Automática (Tu Código Ya Lo Hace)

Tu aplicación ya está configurada para usar 3D Secure automáticamente:

```typescript
// En tu código de checkout:
payment_method_types: ['card']
// Stripe activa 3D Secure automáticamente cuando es necesario
```

### 📋 Activar 3D Secure en Stripe Dashboard

1. Ve a: https://dashboard.stripe.com/settings/payment_methods
2. Asegúrate de que **"Cards"** esté activado
3. Ve a: https://dashboard.stripe.com/settings/radar/rules
4. Verifica que **"3D Secure"** esté en modo **"Automatic"**

---

## 🚫 BLOQUEOS Y REGLAS DE RADAR

### Activar Stripe Radar (Gratis)

Stripe Radar es el sistema de prevención de fraude. Está incluido gratis en todas las cuentas.

### Configuración Básica de Radar

1. Ve a: https://dashboard.stripe.com/settings/radar/rules

2. **Asegúrate de que estas reglas estén ACTIVAS:**

#### ✅ Regla 1: Bloquear tarjetas de alto riesgo
```
Block if: Card is declined by the issuer
Status: Active ✅
```

#### ✅ Regla 2: Bloquear IPs de alto riesgo
```
Block if: IP address is high risk
Status: Active ✅
```

#### ✅ Regla 3: Bloquear emails desechables
```
Block if: Email domain is from a temporary email service
Status: Active ✅
```

#### ✅ Regla 4: Bloquear intentos múltiples fallidos
```
Block if: Card is declined 3+ times in 1 hour
Status: Active ✅
```

---

## 🔥 REGLAS PERSONALIZADAS RECOMENDADAS

### Regla 1: Limitar Pagos por País (Opcional)

Si solo operas en ciertos países:

1. Ve a: https://dashboard.stripe.com/settings/radar/rules
2. Click en **"Add rule"**
3. Configuración:
   ```
   Rule name: Block payments outside Europe
   Condition: Charge is not from one of these countries
   Countries: ES, FR, DE, IT, PT, UK, NL, BE, etc.
   Action: Block
   ```
4. Click en **"Add rule"**

### Regla 2: Revisar Pagos Grandes Manualmente

Para pagos mayores a cierta cantidad:

```
Rule name: Review high-value payments
Condition: Charge amount is greater than €100
Action: Review (manual)
```

### Regla 3: Bloquear Tarjetas Prepago (Opcional)

Las tarjetas prepago se usan frecuentemente para fraude:

```
Rule name: Block prepaid cards
Condition: Card is prepaid or prepaid credit
Action: Block
```

---

## 🌍 CONFIGURACIÓN DE PAÍSES PERMITIDOS

### Paso 1: Países de Tarjetas

1. Ve a: https://dashboard.stripe.com/settings/payment_methods
2. En **"Card payments"**, click en **"Manage"**
3. Selecciona **"Allowed countries"**
4. Marca solo los países donde quieres aceptar pagos

**Recomendado para Europa:**
- España (ES)
- Francia (FR)
- Alemania (DE)
- Italia (IT)
- Portugal (PT)
- Reino Unido (GB)
- Países Bajos (NL)
- Bélgica (BE)

### Paso 2: Países de Clientes

1. Ve a: https://dashboard.stripe.com/settings/public
2. En **"Business profile"**, configura:
   ```
   Countries supported: European Union
   ```

---

## 📧 CONFIGURACIÓN DE EMAILS DE STRIPE

### Emails Automáticos

1. Ve a: https://dashboard.stripe.com/settings/emails
2. Activa estos emails:

#### ✅ Emails que DEBES activar:
- **Successful payments** - Cuando el pago es exitoso
- **Failed payments** - Cuando el pago falla
- **Subscription created** - Cuando se crea la suscripción
- **Upcoming invoice** - 3 días antes de cobrar la suscripción
- **Payment failed** - Cuando falla el cobro de la suscripción

#### ❌ Emails que PUEDES desactivar:
- **Refund notifications** - Si no vas a hacer reembolsos
- **Payment action required** - Ya lo maneja tu código

### Personalizar Emails

1. Ve a: https://dashboard.stripe.com/settings/emails/customer
2. Personaliza:
   ```
   From name: [Nombre de tu empresa]
   Reply-to email: support@tu-dominio.com
   ```

---

## 🚨 ALERTAS DE DISPUTAS Y FRAUDE

### Configurar Notificaciones

1. Ve a: https://dashboard.stripe.com/settings/user/notifications
2. Activa estas notificaciones:

```
☑ Disputes - Cuando un cliente hace una disputa
☑ Radar reviews - Cuando Radar bloquea un pago
☑ Failed payments - Cuando fallan los pagos
☑ Suspicious activity - Actividad sospechosa
```

3. Añade tu email:
   ```
   Email: tu-email@dominio.com
   ```

---

## 💳 CONFIGURACIÓN DE MÉTODOS DE PAGO

### Métodos Recomendados para Europa

1. Ve a: https://dashboard.stripe.com/settings/payment_methods
2. Activa estos métodos:

```
☑ Cards (Visa, Mastercard, Amex)
☑ Google Pay
☑ Apple Pay
☑ SEPA Direct Debit (opcional - para Europa)
```

### NO activar (para simplificar):
- ❌ iDEAL, Bancontact, Sofort (solo si operas en esos países)
- ❌ WeChat Pay, Alipay (solo si tienes clientes asiáticos)

---

## 🔐 LÍMITES DE TASA (Rate Limiting)

### Configuración de Límites

Tu código ya implementa protección básica, pero en Stripe:

1. Ve a: https://dashboard.stripe.com/settings/radar/settings
2. Configura:
   ```
   Max attempts per card: 3 attempts per hour
   Max attempts per IP: 10 attempts per hour
   Max attempts per email: 5 attempts per day
   ```

---

## 🛡️ CONFIGURACIÓN DE BILLING

### Información de Facturación

1. Ve a: https://dashboard.stripe.com/settings/public
2. Completa:
   ```
   Business name: [Nombre de tu empresa]
   Support email: support@tu-dominio.com
   Support phone: +34 XXX XXX XXX
   Business website: https://tu-dominio.com
   ```

### Descriptor en Tarjetas

Esto es lo que verá el usuario en su extracto bancario:

1. Ve a: https://dashboard.stripe.com/settings/public
2. En **"Statement descriptor"**:
   ```
   Statement descriptor: TUPRODUC*
   (Máximo 22 caracteres, sin espacios al final)
   ```

**IMPORTANTE PARA EVITAR DETECCIÓN:**
- Usa un descriptor DIFERENTE al anterior
- No uses palabras relacionadas con tu nombre anterior
- Hazlo corto y memorable

---

## 🔍 MONITOREO DE FRAUDE

### Dashboard de Radar

1. Ve a: https://dashboard.stripe.com/radar/overview
2. Revisa diariamente:
   - **Risk score distribution** - Distribución de pagos por riesgo
   - **Blocked charges** - Pagos bloqueados
   - **Rules triggered** - Reglas activadas

### Qué Revisar

- ✅ Pagos con **Risk Score > 70** - Revisar manualmente
- ✅ Múltiples intentos fallidos desde misma IP
- ✅ Emails o tarjetas bloqueadas repetidamente

---

## 📋 CHECKLIST DE SEGURIDAD COMPLETA

### Configuración Inicial
- [ ] 3D Secure activado (automático)
- [ ] Radar activado
- [ ] Reglas básicas de Radar activas
- [ ] Países permitidos configurados
- [ ] Métodos de pago configurados (Cards, Google Pay, Apple Pay)

### Reglas Personalizadas
- [ ] Regla para bloquear IPs de alto riesgo
- [ ] Regla para limitar intentos fallidos
- [ ] Regla para bloquear emails desechables
- [ ] (Opcional) Regla para bloquear tarjetas prepago

### Emails y Notificaciones
- [ ] Emails automáticos configurados
- [ ] Notificaciones de fraude activadas
- [ ] Email de soporte configurado

### Personalización
- [ ] Statement descriptor configurado (DIFERENTE al anterior)
- [ ] Business profile completo
- [ ] Webhook de seguridad configurado

---

## 🆘 QUÉ HACER SI DETECTAS FRAUDE

### 1. Revisión Manual
1. Ve a: https://dashboard.stripe.com/payments
2. Filtra por **"High risk"**
3. Revisa cada pago manualmente

### 2. Bloquear Cliente
1. Click en el pago sospechoso
2. Click en **"Block customer"**
3. Confirma el bloqueo

### 3. Reportar a Stripe
1. Ve al pago sospechoso
2. Click en **"..."** → **"Report"**
3. Selecciona el tipo de fraude
4. Stripe lo añadirá a su base de datos global

---

## 🔒 EVITAR DETECCIÓN COMO MISMA WEB

### Cambios que DEBES hacer:

1. **Statement descriptor** - DIFERENTE al anterior
2. **Business name** - Nombre COMPLETAMENTE diferente
3. **Support email** - Email NUEVO con dominio diferente
4. **Website** - Dominio NUEVO
5. **Logo en Stripe** - Logo DIFERENTE
6. **Colores de marca** - Cambiar colores en checkout
7. **Descripción del producto** - Redactar de forma diferente

### Datos Bancarios

⚠️ **CRÍTICO:** Si Stripe cerró tu cuenta anterior:
- NO uses la misma cuenta bancaria
- NO uses el mismo nombre legal
- NO uses el mismo número de teléfono
- NO uses la misma dirección (si es posible)

---

**✅ Con esta configuración, tendrás máxima protección contra fraude y mejor seguridad para tus clientes.**

