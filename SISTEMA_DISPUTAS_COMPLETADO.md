# ✅ Sistema de Detección de Disputas - COMPLETADO

## 🎯 Resumen

Has pedido un sistema para detectar disputas. **He implementado un sistema completo de monitoreo, alertas y prevención** que te ayudará a evitar que FastSpring cierre tu cuenta (como hizo Stripe).

---

## ✅ Lo Que Se Ha Creado

### 1. **Sistema de Monitoreo Automático**

**Archivos**:
- ✅ `/lib/dispute-monitor.ts` - Motor principal del sistema
- ✅ `/app/api/admin/disputes/route.ts` - API para obtener stats
- ✅ `/app/api/cron/check-disputes/route.ts` - Cron cada hora
- ✅ `/app/api/cron/daily-dispute-report/route.ts` - Reporte diario

**Características**:
- 🔄 Verifica disputas cada hora automáticamente
- 📊 Calcula ratio de disputas (disputas/órdenes × 100)
- 🚨 Detecta nivel de riesgo: safe → warning → danger → critical
- 📧 Envía alertas por email inmediatas
- 📧 Envía reporte diario a las 9:00 AM

### 2. **Dashboard Visual de Admin**

**Archivo**:
- ✅ `/app/[lang]/admin/disputes/page.tsx`

**URL**:
```
https://iqmind.mobi/admin/disputes
```

**Características**:
- 📊 4 cards con métricas clave:
  - Total de órdenes
  - Total de disputas
  - Disputas abiertas
  - **Ratio de disputas con indicador de riesgo**
- 📋 Tabla completa de disputas con detalles
- 🔍 Filtros: 7, 30 o 90 días
- 🔄 Botón "Verificar Ahora" para check manual
- 🚨 Banner de alerta si ratio > 0.75%

### 3. **Sistema de Alertas por Email**

**Tipos de Email**:

1. **Alerta Inmediata** (cuando hay disputa nueva):
```
🚨 ALERTA: Nueva disputa detectada - Ratio: 0.82%

Detalles de la Disputa:
- Orden: FSO-123456
- Cliente: usuario@example.com
- Monto: 9.99 EUR
- Razón: No reconoce el cargo

Estadísticas:
- Ratio: 0.82% (🟠 DANGER)
- Total disputas: 5
- Total órdenes: 610

⚠️ ACCIÓN INMEDIATA REQUERIDA
```

2. **Reporte Diario** (9:00 AM):
```
📊 Reporte Diario - 29/10/2024

Métricas:
- 610 órdenes (30d)
- 5 disputas (30d)
- 0 disputas abiertas
- 0.82% ratio (🟠 DANGER)

✅ No hay disputas abiertas
```

### 4. **Cron Jobs Automáticos**

**Configuración en `vercel.json`**:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-disputes",
      "schedule": "0 * * * *"  // Cada hora
    },
    {
      "path": "/api/cron/daily-dispute-report",
      "schedule": "0 9 * * *"  // Diario 9 AM
    }
  ]
}
```

---

## 🚀 Configuración (10 minutos)

### Paso 1: Variables de Entorno en Vercel

```bash
# Email para recibir alertas (CRÍTICO)
ADMIN_EMAIL=tu-email@iqmind.mobi

# Secret para proteger crons
CRON_SECRET=$(openssl rand -base64 32)

