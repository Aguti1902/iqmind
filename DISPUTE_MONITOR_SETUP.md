# 🚨 Sistema de Monitoreo de Disputas - Configuración

## 🎯 Propósito

**CRÍTICO**: Este sistema te ayudará a evitar que FastSpring cierre tu cuenta (como hizo Stripe) por alto ratio de disputas.

### Límites de FastSpring:
- ⚠️ **0.75%** = Zona de peligro
- 🔴 **1.0%** = Riesgo de cierre de cuenta
- 🛑 **> 1.0%** = Posible cierre inmediato

---

## ✅ Lo Que Se Ha Implementado

### 1. **Sistema de Monitoreo Automático**
- ✅ Verifica disputas cada hora vía API de FastSpring
- ✅ Calcula ratio automáticamente (disputas/órdenes)
- ✅ Detecta nivel de riesgo: safe → warning → danger → critical

### 2. **Alertas por Email**
- ✅ Email inmediato cuando se detecta nueva disputa
- ✅ Reporte diario a las 9:00 AM con estadísticas
- ✅ Alertas críticas cuando ratio > 0.75%

### 3. **Dashboard de Admin**
- ✅ Visualización en tiempo real del ratio de disputas
- ✅ Lista completa de disputas con detalles
- ✅ Métricas de 7, 30 o 90 días
- ✅ Botón para verificar manualmente

### 4. **Cron Jobs Automáticos**
- ✅ Check cada hora: `/api/cron/check-disputes`
- ✅ Reporte diario: `/api/cron/daily-dispute-report`

---

## 🔧 Configuración Necesaria

### 1. Variables de Entorno

Añade a Vercel:

```bash
# Email de alerta (IMPORTANTE)
ADMIN_EMAIL=tu-email@iqmind.mobi

# Secret para proteger cron jobs
CRON_SECRET=tu-secret-aleatorio-aqui

# Ya configuradas anteriormente:
FASTSPRING_API_USERNAME=tu_username
FASTSPRING_API_PASSWORD=tu_password
```

**Generar CRON_SECRET**:
```bash
openssl rand -base64 32
```

### 2. Configurar Cron Jobs en Vercel

El archivo `vercel.json` ya está configurado con:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-disputes",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily-dispute-report",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Horarios**:
- `0 * * * *` = Cada hora, a los 0 minutos
- `0 9 * * *` = Diario a las 9:00 AM UTC

### 3. Activar Crons en Vercel

Después del deploy:

1. Ir a: https://vercel.com/tu-proyecto/settings/cron-jobs
2. Verificar que ambos crons estén listados
3. Activar si están desactivados

---

## 📊 Uso del Dashboard

### Acceder al Dashboard

```
https://iqmind.mobi/admin/disputes
```

**Requiere**: Estar logueado como administrador

### Características

1. **Cards de Estadísticas**:
   - Total de órdenes
   - Total de disputas
   - Disputas abiertas
   - **Ratio de disputas** (con indicador de riesgo)

2. **Tabla de Disputas**:
   - ID de orden
   - Email del cliente
   - Monto
   - Razón de la disputa
   - Estado (open/won/lost)
   - Fecha

3. **Filtros**:
   - Últimos 7 días
   - Últimos 30 días
   - Últimos 90 días

4. **Verificación Manual**:
   - Botón "Verificar Ahora" para check inmediato

---

## 📧 Alertas por Email

### Cuando Se Envían

1. **Alerta Inmediata**:
   - Cuando se detecta una nueva disputa
   - Incluye detalles completos
   - Indica nivel de riesgo actual

2. **Reporte Diario** (9:00 AM):
   - Resumen de últimos 30 días
   - Ratio actual de disputas
   - Lista de disputas abiertas que requieren atención

### Formato del Email

**Disputa Nueva**:
```
🚨 ALERTA: Nueva disputa detectada - Ratio: 0.82%

Detalles de la Disputa:
- Orden: FSO-123456
- Email: usuario@example.com
- Monto: 9.99 EUR
- Razón: No reconoce el cargo
- Fecha: 29/10/2024

Estadísticas (Últimos 30 días):
- Total Disputas: 5
- Total Órdenes: 610
- Ratio: 0.82%
- Nivel: 🟠 DANGER

⚠️ ACCIÓN INMEDIATA REQUERIDA
```

