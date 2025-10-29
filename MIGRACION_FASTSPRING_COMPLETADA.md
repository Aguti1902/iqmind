# ✅ Migración a FastSpring - COMPLETADA

## 📦 Archivos Creados/Modificados

### Frontend
- ✅ `/app/[lang]/checkout/checkout-fastspring.tsx` - Componente de checkout con FastSpring SDK
- ✅ `/app/[lang]/checkout/page.tsx` - Router actualizado para soportar FastSpring

### Backend APIs
- ✅ `/app/api/fastspring-process-order/route.ts` - Procesa órdenes completadas
- ✅ `/app/api/fastspring-webhook/route.ts` - Maneja webhooks de FastSpring
- ✅ `/app/api/validate-before-payment/route.ts` - Sistema anti-fraude

### Librerías
- ✅ `/lib/fastspring-config.ts` - Configuración de FastSpring desde BD
- ✅ `/lib/fraud-detection.ts` - Sistema completo de detección de fraude

### Documentación
- ✅ `FASTSPRING_SETUP.md` - Guía completa de configuración
- ✅ `FASTSPRING_QUICK_START.md` - Guía rápida de 5 minutos

---

## 🔑 Qué Necesitas Configurar AHORA

### 1. Variables de Entorno en Vercel

```bash
NEXT_PUBLIC_FASTSPRING_STOREFRONT=tu-store.onfastspring.com/popup-storefront
FASTSPRING_API_USERNAME=tu_api_username
FASTSPRING_API_PASSWORD=tu_api_password
FASTSPRING_WEBHOOK_SECRET=tu_webhook_secret  # opcional pero recomendado
PAYMENT_PROVIDER=fastspring
```

### 2. En FastSpring Dashboard

**Producto** (`iqmind-premium-access`):
- Setup Fee: €0.50 (inmediato)
- Trial: 2 días (gratis)
- Recurring: €9.99/mes (después del trial)

**Webhook**:
- URL: `https://iqmind.mobi/api/fastspring-webhook`
- Events: todos los de subscription + order.completed

### 3. En tu Base de Datos

```sql
-- Cambiar a FastSpring
UPDATE site_config SET value = 'fastspring' WHERE key = 'payment_provider';

-- O usa el panel admin en /admin
```

---

## 🛡️ Sistema Anti-Fraude ACTIVO

**CRÍTICO**: Este sistema es esencial dado tu historial con Stripe.

### Protecciones Implementadas

✅ **Tiempo del test**:
- Mínimo: 3 minutos (180 seg) → bloquea bots
- Máximo: 1 hora → evita tests abandonados

✅ **Límites de compra**:
- 1 compra por email
- 2 compras por IP/día

✅ **Emails temporales bloqueados**:
- tempmail, guerrillamail, mailinator, yopmail, etc.

✅ **Detección de bots**:
- 40+ respuestas correctas = bloqueado
- 80%+ respuestas iguales = bloqueado
- Patrón sospechoso = bloqueado

✅ **Tracking de IPs**:
- Máximo 3 tests por IP/día
- Máximo 5 tests por IP/semana

### Monitoreo de Fraude

Los intentos bloqueados se registran en logs:

```bash
vercel logs --follow | grep "FRAUD"
```

---

## ⚠️ ADVERTENCIAS CRÍTICAS

### FastSpring también puede cerrar tu cuenta si:

1. **Ratio de disputas > 0.75%**
2. **Ratio de reembolsos > 5-10%**
3. **Detección de fraude o bots**
4. **Marketing engañoso**
5. **No cumplir con trial transparente**

### Acciones para Prevenir Cierre

✅ **HACER INMEDIATAMENTE**:
1. Monitorear disputas DIARIAMENTE
2. Responder soporte en < 24h
3. Política de reembolsos clara (14 días)
4. Email de bienvenida con instrucciones claras
5. Descripción transparente en checkout
6. Añadir FAQ en página de checkout

❌ **NUNCA HACER**:
1. Ocultar que es suscripción recurrente
2. Dificultar cancelaciones
3. Ignorar solicitudes de reembolso
4. Marketing agresivo o engañoso
5. Permitir bots o tests fraudulentos

---

## 🚀 Pasos Inmediatos (ORDEN)

### Día 1: Setup (HOY)

1. ⏰ **Configurar variables en Vercel** (5 min)
2. ⏰ **Configurar producto en FastSpring** (10 min)
3. ⏰ **Configurar webhook** (5 min)
4. ⏰ **Deploy a producción** (5 min)
5. ⏰ **Test completo** (10 min)

**Total: 35 minutos para estar operativo**

### Día 2-7: Monitoreo Intensivo

- Revisar logs cada 6 horas
- Verificar cada venta manualmente
- Responder soporte inmediato
- Ajustar sistema anti-fraude si es muy estricto

### Semana 2+: Monitoreo Regular

- Revisar métricas diarias:
  - Ratio de conversión (test → pago)
  - Ratio de cancelación
  - Ratio de disputas (CRÍTICO: < 0.75%)
  - Ratio de reembolsos (< 5%)

---

## 📊 Métricas a Monitorear