# Ya configuradas:
FASTSPRING_API_USERNAME=tu_username
FASTSPRING_API_PASSWORD=tu_password
```

### Paso 2: Deploy

```bash
git add .
git commit -m "feat: dispute monitoring system"
git push
```

### Paso 3: Verificar Crons en Vercel

1. Ir a: https://vercel.com/tu-proyecto/settings/cron-jobs
2. Verificar que aparezcan 2 crons:
   - `/api/cron/check-disputes` (cada hora)
   - `/api/cron/daily-dispute-report` (9 AM diario)
3. Verificar que estén activos

### Paso 4: Test

1. Ir a: https://iqmind.mobi/admin/disputes
2. Hacer click en "Verificar Ahora"
3. Verificar que carga datos
4. Esperar email de reporte diario (9 AM del día siguiente)

---

## 📊 Cómo Usar el Sistema

### Dashboard Diario (5 min/día)

1. **Acceder**: https://iqmind.mobi/admin/disputes
2. **Ver ratio**: Card superior derecha
3. **Verificar alertas**: Banner rojo si ratio > 0.75%
4. **Revisar disputas abiertas**: Tabla inferior

### Interpretación del Ratio

| Ratio | Estado | Acción |
|-------|--------|--------|
| < 0.5% | 🟢 Safe | Continuar normal |
| 0.5% - 0.75% | 🟡 Warning | Monitorear más de cerca |
| 0.75% - 1.0% | 🟠 Danger | **Acción inmediata** |
| > 1.0% | 🔴 Critical | **RIESGO DE CIERRE** |

### Cuando Hay Disputa Nueva

**Email de alerta llega automáticamente** con:
- Detalles del cliente y orden
- Razón de la disputa
- Ratio actual de disputas
- Nivel de riesgo
- Recomendaciones de acción

**Acciones a tomar (< 1 hora)**:

1. ✅ Leer email de alerta
2. ✅ Ver detalles en FastSpring Dashboard
3. ✅ Contactar al cliente inmediatamente
4. ✅ Ofrecer reembolso si es necesario
5. ✅ Documentar la respuesta

---

## 🔍 Cómo Funciona Técnicamente

### Flujo de Detección

```
Cron Job (cada hora)
    ↓
Consulta FastSpring API:
  GET /returns (últimas 24h)
    ↓
Filtra solo disputas/chargebacks
    ↓
Si hay nuevas:
    ↓
Calcula estadísticas:
  - Total órdenes (30 días)
  - Total disputas (30 días)
  - Ratio = (disputas / órdenes) × 100
    ↓
Determina nivel de riesgo:
  - < 0.5% = Safe
  - 0.5-0.75% = Warning
  - 0.75-1.0% = Danger
  - > 1.0% = Critical
    ↓
Envía email de alerta a ADMIN_EMAIL
```

### API de FastSpring Consultada

```javascript
// Returns (incluye disputas)
GET https://api.fastspring.com/returns
  ?begin=2024-10-01
  &end=2024-10-29
  &limit=100

// Órdenes (para calcular ratio)
GET https://api.fastspring.com/orders
  ?begin=2024-10-01
  &end=2024-10-29