### Configurar Emails Adicionales

Editar `/lib/dispute-monitor.ts`:

```typescript
const DISPUTE_CONFIG = {
  alertEmails: [
    'admin@iqmind.mobi',
    'soporte@iqmind.mobi',
    'tu-email-personal@gmail.com'
  ],
  // ...
}
```

---

## 🔍 Cómo Funciona

### 1. Detección Automática (Cada Hora)

```
Cron Job (cada hora)
    ↓
Consulta API de FastSpring
    ↓
Busca nuevas disputas (últimas 24h)
    ↓
Si hay disputas nuevas:
    → Calcula ratio
    → Determina nivel de riesgo
    → Envía email de alerta
```

### 2. Cálculo del Ratio

```
Ratio = (Total Disputas / Total Órdenes) × 100

Ejemplo:
- Total órdenes últimos 30 días: 1000
- Total disputas últimos 30 días: 8
- Ratio: (8 / 1000) × 100 = 0.8%

Nivel de Riesgo:
- < 0.5% = 🟢 Safe
- 0.5% - 0.75% = 🟡 Warning
- 0.75% - 1.0% = 🟠 Danger
- > 1.0% = 🔴 Critical
```

### 3. API de FastSpring

El sistema consulta:

```bash
GET https://api.fastspring.com/returns
GET https://api.fastspring.com/orders
```

Filtra solo las disputas (chargebacks):
```javascript
returns.filter(r => 
  r.reason === 'chargeback' || 
  r.type === 'chargeback'
)
```

---

## 🚨 Qué Hacer Cuando Hay Disputa

### 1. Inmediato (< 1 hora)

✅ **Revisar detalles**:
- Ir al dashboard: `/admin/disputes`
- Ver orden en FastSpring Dashboard
- Identificar razón de la disputa

✅ **Contactar al cliente**:
```
Asunto: Importante: Tu pago en IQmind

Hola [Nombre],

Vimos que has iniciado una disputa por tu compra.
¿Podemos ayudarte con algo?

Si hubo algún problema con el servicio, estaremos 
encantados de ofrecerte un reembolso inmediato.

Responde a este email o cancela la disputa en tu banco.

Equipo IQmind
```

### 2. Dentro de 24 horas

✅ **Ofrecer reembolso preventivo**:
- Mejor perder €9.99 que tener una disputa
- FastSpring puede procesar el reembolso
- Dashboard → Orders → Refund

✅ **Documentar respuesta**:
- Guarda todos los emails
- Captura de pantalla si cancela la disputa
- FastSpring necesita esto si escalas

### 3. Si el Ratio Sube > 0.75%

🔴 **ACCIÓN CRÍTICA**:

1. **Pausa campañas de marketing** temporalmente
2. **Revisa sistema anti-fraude**:
   - ¿Están pasando bots?
   - ¿Tests muy rápidos?
   - ¿Emails temporales?
3. **Mejora descripción del producto**:
   - Más clara sobre trial + recurring
   - Añade video explicativo
   - FAQ más visible
4. **Email post-compra mejorado**:
   - Explica qué obtuvieron
   - Cómo cancelar si no les gusta
   - Cómo usar el servicio

---

## 📈 Prevención de Disputas

### Checklist Preventivo

✅ **Descripción Clara**:
```markdown
❌ MAL: "Accede a tu resultado de IQ"
✅ BIEN: "Paga €0.50 para ver tu resultado + 2 días 
         de acceso premium GRATIS + suscripción de 
         €9.99/mes (cancela cuando quieras)"
```

✅ **Email de Bienvenida**:
- Explicar QUÉ compraron
- CÓMO cancelar (link directo)
- CUÁNDO se cobrará (fecha exacta)
- CÓMO contactar soporte

