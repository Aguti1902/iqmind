# 🚀 Guía de Configuración de FastSpring

## ⚠️ IMPORTANTE: Protección Anti-Fraude

**Stripe cerró tu cuenta por alto riesgo de disputas**. FastSpring también puede cerrarte la cuenta si detectan patrones sospechosos. Este setup incluye protecciones esenciales.

---

## 📋 Requisitos Previos

1. **Cuenta de FastSpring creada** ✅ (Ya la tienes)
2. **Producto configurado**: `iqmind-premium-access`
3. **Storefront configurado**: Popup Storefront
4. **Credenciales API**: Username y Password

---

## 🔑 1. Configurar Variables de Entorno

Añade estas variables a tu `.env.local` y a **Vercel**:

```bash
# FastSpring - Público (Frontend)
NEXT_PUBLIC_FASTSPRING_STOREFRONT=tu-store.onfastspring.com/popup-storefront

# FastSpring - Privado (Backend)
FASTSPRING_API_USERNAME=tu_api_username
FASTSPRING_API_PASSWORD=tu_api_password
FASTSPRING_WEBHOOK_SECRET=tu_webhook_secret

# Configuración del proveedor de pago
PAYMENT_PROVIDER=fastspring
```

### 📍 Dónde encontrar las credenciales:

1. **Storefront URL**:
   - FastSpring Dashboard → Storefronts → Tu storefront → Copy URL
   - Ejemplo: `mystore.onfastspring.com/popup-storefront`

2. **API Credentials**:
   - FastSpring Dashboard → Integrations → API Credentials
   - Create New Credentials si no tienes
   - Guarda Username y Password

3. **Webhook Secret** (opcional):
   - FastSpring Dashboard → Integrations → Webhooks → Create
   - Usa HMAC signature para mayor seguridad

---

## 🏗️ 2. Configurar Producto en FastSpring

### Crear el Producto

1. Ir a **Products** en FastSpring Dashboard
2. Create New Product:
   - **Product Path**: `iqmind-premium-access` (exacto)
   - **Display Name**: "IQMind Premium Access"
   - **Fulfillment Type**: "Licensed Product" o "Service"

### Configurar Precio

1. **Setup Fee** (cargo inicial):
   - Amount: **€0.50**
   - Description: "Test Result Unlock"

2. **Recurring Subscription**:
   - **Trial Period**: 2 días
   - **Price**: €9.99/mes
   - **Billing Frequency**: Monthly

3. **Trial Behavior**:
   - ✅ Charge setup fee immediately
   - ✅ Start trial after setup fee
   - ✅ Auto-convert to paid after trial

### Configurar Cancelaciones

- ✅ Allow customer cancellation
- ✅ Immediate cancellation (or end of period)
- ✅ Full transparency

---

## 🔗 3. Configurar Webhooks

1. Ir a **Integrations → Webhooks** en FastSpring
2. Create New Webhook:
   - **URL**: `https://tu-dominio.com/api/fastspring-webhook`
   - **Events** a suscribir:
     - ✅ `order.completed`
     - ✅ `subscription.activated`
     - ✅ `subscription.charge.completed`
     - ✅ `subscription.charge.failed`
     - ✅ `subscription.canceled`
     - ✅ `subscription.deactivated`
     - ✅ `return.created`

3. **Security** (recomendado):
   - Enable HMAC signature
   - Guardar el secret en `FASTSPRING_WEBHOOK_SECRET`

---

## 🗄️ 4. Configurar Base de Datos

Añade las configuraciones de FastSpring a la tabla `site_config`:

```sql
-- Cambiar proveedor de pago a FastSpring
INSERT INTO site_config (key, value, description) 
VALUES ('payment_provider', 'fastspring', 'Payment provider: stripe, fastspring, or lemonsqueezy')
ON CONFLICT (key) DO UPDATE SET value = 'fastspring';

-- Configuración de FastSpring
INSERT INTO site_config (key, value, description) 
VALUES 
  ('fastspring_storefront', 'tu-store.onfastspring.com/popup-storefront', 'FastSpring Storefront URL'),
  ('fastspring_api_username', 'tu_api_username', 'FastSpring API Username'),
  ('fastspring_api_password', 'tu_api_password', 'FastSpring API Password'),
  ('fastspring_webhook_secret', 'tu_webhook_secret', 'FastSpring Webhook Secret (optional)'),
  ('fastspring_product_path', 'iqmind-premium-access', 'FastSpring Product Path')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

**O usar el panel de administración**:
- Ir a `/admin` en tu app
- Configurar FastSpring desde ahí

---

## 🧪 5. Testing

### Test Mode

FastSpring tiene modo test integrado:

1. En Dashboard → Settings → Test Data
2. Enable Test Mode
3. Usar tarjetas de prueba:
   - **Visa**: `4111 1111 1111 1111`
   - **Mastercard**: `5555 5555 5555 4444`
   - CVV: cualquier 3 dígitos
   - Fecha: cualquier fecha futura

### Test del Flujo Completo

```bash
# 1. Hacer un test de IQ en tu app
# 2. Llegar al checkout
# 3. Usar email de prueba: test@example.com
# 4. Completar pago con tarjeta de prueba
# 5. Verificar webhook recibido
# 6. Verificar usuario creado en BD
# 7. Verificar email enviado
```

---

## 🛡️ 6. Sistema Anti-Fraude (CRÍTICO)

El sistema anti-fraude está activo por defecto. Verifica que esté funcionando:

### Protecciones Implementadas

1. **Tiempo del test**:
   - Mínimo: 3 minutos (180 segundos)
   - Máximo: 1 hora (3600 segundos)

2. **Límites de compra**:
   - 1 compra por email
   - 2 compras por IP

3. **Emails temporales bloqueados**:
   - tempmail.com, mailinator.com, yopmail.com, etc.

4. **Detección de bots**:
   - 40+ respuestas correctas = bot
   - 80%+ respuestas iguales = bot

5. **Tracking de IPs**:
   - Máximo 3 tests por IP/día
   - Máximo 5 tests por IP/semana

### Ajustar Límites

Edita `/lib/fraud-detection.ts` para ajustar:

```typescript
const FRAUD_CONFIG = {
  maxTestsPerIP: 3,              // Cambiar si es muy restrictivo
  minTimeToComplete: 180,        // Aumentar si detectas más bots
  maxPurchasesPerEmail: 1,       // Mantener en 1
  // ...
}
```

### Monitorear Intentos Fraudulentos

Los intentos bloqueados se registran en logs:

```bash
# Ver logs en Vercel
vercel logs

# Buscar:
⚠️ [FRAUD] Intento sospechoso detectado
```

---

## 📊 7. Dashboard de Admin

Accede al panel de admin para monitorear:

- `/admin` (requiere email de admin configurado)

### Métricas Importantes

- **Ratio de disputas**: Debe ser < 0.75%
- **Ratio de reembolsos**: Debe ser < 5%
- **Ratio de conversión**: Test → Pago
- **Usuarios activos vs cancelados**

---

## 🚨 8. Prevenir Cierre de Cuenta

### Acciones Inmediatas

1. **Monitorear disputas diariamente**
2. **Responder a disputas en < 24h**
3. **Política de reembolsos clara** (14 días)
4. **Mejorar descripción del producto**
5. **Añadir FAQ en checkout**

### Red Flags para FastSpring

⚠️ **FastSpring cerrará tu cuenta si**:
- Ratio de disputas > 1%
- Reembolsos excesivos (> 10%)
- Productos no entregados
- Descripción engañosa
- Violación de términos

### Buenas Prácticas

✅ **HACER**:
- Descripción clara del servicio
- Trial period transparente
- Cancelación fácil
- Soporte rápido
- Email de bienvenida con instrucciones

❌ **NO HACER**:
- Ocultar cargos recurrentes
- Dificultar cancelaciones
- Ignorar solicitudes de soporte
- Marketing engañoso
- Vender a menores

---

## 🔄 9. Migración desde Stripe

### Usuarios Existentes

Si tienes usuarios con Stripe activo:

```sql
-- NO MIGRAR usuarios existentes automáticamente
-- Dejar que terminen su ciclo en Stripe
-- Nuevos usuarios irán a FastSpring