### Dashboard de Admin (`/admin`)

Métricas clave:
- **Usuarios nuevos/día**
- **Conversión test → pago** (objetivo: > 30%)
- **Disputas** (CRÍTICO: mantener < 0.75%)
- **Reembolsos** (mantener < 5%)
- **Cancelaciones** (normal: 20-40%)

### FastSpring Dashboard

- Revenue
- Subscriptions activas
- Churn rate
- Failed payments

---

## 🔄 Flujo Completo (Verificar)

### Usuario hace test → Pago → Acceso

1. **Usuario completa test** (mínimo 3 min)
   - Sistema anti-fraude valida
   - Si es sospechoso → BLOQUEADO

2. **Click en "Pagar €0.50"**
   - Abre popup de FastSpring
   - Procesa €0.50 inmediatamente
   - Guarda método de pago

3. **FastSpring webhook → order.completed**
   - Llama a `/api/fastspring-process-order`
   - Crea usuario en BD
   - Genera contraseña
   - Guarda resultado del test
   - Envía email de bienvenida

4. **Trial de 2 días comienza**
   - Usuario tiene acceso full
   - `subscription_status = 'trial'`
   - `trial_end_date = +2 días`

5. **Después de 2 días → FastSpring cobra €9.99**
   - Webhook: `subscription.charge.completed`
   - Actualiza `subscription_status = 'active'`
   - Envía email de confirmación

6. **Cada mes → Cobra €9.99 automáticamente**
   - Webhook cada pago
   - Extiende `access_until`

7. **Si cancela → mantiene acceso hasta fin de período**
   - Webhook: `subscription.canceled`
   - `subscription_status = 'cancelled'`
   - `access_until = fecha de fin de período`

---

## 🆘 Troubleshooting Rápido

### Checkout no carga
```javascript
// Console del navegador
Error: storefront not found
→ Revisar NEXT_PUBLIC_FASTSPRING_STOREFRONT
```

### Webhook no llega
```bash
# 1. Verificar URL en FastSpring
# 2. Ver logs
vercel logs --follow

# 3. Test manual
curl -X POST https://iqmind.mobi/api/fastspring-webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"order.completed","data":{"id":"test"}}]}'
```

### Usuario no recibe email
```bash
# Ver logs de Resend
# Verificar RESEND_API_KEY configurada
vercel env ls
```

### Pago procesado pero sin acceso
```sql
-- Verificar usuario en BD
SELECT * FROM users WHERE email = 'email@usuario.com';

-- Debería tener:
-- subscription_status = 'trial'
-- subscription_id = orden de FastSpring
-- trial_end_date = +2 días
```

---

## 💰 Costos

### FastSpring Fees

- **Standard**: 5.9% + $0.95 por transacción
- **Plus**: 8.9% (incluye más servicios)

### Comparación con Stripe

| | Stripe | FastSpring |
|---|---|---|
| **Fee** | 2.9% + €0.30 | 5.9% + $0.95 |
| **Merchant of Record** | ❌ No | ✅ Sí |
| **Gestión de impuestos** | Manual | Automática |
| **Riesgo de cierre** | Alto (ya cerrada) | Medio |
| **Soporte global** | Bueno | Excelente |

**Costo extra = 3% más**, pero evitas:
- Cálculo manual de IVA
- Registro fiscal en cada país
- Disputas (FastSpring las gestiona)
- Compliance (GDPR, PCI-DSS)

---

## ✅ Checklist Pre-Launch

Antes de activar en producción, verificar:

- [ ] Variables de entorno en Vercel
- [ ] Producto configurado en FastSpring
- [ ] Webhook configurado y probado
- [ ] Test completo realizado (test → pago → acceso → email)
- [ ] Sistema anti-fraude activo
- [ ] Logs monitoreables
- [ ] Panel admin accesible
- [ ] Política de reembolsos actualizada
- [ ] Términos y condiciones mencionan FastSpring
- [ ] Email de soporte configurado (support@iqmind.mobi)

---

## 📞 Recursos

### FastSpring
- Dashboard: https://dashboard.fastspring.com
- Docs: https://fastspring.com/docs
- Support: support@fastspring.com

### Tu Setup
- App: https://iqmind.mobi
- Admin: https://iqmind.mobi/admin
- Logs: `vercel logs --follow`

---

## 🎯 Siguiente Paso

**AHORA**: Configura las variables de entorno en Vercel y FastSpring Dashboard.

Sigue: `FASTSPRING_QUICK_START.md` (5 minutos)

**¡Ya casi estás! 🚀**

---

## 💡 Tips Finales

1. **Primera semana**: Monitorear como halcón
2. **Responder soporte rápido**: < 24h siempre
3. **Ser transparente**: trial + recurring bien explicado
4. **Facilitar cancelación**: 2 clicks máximo
5. **Ofrecer reembolsos**: dentro de 14 días sin preguntas

**Recuerda**: FastSpring prefiere vendedores éticos y transparentes. Si mantienes bajas disputas y reembolsos, no tendrás problemas.

---

_Migración completada el: ${new Date().toLocaleDateString()}_

_Documentación generada por: AI Assistant_

