# 🤖 Agente de IA para Reembolsos Automáticos con n8n

Sistema completo de automatización para gestionar solicitudes de cancelación y reembolsos de MindMetric usando n8n, IA y Stripe.

---

## 📋 ÍNDICE

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Política de Reembolsos (Para IA)](#política-de-reembolsos-para-ia)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación de n8n](#instalación-de-n8n)
5. [Configuración del Workflow](#configuración-del-workflow)
6. [Prompt del Agente de IA](#prompt-del-agente-de-ia)
7. [Configuración de Correo](#configuración-de-correo)
8. [Integración con Stripe](#integración-con-stripe)
9. [Testing y Verificación](#testing-y-verificación)
10. [Monitoreo y Mejoras](#monitoreo-y-mejoras)

---

## 🎯 RESUMEN DEL SISTEMA

### Flujo Automático

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DEL AGENTE DE IA                        │
└─────────────────────────────────────────────────────────────────┘

1. 📧 RECEPCIÓN
   └─ Email llega a: support@mindmetric.io
   └─ n8n webhook detecta nuevo correo

2. 🤖 ANÁLISIS IA
   └─ Extrae: email, motivo, emoción, tipo de solicitud
   └─ Clasifica: REEMBOLSABLE o NO REEMBOLSABLE
   └─ Genera: respuesta personalizada

3. 🔍 IDENTIFICACIÓN
   └─ Busca cliente en Stripe por email
   └─ Obtiene: ID, suscripción, pagos, historial

4. ⚖️ EVALUACIÓN
   └─ Verifica política de reembolsos
   └─ Evalúa: días desde compra, tipo de pago, historial

5. 💰 PROCESAMIENTO
   └─ SI cumple → Reembolso automático en Stripe
   └─ Cancela suscripción activa
   └─ Registra en base de datos

6. 📤 RESPUESTA
   └─ Envía email personalizado al cliente
   └─ Confirma reembolso o explica denegación
   └─ Notifica a equipo interno

7. 📊 REGISTRO
   └─ Guarda caso en Airtable/Google Sheets
   └─ Métricas: tiempo respuesta, tasa aprobación
```

---

## 📜 POLÍTICA DE REEMBOLSOS Y CANCELACIONES (PARA IA)

Esta es la política que el agente de IA usará para tomar decisiones:

### 🔄 IMPORTANTE: CANCELACIÓN vs REEMBOLSO

```
CANCELACIÓN:
- Cliente quiere terminar suscripción
- NO pide dinero de vuelta
- SIEMPRE permitida
- Sin penalización
- Mantiene acceso hasta fin de período

REEMBOLSO:
- Cliente quiere dinero de vuelta
- Requiere evaluación de política
- Solo en casos específicos
- Puede incluir cancelación
```

### ❌ PAGO INICIAL NO REEMBOLSABLE

#### 1. **Pago Inicial de 1€** (Desbloqueo de resultado)

**⛔ NO ES REEMBOLSABLE BAJO NINGUNA CIRCUNSTANCIA**

**RAZÓN:**
- Es un pago único de acceso a contenido digital ya entregado
- El usuario ya recibió su resultado del test de CI
- Similar a compra de contenido digital (no reversible)

**ACCIÓN ANTE SOLICITUD:**
- Explicar que el pago de 1€ NO es reembolsable
- Email: "Lamentamos no poder procesar reembolso del pago inicial"
- Ofrecer: Soporte técnico si hubo problemas con el test
- Alternativa: Descuento en suscripción futura (opcional)

---

#### 2. **Suscripción Regular** (9.99€ quincenal o 19.99€ mensual) - **SÍ REEMBOLSABLE**

**✅ REEMBOLSABLE SOLO SI:**

##### A) **Indisponibilidad del Servicio**
- ✅ Tiempo de inactividad > 24 horas consecutivas
- ✅ NO causado por mantenimiento programado
- ✅ NO por fuerza mayor
- ✅ REQUIERE: Documentación del tiempo de inactividad

##### B) **Problemas Técnicos Verificables**
- ✅ Error impide acceso a funciones principales del dashboard
- ✅ Reportado dentro de 30 días del cargo
- ✅ REQUIERE: Verificación del equipo técnico
- ✅ EJEMPLOS: No puede acceder a resultados, errores constantes, funciones no cargan

##### C) **Errores de Facturación**
- ✅ Cargos duplicados (mismo monto, mismo día)
- ✅ Monto incorrecto cobrado (diferente al plan contratado)
- ✅ Transacciones no autorizadas (fraude)
- ✅ Cobro tras cancelación procesada

##### D) **Requisitos Legales**
- ✅ Derecho de desistimiento según ley local (14 días en UE)
- ✅ Protección del consumidor
- ✅ Orden judicial

**ACCIÓN SI CUMPLE:**
- Reembolso del último cargo de suscripción
- Cancelar suscripción inmediatamente
- Email: "Reembolso procesado + disculpas"

---

### 🔄 CANCELACIONES (Sin Reembolso)

#### **Cancelación Simple - SIEMPRE PERMITIDA**

**Criterios:**
- ✅ Cliente solo quiere terminar la suscripción
- ✅ NO solicita reembolso
- ✅ Sin preguntas ni requisitos
- ✅ Procesamiento inmediato

**ACCIÓN:**
- Cancelar suscripción en Stripe inmediatamente
- Cliente mantiene acceso hasta fin del período pagado
- Email: Confirmación de cancelación con fecha de fin de acceso
- NO se genera reembolso
- NO se requiere evaluación de política

**Ejemplos de Cancelación:**
```
✅ "Quiero cancelar mi suscripción"
✅ "Por favor cancelen mi plan"
✅ "Dar de baja mi cuenta"
✅ "No quiero que me cobren más"
✅ "Terminar mi suscripción"
```

**Email de Respuesta:**
```
✅ Confirmación de Cancelación

Su suscripción ha sido cancelada exitosamente.

Detalles:
• Fecha de cancelación: [HOY]
• Acceso hasta: [FIN DE PERÍODO]
• No habrá más cargos

Puede seguir usando el servicio hasta el [FECHA].
```

---

### ❌ CASOS NO REEMBOLSABLES

**⛔ RECHAZAR REEMBOLSO SI:**

1. ⛔ **Pago Inicial de 1€**
   - *"Pagué 1€ pero no me gustó el resultado"*
   - *"Quiero mi dinero de vuelta del test"*
   - **NO ES REEMBOLSABLE - Contenido digital ya entregado**
   - **Acción:** Explicar política + ofrecer soporte

2. ⛔ **Tiempo de suscripción no utilizado tras cancelación**
   - *"Cancelé pero quedan 15 días, quiero reembolso proporcional"*
   - **Política:** Mantiene acceso hasta fin del período pagado
   - **Acción:** Explicar que el acceso continúa hasta [FECHA]

3. ⛔ **Cambio de opinión**
   - *"Ya no necesito el servicio"*
   - *"Era muy caro"*
   - *"No me gustó"*
   - *"Encontré una alternativa mejor"*
   - **Acción:** Ofrecer cancelación inmediata (sin reembolso)

4. ⛔ **Olvidó cancelar antes de renovación**
   - *"Olvidé cancelar y se renovó automáticamente"*
   - *"No sabía que se renovaba"*
   - **Responsabilidad del usuario gestionar suscripción**
   - **Acción:** Cancelar ahora para evitar futuros cargos

5. ⛔ **Rebaja de planes o cambios**
   - *"Cambié a plan más barato, quiero reembolso de diferencia"*
   - *"Quiero bajar de plan y recuperar dinero"*
   - **Acción:** Explicar que el cambio aplica en siguiente ciclo

6. ⛔ **Mantenimiento programado o breve**
   - *"No pude acceder ayer por 2 horas"*
   - *"Hubo mantenimiento el fin de semana"*
   - **Solo > 24 horas y NO programado**
   - **Acción:** Explicar política + ofrecer cancelación si desea

7. ⛔ **Insatisfacción con resultados**
   - *"El training no me funcionó"*
   - *"No mejoró mi CI"*
   - **Servicio de entretenimiento educativo, sin garantías**
   - **Acción:** Ofrecer cancelación + soporte técnico

**ACCIÓN ANTE RECHAZO DE REEMBOLSO:**
- NO procesar reembolso
- Explicar política claramente
- **SIEMPRE ofrecer cancelación inmediata** (sin reembolso)
- Ofrecer soporte técnico si hay problemas reales
- Email: Explicación empática pero firme

---

### 🕐 TIEMPO DE PROCESAMIENTO

- **Análisis IA:** Instantáneo
- **Reembolso en Stripe:** Automático
- **Reflejo en banco cliente:** 3-5 días hábiles
- **Respuesta al cliente:** < 5 minutos

---

### 💳 MÉTODO DE REEMBOLSO

- ✅ Solo al método de pago original
- ❌ NO a cuentas alternativas
- ⚠️ Tarjetas vencidas: reembolso procesará igual (banco gestiona)

---

## 🔧 REQUISITOS PREVIOS

### 1. Cuenta de n8n

**Opción A: n8n Cloud (Recomendado)**
- Precio: Desde $20/mes
- URL: https://n8n.io/pricing/
- Ventajas: Sin servidor, fácil setup, siempre activo

**Opción B: Self-hosted (Gratis)**
- Requiere: VPS (Railway, DigitalOcean, AWS)
- Comando: `npx n8n` (ver sección instalación)

### 2. Servicios Necesarios

| Servicio | Propósito | Costo | URL |
|----------|-----------|-------|-----|
| **OpenAI** | Agente de IA (GPT-4) | $0.01/1K tokens | https://platform.openai.com |
| **Stripe** | Procesamiento reembolsos | Gratis (API) | https://stripe.com |
| **Gmail/Outlook** | Recepción de correos | Gratis | https://gmail.com |
| **SendGrid** | Envío de respuestas | Gratis (100/día) | https://sendgrid.com |
| **Airtable/Sheets** | Registro de casos (opcional) | Gratis | https://airtable.com |

### 3. Claves API Necesarias

```env
# OpenAI (Para el agente de IA)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Stripe (Para reembolsos)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# SendGrid (Para emails)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Gmail (Para recibir correos)
GMAIL_USER=support@mindmetric.io
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 🚀 INSTALACIÓN DE N8N

### Opción A: n8n Cloud (Más Fácil)

```bash
1. Ve a: https://n8n.io/
2. Click "Start Free"
3. Crea cuenta
4. Ya tienes n8n funcionando ✅
```

### Opción B: Self-hosted en Railway

```bash
# 1. Instalar n8n localmente para crear el workflow
npm install -g n8n

# 2. Iniciar n8n
n8n

# 3. Abre en navegador
http://localhost:5678

# 4. Crea tu workflow (ver siguiente sección)

# 5. Exporta el workflow (JSON)

# 6. Despliega en Railway
# - Crea nuevo proyecto en Railway
# - Conecta con GitHub (crea repo con n8n)
# - Añade variables de entorno
# - Importa el workflow JSON
```

### Opción C: Self-hosted en Docker

```bash
# 1. Crear docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=tuPasswordSegura
    volumes:
      - ./n8n-data:/home/node/.n8n

# 2. Iniciar
docker-compose up -d

# 3. Acceder
http://localhost:5678
```

---

## 🎨 CONFIGURACIÓN DEL WORKFLOW

### Workflow Completo en n8n

```
┌──────────────────────────────────────────────────────────────┐
│                      N8N WORKFLOW                            │
└──────────────────────────────────────────────────────────────┘

1. [📧 Gmail Trigger]
   ↓
2. [🤖 OpenAI Agent]
   ↓
3. [🔀 IF: ¿Es solicitud de reembolso?]
   ├─ NO → [📤 Respuesta Genérica] → END
   ↓
   YES
   ↓
4. [🔍 HTTP Request: Buscar Cliente en Stripe]
   ↓
5. [🔀 IF: ¿Cliente existe?]
   ├─ NO → [📤 Email: No encontrado] → END
   ↓
   YES
   ↓
6. [⚖️ Function: Evaluar Política]
   ↓
7. [🔀 IF: ¿Cumple política?]
   ├─ NO → [📤 Email: Reembolso Denegado] → [📊 Log] → END
   ↓
   YES
   ↓
8. [💰 HTTP Request: Crear Reembolso en Stripe]
   ↓
9. [🚫 HTTP Request: Cancelar Suscripción]
   ↓
10. [📤 Email: Reembolso Confirmado]
    ↓
11. [📊 Log a Airtable/Sheets]
    ↓
12. [🔔 Notificación a Slack (Interno)]
    ↓
END
```

### JSON del Workflow (Importar en n8n)

Guarda esto en un archivo `workflow-reembolsos.json` e impórtalo en n8n:

```json
{
  "name": "🤖 Agente Reembolsos MindMetric",
  "nodes": [
    {
      "parameters": {
        "pollTimes": {
          "item": [
            {
              "mode": "everyMinute"
            }
          ]
        },
        "simple": false,
        "filters": {
          "from": "support@mindmetric.io",
          "subject": "",
          "labelIds": ["INBOX"]
        }
      },
      "name": "Gmail Trigger",
      "type": "n8n-nodes-base.emailReadImap",
      "position": [250, 300],
      "typeVersion": 2
    },
    {
      "parameters": {
        "resource": "chat",
        "operation": "create",
        "model": "gpt-4",
        "messages": {
          "messageValues": [
            {
              "role": "system",
              "content": "={{ $node[\"Prompt Sistema\"].json[\"prompt\"] }}"
            },
            {
              "role": "user",
              "content": "={{ $json[\"body\"] }}"
            }
          ]
        },
        "options": {
          "temperature": 0.3,
          "maxTokens": 500
        }
      },
      "name": "OpenAI Agent",
      "type": "n8n-nodes-base.openAi",
      "position": [450, 300],
      "typeVersion": 1
    }
  ],
  "connections": {
    "Gmail Trigger": {
      "main": [
        [
          {
            "node": "OpenAI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 🧠 PROMPT DEL AGENTE DE IA

### Prompt Completo para OpenAI

Este prompt debe ir en un nodo "Set" antes del nodo de OpenAI:

```markdown
Eres un asistente de atención al cliente de MindMetric especializado en reembolsos.

Tu tarea es analizar correos de clientes y extraer información clave.

---

## INFORMACIÓN A EXTRAER:

Debes responder ÚNICAMENTE con un JSON con esta estructura:

{
  "email_cliente": "email@ejemplo.com",
  "motivo_solicitud": "Descripción breve del motivo",
  "tipo_solicitud": "REEMBOLSO_INICIAL | REEMBOLSO_SUSCRIPCION | CANCELACION | QUEJA | OTRO",
  "emocion": "NEUTRAL | FRUSTRADO | ENOJADO | EDUCADO",
  "cumple_politica": true | false,
  "razon_cumplimiento": "Explicación de por qué cumple o no cumple",
  "respuesta_sugerida": "Respuesta empática y profesional en español"
}

---

## POLÍTICA DE REEMBOLSOS DE MINDMETRIC:

### ⛔ NO REEMBOLSABLE:

**1. PAGO INICIAL (1€):**
- ⛔ NO es reembolsable bajo NINGUNA circunstancia
- Razón: Contenido digital ya entregado (resultado del test)
- Acción: Explicar política + ofrecer soporte técnico

### ✅ REEMBOLSOS APROBADOS (SOLO SUSCRIPCIONES):

**2. SUSCRIPCIÓN (9.99€/19.99€):**
Solo reembolsable si:
- ✅ Indisponibilidad > 24 horas consecutivas (documentada, NO mantenimiento)
- ✅ Problemas técnicos verificables (error impide acceso a funciones)
- ✅ Errores de facturación (doble cargo, monto incorrecto, no autorizado)
- ✅ Requisito legal (derecho de desistimiento, orden judicial)

### ❌ REEMBOLSOS DENEGADOS:

- ⛔ Pago inicial de 1€ (por cualquier motivo)
- ⛔ Cambio de opinión / "Ya no lo necesito"
- ⛔ "Olvidé cancelar antes de renovación"
- ⛔ Tiempo de suscripción no utilizado tras cancelación
- ⛔ "Es muy caro" / "No me gustó"
- ⛔ Mantenimiento programado o breve (< 24 horas)
- ⛔ Rebaja de planes o cambios
- ⛔ Insatisfacción con resultados del training

---

## EJEMPLOS:

**Email 1:**
"Hola, pagué 1€ hace 3 días pero el test no me convenció. Quiero mi dinero de vuelta."

**Respuesta:**
{
  "email_cliente": "extraer_del_email",
  "motivo_solicitud": "No satisfecho con el test tras pago inicial",
  "tipo_solicitud": "REEMBOLSO_INICIAL",
  "emocion": "EDUCADO",
  "cumple_politica": false,
  "razon_cumplimiento": "El pago inicial de 1€ NO es reembolsable según nuestra política - es contenido digital ya entregado",
  "respuesta_sugerida": "Hola, gracias por contactarnos. Lamentamos que no quedaste satisfecho con el test. Sin embargo, según nuestra política de reembolsos, el pago inicial de 1€ para desbloquear el resultado del test no es reembolsable, ya que es una compra de contenido digital que ya has recibido. Si experimentaste problemas técnicos con el test, estaremos encantados de ayudarte. ¿Podemos asistirte en algo más?"
}

---

**Email 2:**
"Me cobraron 19.99€ pero olvidé cancelar. Devuélvanme el dinero por favor."

**Respuesta:**
{
  "email_cliente": "extraer_del_email",
  "motivo_solicitud": "Olvidó cancelar antes de renovación",
  "tipo_solicitud": "REEMBOLSO_SUSCRIPCION",
  "emocion": "EDUCADO",
  "cumple_politica": false,
  "razon_cumplimiento": "'Olvidar cancelar antes de renovación' no es elegible para reembolso según nuestra política",
  "respuesta_sugerida": "Hola, entendemos tu situación. Sin embargo, según nuestra política de reembolsos, las renovaciones automáticas no son reembolsables si no se cancelaron antes de la fecha de renovación. Es responsabilidad del usuario gestionar su suscripción. Hemos procedido a cancelar tu suscripción para evitar futuros cargos. Puedes seguir usando el servicio hasta el final del período ya pagado. Gracias por tu comprensión."
}

---

**Email 4:**
"Quiero cancelar mi suscripción, por favor."

**Respuesta:**
{
  "email_cliente": "extraer_del_email",
  "motivo_solicitud": "Solicitud de cancelación sin reembolso",
  "tipo_solicitud": "CANCELACION",
  "emocion": "EDUCADO",
  "cumple_politica": true,
  "razon_cumplimiento": "Solicitud de cancelación - siempre permitida",
  "respuesta_sugerida": "Hola, hemos procesado tu solicitud de cancelación. Tu suscripción ha sido cancelada exitosamente y no habrá más cargos. Puedes seguir disfrutando del servicio hasta el final del período actual que ya has pagado. Si en el futuro deseas reactivar tu cuenta, estaremos encantados de ayudarte. ¡Gracias por haber sido parte de MindMetric!"
}

---

**Email 3:**
"La web estuvo caída TODO el día ayer y me cobraron igual. Esto es una estafa."

**Respuesta:**
{
  "email_cliente": "extraer_del_email",
  "motivo_solicitud": "Indisponibilidad del servicio",
  "tipo_solicitud": "REEMBOLSO_SUSCRIPCION",
  "emocion": "ENOJADO",
  "cumple_politica": true,
  "razon_cumplimiento": "Indisponibilidad documentada > 24 horas cumple con política de reembolso",
  "respuesta_sugerida": "Lamentamos profundamente los inconvenientes causados por la interrupción del servicio. Tienes toda la razón y cumples con nuestra política de reembolso por indisponibilidad. Hemos procesado el reembolso completo de tu último cargo (19.99€) y hemos cancelado tu suscripción. Los fondos aparecerán en 3-5 días hábiles. Como disculpa, si decides volver, contáctanos para ofrecerte 1 mes gratis. Nuevamente, nuestras sinceras disculpas."
}

---

## INSTRUCCIONES FINALES:

1. SIEMPRE responde con JSON válido
2. SIEMPRE sé empático y profesional
3. Si el email NO es sobre reembolso/cancelación, usa tipo "OTRO"
4. Si falta información, marca cumple_politica como false
5. La respuesta_sugerida debe ser en el idioma del email recibido
```

---

## 📧 CONFIGURACIÓN DE CORREO

### Paso 1: Crear Email Dedicado

```bash
# Usar email de soporte existente
support@mindmetric.io

# Este email recibirá:
# - Solicitudes de reembolso
# - Quejas de clientes
# - Cancelaciones
# - Consultas generales
```

### Paso 2: Configurar Gmail en n8n

1. En n8n, añade nodo "Gmail Trigger"
2. Configura credenciales:
   - Email: `support@mindmetric.io`
   - App Password: (generar en Google Account)

#### Generar App Password de Gmail:

```
1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona: App = Mail, Device = Other
3. Nombre: "n8n Reembolsos MindMetric"
4. Click "Generate"
5. Copia la contraseña de 16 caracteres
6. Úsala en n8n
```

### Paso 3: Configurar SendGrid para Respuestas

```bash
# 1. Ve a SendGrid Dashboard
# 2. Crea API Key:
#    - Name: "n8n-refunds"
#    - Permissions: Mail Send (Full Access)

# 3. En n8n, añade nodo "SendGrid"
# 4. Configura:
#    - API Key: (la que generaste)
#    - From: support@mindmetric.io
#    - To: {{ $json.email_cliente }}
#    - Subject: "Re: Solicitud de Reembolso"
#    - Content: {{ $json.respuesta_sugerida }}
```

---

## 💳 INTEGRACIÓN CON STRIPE

### Funciones JavaScript para n8n

#### 1. Buscar Cliente en Stripe

Nodo: **HTTP Request**

```
Method: GET
URL: https://api.stripe.com/v1/customers/search
Headers:
  Authorization: Bearer {{ $env.STRIPE_SECRET_KEY }}
  Content-Type: application/x-www-form-urlencoded
Query Parameters:
  query: email:'{{ $json.email_cliente }}'
```

#### 2. Evaluar Política de Reembolso

Nodo: **Function** (Code)

```javascript
// Obtener datos del cliente de Stripe
const customer = $input.item.json.data[0];

if (!customer) {
  return {
    cumple_politica: false,
    razon: "Cliente no encontrado en Stripe"
  };
}

// Obtener pagos del cliente
const charges = customer.charges?.data || [];
const subscriptions = customer.subscriptions?.data || [];

// Buscar el pago inicial de 1€ (100 centavos)
const pagoInicial = charges.find(charge => 
  charge.amount === 50 + 50 && // Dos pagos de 0.50€
  charge.status === 'succeeded'
);

// Buscar suscripción activa
const suscripcionActiva = subscriptions.find(sub => 
  sub.status === 'active' || sub.status === 'trialing'
);

// Variables de tiempo
const ahora = Math.floor(Date.now() / 1000);
const hace30Dias = ahora - (30 * 24 * 60 * 60);

// EVALUAR REEMBOLSO INICIAL (1€)
if (pagoInicial && $json.tipo_solicitud === "REEMBOLSO_INICIAL") {
  // Verificar que fue hace menos de 30 días
  const dentroDeVentana = pagoInicial.created > hace30Dias;
  
  // Verificar que no tiene reembolsos previos
  const sinReembolsosPrevios = !charges.some(charge => charge.refunded);
  
  if (dentroDeVentana && sinReembolsosPrevios) {
    return {
      cumple_politica: true,
      razon: "Pago inicial dentro de 30 días, sin reembolsos previos",
      customer_id: customer.id,
      charge_id: pagoInicial.id,
      monto: pagoInicial.amount,
      tipo: "REEMBOLSO_INICIAL"
    };
  }
}

// EVALUAR REEMBOLSO SUSCRIPCIÓN
if (suscripcionActiva && $json.tipo_solicitud === "REEMBOLSO_SUSCRIPCION") {
  const ultimoCargo = charges
    .filter(c => c.amount > 100) // Más de 1€
    .sort((a, b) => b.created - a.created)[0];
  
  // Solo cumple si hay problemas técnicos documentados
  // o errores de facturación
  const motivosValidos = [
    "indisponibilidad",
    "problemas técnicos",
    "error de facturación",
    "cargo duplicado"
  ];
  
  const motivoValido = motivosValidos.some(motivo => 
    $json.motivo_solicitud.toLowerCase().includes(motivo)
  );
  
  if (motivoValido && ultimoCargo) {
    return {
      cumple_politica: true,
      razon: `Motivo válido: ${$json.motivo_solicitud}`,
      customer_id: customer.id,
      charge_id: ultimoCargo.id,
      subscription_id: suscripcionActiva.id,
      monto: ultimoCargo.amount,
      tipo: "REEMBOLSO_SUSCRIPCION"
    };
  }
}

// NO CUMPLE POLÍTICA
return {
  cumple_politica: false,
  razon: $json.razon_cumplimiento || "No cumple con los criterios de reembolso",
  customer_id: customer.id
};
```

#### 3. Crear Reembolso en Stripe

Nodo: **HTTP Request**

```
Method: POST
URL: https://api.stripe.com/v1/refunds
Headers:
  Authorization: Bearer {{ $env.STRIPE_SECRET_KEY }}
  Content-Type: application/x-www-form-urlencoded
Body (x-www-form-urlencoded):
  charge: {{ $json.charge_id }}
  amount: {{ $json.monto }}
  reason: requested_by_customer
  metadata[email]: {{ $json.email_cliente }}
  metadata[razon]: {{ $json.razon }}
```

#### 4. Cancelar Suscripción

Nodo: **HTTP Request** (Solo si reembolso de suscripción)

```
Method: DELETE
URL: https://api.stripe.com/v1/subscriptions/{{ $json.subscription_id }}
Headers:
  Authorization: Bearer {{ $env.STRIPE_SECRET_KEY }}
Query Parameters:
  invoice_now: true
  prorate: true
```

---

## 🧪 TESTING Y VERIFICACIÓN

### Test 1: Email de Reembolso Válido (Pago Inicial)

```
De: test@example.com
Para: support@mindmetric.io
Asunto: Reembolso por favor

Hola,

Pagué 1€ hace 2 días para ver mi resultado del test de CI,
pero no quedé satisfecho con la información.

¿Pueden devolverme mi dinero?

Gracias.
```

**Resultado Esperado:**
- ✅ IA clasifica como: REEMBOLSO_INICIAL
- ✅ Busca cliente en Stripe
- ✅ Evalúa: cumple_politica = true (< 30 días)
- ✅ Crea reembolso en Stripe
- ✅ Envía email confirmando reembolso
- ✅ Registra en log

---

### Test 2: Email de Reembolso Inválido (Cambio de Opinión)

```
De: test2@example.com
Para: support@mindmetric.io
Asunto: Cancelar suscripción

Hola,

Olvidé cancelar y me cobraron 19.99€.
Ya no quiero el servicio, devuélvanme el dinero.

Gracias.
```

**Resultado Esperado:**
- ✅ IA clasifica como: REEMBOLSO_SUSCRIPCION
- ✅ Busca cliente en Stripe
- ✅ Evalúa: cumple_politica = false (cambio opinión)
- ❌ NO crea reembolso
- ✅ Envía email explicando política
- ✅ Ofrece cancelación sin reembolso
- ✅ Registra en log

---

### Test 3: Email de Problema Técnico (Válido)

```
De: test3@example.com
Para: support@mindmetric.io
Asunto: Web caída

Hola,

La web estuvo caída todo el fin de semana y no pude
acceder a mis resultados. Me cobraron 19.99€ igual.

Quiero un reembolso.
```

**Resultado Esperado:**
- ✅ IA clasifica como: REEMBOLSO_SUSCRIPCION
- ✅ Evalúa: cumple_politica = true (indisponibilidad)
- ✅ Crea reembolso en Stripe
- ✅ Cancela suscripción
- ✅ Envía email con disculpas
- ✅ Notifica a Slack (equipo técnico)
- ✅ Registra en log

---

### Verificar Logs en n8n

```bash
# Ver ejecuciones del workflow
1. Ve a n8n dashboard
2. Click en workflow "Agente Reembolsos"
3. Tab "Executions"
4. Revisa cada paso:
   - ✅ Email recibido
   - ✅ IA respondió
   - ✅ Stripe encontró cliente
   - ✅ Reembolso procesado
   - ✅ Email enviado
```

---

## 📊 MONITOREO Y MEJORAS

### Dashboard de Métricas

Crear en Airtable/Google Sheets:

| Fecha | Email | Tipo | Cumple | Reembolso | Monto | Tiempo | IA Correct |
|-------|-------|------|--------|-----------|-------|--------|------------|
| 2025-12-18 | test@x.com | INICIAL | ✅ | ✅ | 1€ | 2m | ✅ |
| 2025-12-18 | test2@x.com | SUSCRIPCIÓN | ❌ | ❌ | 0€ | 1m | ✅ |

### KPIs a Monitorear

```
📊 Tasa de Aprobación
   - Formula: (Reembolsos Aprobados / Total Solicitudes) * 100
   - Objetivo: 20-30%

⏱️ Tiempo Promedio de Respuesta
   - Formula: Promedio de tiempo desde email recibido hasta respuesta enviada
   - Objetivo: < 5 minutos

🎯 Precisión de IA
   - Formula: (Decisiones IA Correctas / Total Decisiones) * 100
   - Objetivo: > 95%

💰 Monto Total Reembolsado
   - Formula: Suma de todos los reembolsos del mes
   - Análisis: Comparar con ingresos

😊 Satisfacción del Cliente
   - Añadir link en email de respuesta
   - "¿Quedaste satisfecho con nuestra respuesta? [Sí] [No]"
```

### Notificaciones a Slack

Nodo: **Slack**

```
Channel: #soporte
Message:
🤖 Nuevo Reembolso Procesado

Cliente: {{ $json.email_cliente }}
Tipo: {{ $json.tipo }}
Monto: {{ $json.monto / 100 }}€
Razón: {{ $json.razon }}

[Ver en Stripe](https://dashboard.stripe.com/customers/{{ $json.customer_id }})
```

---

## 🔐 SEGURIDAD Y PRIVACIDAD

### Mejores Prácticas

1. **Variables de Entorno**
   ```bash
   # NO hardcodear claves en el workflow
   # Usar variables de entorno en n8n
   
   Settings → Variables
   - STRIPE_SECRET_KEY
   - OPENAI_API_KEY
   - SENDGRID_API_KEY
   ```

2. **Logs Seguros**
   ```javascript
   // NO guardar información sensible en logs
   // Ofuscar emails en logs públicos
   
   const emailOfuscado = email.replace(/(.{2})(.*)(@.*)/, 
     (match, inicio, medio, dominio) => 
       inicio + '*'.repeat(medio.length) + dominio
   );
   ```

3. **Validación de Emails**
   ```javascript
   // Verificar que el email del remitente coincide
   // con el email del cliente en Stripe
   
   if (emailRemitente !== emailStripe) {
     return {
       error: "Email no coincide con cliente en Stripe",
       accion: "Solicitar verificación de identidad"
     };
   }
   ```

4. **Rate Limiting**
   ```javascript
   // Limitar intentos de reembolso por email
   // Máximo 3 solicitudes por mes
   
   const solicitudesMes = contarSolicitudes(email, ultimoMes);
   
   if (solicitudesMes > 3) {
     return {
       error: "Límite de solicitudes excedido",
       accion: "Contactar soporte humano"
     };
   }
   ```

---

## 🎓 MEJORAS FUTURAS

### Fase 2: Agente Más Inteligente

1. **Análisis de Sentimiento Avanzado**
   - Detectar si el cliente está realmente enojado
   - Escalar a humano si emoción = "MUY_ENOJADO"

2. **Machine Learning**
   - Entrenar modelo con casos reales
   - Mejorar precisión de decisiones

3. **Multi-idioma**
   - Detectar idioma del email
   - Responder en mismo idioma

### Fase 3: Integración con CRM

1. **Hubspot/Intercom**
   - Crear ticket automático
   - Añadir nota al perfil del cliente

2. **Base de Datos Interna**
   - Guardar historial completo
   - Dashboard admin para revisar casos

3. **A/B Testing de Respuestas**
   - Probar diferentes tonos de respuesta
   - Medir satisfacción del cliente

---

## 📞 SOPORTE

### ¿Problemas con el Workflow?

1. **Verificar Credenciales**
   ```bash
   n8n → Settings → Credentials
   - Gmail: Reconectar
   - Stripe: Verificar API key
   - OpenAI: Verificar saldo
   ```

2. **Ver Logs de Error**
   ```bash
   n8n → Executions → [Click en ejecución fallida]
   - Ver nodo que falló
   - Ver error específico
   ```

3. **Test Individual de Nodos**
   ```bash
   - Click en nodo
   - Click "Execute Node"
   - Ver resultado
   ```

### Recursos Útiles

- **Documentación n8n**: https://docs.n8n.io
- **Comunidad n8n**: https://community.n8n.io
- **Stripe API**: https://stripe.com/docs/api
- **OpenAI API**: https://platform.openai.com/docs

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```
SETUP INICIAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Cuenta de n8n creada
□ Claves API obtenidas (OpenAI, Stripe, SendGrid)
□ Email support@mindmetric.io creado
□ Gmail App Password generada

CONFIGURACIÓN WORKFLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Workflow importado en n8n
□ Credenciales configuradas
□ Prompt de IA actualizado
□ Variables de entorno añadidas

TESTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Test 1: Reembolso inicial válido
□ Test 2: Reembolso suscripción válido
□ Test 3: Reembolso inválido (cambio opinión)
□ Test 4: Email no relacionado con reembolso

MONITOREO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Dashboard de métricas creado
□ Notificaciones Slack configuradas
□ Airtable/Sheets conectado
□ Alertas de error configuradas

PRODUCCIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Workflow activado 24/7
□ Claves de producción de Stripe
□ Monitoreo activo
□ Documentación para equipo
```

---

## 🎉 ¡LISTO!

Tu agente de IA está configurado y listo para procesar reembolsos automáticamente.

**Próximos pasos:**

1. ✅ Monitorear las primeras 10 solicitudes manualmente
2. ✅ Ajustar el prompt de IA según resultados
3. ✅ Configurar alertas para casos edge
4. ✅ Entrenar al equipo sobre el nuevo sistema

**Tiempo estimado de ahorro:**

- Antes: 10-15 min por solicitud de reembolso (manual)
- Ahora: < 1 min (automático)
- Ahorro: ~90% del tiempo

**ROI:**

- Costo: $20/mes (n8n) + $5/mes (OpenAI) = $25/mes
- Ahorro: 10 horas/mes × $20/hora = $200/mes
- ROI: 8x

---

**¿Necesitas ayuda con la implementación?**

📧 Contacta: support@mindmetric.io