```

---

## 🚨 Niveles de Alerta

### 🟢 Safe (< 0.5%)

- ✅ Todo bien
- Email: Solo reporte diario
- Acción: Continuar normal

### 🟡 Warning (0.5% - 0.75%)

- ⚠️ Zona de precaución
- Email: Reporte diario + alertas
- Acción: Monitorear más de cerca

### 🟠 Danger (0.75% - 1.0%)

- 🚨 Peligro inminente
- Email: Alertas inmediatas con banner rojo
- Acción: **INMEDIATA**
  - Contactar clientes con disputas
  - Ofrecer reembolsos preventivos
  - Revisar sistema anti-fraude
  - Mejorar descripción del producto

### 🔴 Critical (> 1.0%)

- 💀 RIESGO DE CIERRE DE CUENTA
- Email: Alertas críticas
- Acción: **URGENTE**
  - Pausar campañas de marketing
  - Contactar TODOS los clientes con disputas
  - Ofrecer reembolsos inmediatos
  - Contactar FastSpring Support
  - Revisar TODO el flujo de compra

---

## 📧 Configurar Emails Adicionales

Editar `/lib/dispute-monitor.ts`:

```typescript
const DISPUTE_CONFIG = {
  alertEmails: [
    'admin@iqmind.mobi',        // Principal
    'soporte@iqmind.mobi',      // Equipo de soporte
    'tu-email-personal@gmail.com'  // Personal
  ],
  // ...
}
```

---

## 🛡️ Prevención de Disputas

El sistema **detecta**, pero también necesitas **prevenir**:

### Checklist Preventivo

✅ **Descripción ultra clara**:
```
"€0.50 para ver resultado + 2 días gratis + 
€9.99/mes después (cancela cuando quieras)"
```

✅ **Email de bienvenida completo**:
- Qué compraron
- Cómo cancelar (link directo)
- Cuándo se cobrará
- Cómo usar el servicio

✅ **Cancelación fácil**:
- 2 clicks desde /cuenta
- Sin pedir razón
- Confirmación inmediata
- Mantener acceso hasta fin de período

✅ **Soporte rápido**:
- Responder en < 24h SIEMPRE
- Email visible: support@iqmind.mobi
- FAQ completo

✅ **Sistema anti-fraude** (ya implementado):
- Bloquea tests < 3 minutos
- Bloquea emails temporales
- Límite 1 compra por email

---

## 📱 Accesos Rápidos

| Recurso | URL |
|---------|-----|
| **Dashboard Disputas** | https://iqmind.mobi/admin/disputes |
| **FastSpring Dashboard** | https://dashboard.fastspring.com |
| **Vercel Crons** | https://vercel.com/tu-proyecto/settings/cron-jobs |
| **Vercel Logs** | `vercel logs --follow` |

---

## 🔧 Troubleshooting

### No recibo emails

```bash
# Verificar ADMIN_EMAIL
vercel env ls | grep ADMIN

# Ver logs
vercel logs | grep "DISPUTE"

# Verificar Resend configurado
# Ver /lib/email-service.ts
```

### Dashboard muestra 0 disputas

```bash
# Test API manual
curl https://iqmind.mobi/api/admin/disputes \
  -H "x-user-email: tu-email@iqmind.mobi"

# Ver logs
vercel logs | grep "DISPUTES API"
```

### Cron no se ejecuta

```bash
# Ver en Vercel Dashboard:
# Settings → Cron Jobs → Ver ejecuciones

# Verificar CRON_SECRET configurado
vercel env ls | grep CRON

# Ver logs de cron
vercel logs | grep "CRON"
```

---

## 📈 Métricas de Éxito

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| **Ratio de Disputas** | < 0.5% | > 0.75% |
| **Tiempo de Respuesta** | < 24h | > 48h |
| **Reporte Diario** | Leer siempre | - |
| **Dashboard Check** | Diario | - |

---

## ✅ Checklist de Activación

- [ ] `ADMIN_EMAIL` configurado en Vercel
- [ ] `CRON_SECRET` configurado en Vercel
- [ ] Deploy realizado
- [ ] Crons activos en Vercel Dashboard
- [ ] Test manual desde `/admin/disputes` OK
- [ ] Logs muestran actividad de crons
- [ ] Email de prueba recibido (esperar 9 AM siguiente día)

---

## 🎯 Siguiente Paso

1. **AHORA**: Configurar `ADMIN_EMAIL` en Vercel
2. **AHORA**: Deploy a producción
3. **HOY**: Verificar crons activos
4. **HOY**: Hacer test desde dashboard
5. **MAÑANA 9 AM**: Verificar email de reporte diario

---

## 📞 Soporte

Si necesitas ayuda:

1. Ver logs: `vercel logs --follow`
2. Ver documentación completa: `DISPUTE_MONITOR_SETUP.md`
3. Dashboard de admin: `/admin/disputes`

---

**Sistema completado el**: ${new Date().toLocaleDateString()}

**Próxima acción**: Configurar variables de entorno y hacer deploy

**🎯 Objetivo**: Mantener ratio de disputas < 0.5% para nunca tener problemas con FastSpring