-- Ver usuarios activos en Stripe:
SELECT email, subscription_status, trial_end_date 
FROM users 
WHERE subscription_status IN ('trial', 'active')
AND subscription_id LIKE 'sub_%';  -- IDs de Stripe empiezan con sub_
```

### Dual Payment Setup (Opcional)

Puedes mantener ambos temporalmente:

```typescript
// En checkout/page.tsx
const provider = userHasStripeSubscription 
  ? 'stripe' 
  : 'fastspring'
```

---

## 📱 10. Testing en Producción

### Checklist Pre-Launch

- [ ] Variables de entorno configuradas en Vercel
- [ ] Webhook URL configurada en FastSpring
- [ ] Producto activo en FastSpring
- [ ] Test de pago completado exitosamente
- [ ] Email de bienvenida recibido
- [ ] Usuario creado en BD con acceso
- [ ] Sistema anti-fraude activo
- [ ] Logs de Vercel monitoreados

### First 24 Hours

1. **Monitorear cada venta**
2. **Verificar webhooks llegan**
3. **Verificar emails se envían**
4. **Revisar logs de fraude**
5. **Responder soporte inmediato**

---

## 🆘 Troubleshooting

### El checkout no carga

```bash
# Verificar en consola del navegador:
# Error: "storefront not found"
→ Revisar NEXT_PUBLIC_FASTSPRING_STOREFRONT

# Error: "product not found"
→ Verificar que product path = 'iqmind-premium-access'
```

### Webhooks no llegan

```bash
# 1. Verificar URL en FastSpring Dashboard
# 2. Verificar logs de Vercel:
vercel logs --follow

# 3. Test webhook manualmente:
curl -X POST https://tu-dominio.com/api/fastspring-webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"order.completed","data":{"id":"test"}}]}'
```

### Usuario no recibe email

```bash
# Verificar configuración de email en /lib/email-service.ts
# Verificar RESEND_API_KEY en variables de entorno
# Ver logs de Resend Dashboard
```

### Pago se procesa pero no da acceso

```bash
# 1. Verificar que webhook llegó:
vercel logs | grep "fastspring-webhook"

# 2. Verificar usuario en BD:
SELECT * FROM users WHERE email = 'test@example.com';

# 3. Verificar subscription_id guardado
```

---

## 📞 Soporte

### FastSpring Support

- Email: support@fastspring.com
- Dashboard: Help → Submit Ticket
- Documentación: https://fastspring.com/docs

### Recursos

- API Docs: https://fastspring.com/docs/api
- Builder SDK: https://fastspring.com/docs/popup-storefronts
- Webhooks: https://fastspring.com/docs/webhooks

---

## ✅ Checklist Final

Antes de activar FastSpring en producción:

- [ ] Credenciales configuradas
- [ ] Producto configurado con trial de 2 días
- [ ] Webhooks configurados y probados
- [ ] Sistema anti-fraude activo
- [ ] Emails de bienvenida funcionando
- [ ] Panel de admin accesible
- [ ] Test completo realizado
- [ ] Monitoreo de disputas configurado
- [ ] Política de reembolsos actualizada
- [ ] Términos y condiciones actualizados (mencionar FastSpring)

---

## 🎯 Próximos Pasos

1. **Configurar credenciales** en Vercel
2. **Configurar producto** en FastSpring Dashboard
3. **Configurar webhooks** con URL de producción
4. **Hacer test completo** en modo test
5. **Activar en producción**
6. **Monitorear primeras 24h intensivamente**

---

¿Necesitas ayuda? Revisa los logs:

```bash
# Logs del servidor
vercel logs --follow

# Logs del navegador
Console → buscar "FastSpring" o "checkout"
```

**¡Buena suerte! 🚀**