✅ **Cancelación Fácil**:
- 2 clicks máximo
- Sin pedir razón (opcional)
- Confirmación inmediata
- Mantener acceso hasta fin de período

✅ **Soporte Rápido**:
- Responder en < 24h SIEMPRE
- Email visible: support@iqmind.mobi
- Chat si es posible
- FAQ completo

✅ **Sistema Anti-Fraude Activo**:
- Bloquear tests < 3 minutos
- Bloquear emails temporales
- Límite 1 compra por email
- Tracking de IPs sospechosas

---

## 🔧 Troubleshooting

### "No se detectan disputas pero sé que hay"

1. Verificar credenciales API:
```bash
# Test manual
curl -X GET https://api.fastspring.com/returns \
  -u username:password
```

2. Verificar permisos de API en FastSpring:
   - Dashboard → Integrations → API Credentials
   - Debe tener permiso de READ en Orders y Returns

### "No recibo emails de alerta"

1. Verificar `ADMIN_EMAIL` en Vercel:
```bash
vercel env ls
```

2. Verificar logs de email:
```bash
vercel logs | grep "DISPUTE"
```

3. Verificar que Resend esté configurado:
```bash
# Ver email-service.ts
# RESEND_API_KEY debe estar configurado
```

### "Cron no se ejecuta"

1. Verificar en Vercel Dashboard:
   - Settings → Cron Jobs
   - Ver últimas ejecuciones

2. Verificar `CRON_SECRET`:
```bash
# Debe coincidir en:
# - Vercel env variables
# - Código del cron
```

3. Verificar logs:
```bash
vercel logs | grep "CRON"
```

### "Dashboard muestra 0 disputas pero hay"

1. Verificar autenticación:
```javascript
// Dashboard envía header:
'x-user-email': localStorage.getItem('userEmail')

// Verificar que sea email de admin
```

2. Ver logs de API:
```bash
vercel logs | grep "DISPUTES API"
```

---

## 📊 Métricas Objetivo

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| **Ratio de Disputas** | < 0.5% | > 0.75% |
| **Tiempo de Respuesta** | < 24h | > 48h |
| **Disputas Ganadas** | > 50% | < 20% |
| **Reembolsos Preventivos** | Usar liberalmente | - |

---

## 🎯 Resumen de Acciones

### Setup Inicial (10 min)

1. ✅ Configurar `ADMIN_EMAIL` en Vercel
2. ✅ Configurar `CRON_SECRET` en Vercel
3. ✅ Deploy a producción
4. ✅ Verificar crons activos en Vercel
5. ✅ Hacer test manual desde `/admin/disputes`

### Uso Diario (5 min)

1. ✅ Revisar email de reporte diario (9 AM)
2. ✅ Abrir `/admin/disputes`
3. ✅ Verificar ratio < 0.5%
4. ✅ Si hay disputas abiertas → contactar clientes

### Si Hay Disputa (30 min)

1. ✅ Leer email de alerta inmediatamente
2. ✅ Contactar cliente (< 1 hora)
3. ✅ Ofrecer reembolso si es necesario
4. ✅ Documentar respuesta
5. ✅ Monitorear si cancela la disputa

---

## 📞 Recursos

- **FastSpring Dashboard**: https://dashboard.fastspring.com
- **FastSpring API Docs**: https://fastspring.com/docs/api
- **Tu Dashboard**: https://iqmind.mobi/admin/disputes
- **Vercel Crons**: https://vercel.com/docs/cron-jobs

---

## ✅ Checklist de Activación

Antes de confiar en el sistema:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Crons activos en Vercel Dashboard
- [ ] Test manual de API: `/api/admin/disputes`
- [ ] Test de verificación manual desde dashboard
- [ ] Email de prueba recibido (puede ser reporte diario)
- [ ] Dashboard accesible y muestra datos
- [ ] Logs de Vercel muestran actividad de crons

---

**Sistema implementado el**: ${new Date().toLocaleDateString()}

**Próxima revisión**: Verificar diariamente durante primera semana

**🎯 Objetivo**: Mantener ratio de disputas < 0.5% permanentemente

