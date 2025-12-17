# 🏷️ GOOGLE TAG MANAGER - GUÍA COMPLETA

## ⚠️ ADVERTENCIA IMPORTANTE

**ANTES DE CONTINUAR:** Esta guía es para instalar Google Tag Manager (GTM). Solo debes seguirla si:

- ❌ NO tienes prisa
- ❌ NO tienes miedo de romper cosas temporalmente
- ❌ NO estás en medio de una campaña de ads
- ✅ Entiendes que deberás reconfigurar TODAS las etiquetas
- ✅ Tienes tiempo para aprender GTM

**SI NO ESTÁS SEGURO: NO INSTALES GTM. LO QUE TIENES AHORA FUNCIONA PERFECTAMENTE.**

---

## 📊 COMPARACIÓN: CON vs SIN GTM

### SIN GTM (Estado Actual):

```
PROS:
✅ Simple
✅ Funciona perfectamente
✅ Fácil de entender
✅ Menos cosas que pueden fallar

CONTRAS:
❌ Cada nueva etiqueta requiere cambiar código
❌ Cada cambio requiere deployment
```

### CON GTM:

```
PROS:
✅ Gestionar todas las etiquetas desde un dashboard
✅ Añadir/modificar etiquetas sin tocar código
✅ Testing antes de publicar
✅ Versionado de cambios
✅ Triggers y variables avanzadas

CONTRAS:
❌ Configuración inicial compleja
❌ Debes eliminar etiquetas directas
❌ Curva de aprendizaje
❌ Puede causar problemas si se configura mal
```

---

## 🚀 INSTALACIÓN DE GTM (SI DECIDES HACERLO)

### PASO 1: Crear el Componente GTM

**Archivo:** `components/GoogleTagManager.tsx`

```typescript
'use client'

import Script from 'next/script'

export default function GoogleTagManager() {
  const GTM_ID = 'GTM-N79X6BWZ'

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  )
}

// Componente para el noscript (debe ir en el body)
export function GoogleTagManagerNoScript() {
  const GTM_ID = 'GTM-N79X6BWZ'
  
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
```

### PASO 2: Modificar el Layout

**Archivo:** `app/layout.tsx`

```typescript
import GoogleTagManager, { GoogleTagManagerNoScript } from '@/components/GoogleTagManager'
// ELIMINAR: import GoogleAnalytics from '@/components/GoogleAnalytics'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManager />
        {/* ELIMINAR: <GoogleAnalytics /> */}
      </head>
      <body>
        <GoogleTagManagerNoScript />
        {children}
      </body>
    </html>
  )
}
```

### PASO 3: ELIMINAR Etiquetas Directas

**⚠️ IMPORTANTE: Debes eliminar TODAS las etiquetas directas para evitar duplicados**

1. **ELIMINAR o COMENTAR:** `components/GoogleAnalytics.tsx`
2. **ELIMINAR de:** `app/[lang]/resultado/page.tsx` el código de conversión de Google Ads

```typescript
// ELIMINAR ESTO:
useEffect(() => {
  if (testData) {
    ;(window as any).gtag('event', 'conversion', {
      'send_to': 'AW-17232820139/qMCRCP_NnK4bEKvvn5lA',
      'value': 1.00,
      'currency': 'EUR',
    })
  }
}, [testData])
```

### PASO 4: Configurar GTM Dashboard

1. **Ve a:** https://tagmanager.google.com/

2. **Crea las siguientes etiquetas:**

#### 📊 ETIQUETA 1: Google Analytics GA4

```
Tipo: Google Analytics: GA4 Configuration
ID de medición: G-ETQT995RPQ
Activación: All Pages
```

#### 🎯 ETIQUETA 2: Google Ads Config

```
Tipo: Google Ads Tag
ID de conversión: AW-17232820139
Activación: All Pages
```

#### 💰 ETIQUETA 3: Google Ads Conversion

```
Tipo: Google Ads Conversion Tracking
ID de conversión: AW-17232820139
Etiqueta de conversión: qMCRCP_NnK4bEKvvn5lA
Valor de conversión: 1.00
Código de moneda: EUR
Activación: (crear trigger personalizado para /resultado)
```

#### 👥 ETIQUETA 4: Facebook Pixel (si lo tienes)

```
Tipo: Custom HTML
HTML: (tu código de Facebook Pixel)
Activación: All Pages
```

### PASO 5: Crear Triggers

#### Trigger para Conversión:

```
Nombre: Página de Resultado
Tipo: Page View
Se activa en: Page Path contains "/resultado"
```

### PASO 6: Publicar y Probar

1. **Click en "Enviar"** (Submit) en GTM
2. **Nombre de versión:** "Configuración inicial - Analytics + Ads + Conversiones"
3. **Publicar**

4. **Probar con Tag Assistant:**
   - Instala: Google Tag Assistant
   - Ve a: https://mindmetric.io/
   - Verifica que se disparan todas las etiquetas

---

## 🔬 VERIFICACIÓN POST-INSTALACIÓN

### 1. Verificar GTM cargado:

```javascript
// En la consola del navegador (F12)
google_tag_manager
// Debería mostrar el objeto de GTM
```

### 2. Verificar dataLayer:

```javascript
// En la consola del navegador (F12)
dataLayer
// Debería mostrar los eventos
```

### 3. Verificar Google Analytics:

```javascript
// En la consola del navegador (F12)
gtag
// Debería estar definido
```

---

## ⚠️ PROBLEMAS COMUNES

### Problema 1: Duplicados

**Síntoma:** Los eventos se registran 2 veces

**Causa:** No eliminaste las etiquetas directas del código

**Solución:** Asegúrate de eliminar `GoogleAnalytics.tsx` del layout

### Problema 2: No se disparan conversiones

**Síntoma:** Las conversiones no aparecen en Google Ads

**Causa:** Trigger mal configurado

**Solución:** Verifica que el trigger esté configurado para `/resultado`

### Problema 3: GTM no carga

**Síntoma:** `google_tag_manager` es undefined

**Causa:** Bloqueador de anuncios o error en el código

**Solución:** Desactiva bloqueadores, verifica el código GTM

---

## 📋 CHECKLIST DE MIGRACIÓN

```
ANTES DE EMPEZAR:
□ Backup del código actual
□ Documentar qué etiquetas tienes
□ Tener acceso a GTM dashboard

DURANTE LA MIGRACIÓN:
□ Crear componente GoogleTagManager.tsx
□ Modificar app/layout.tsx
□ ELIMINAR GoogleAnalytics.tsx del layout
□ ELIMINAR código de conversiones directo
□ Configurar etiquetas en GTM dashboard
□ Crear triggers necesarios
□ Publicar versión en GTM

DESPUÉS DE LA MIGRACIÓN:
□ Verificar con Tag Assistant
□ Verificar en consola (dataLayer)
□ Hacer compra de prueba
□ Verificar conversiones en Google Ads
□ Verificar pageviews en Google Analytics
□ Verificar que NO hay duplicados
□ Monitorear durante 24-48 horas
```

---

## 🎯 CONFIGURACIÓN COMPLETA DE ETIQUETAS EN GTM

### Variables Personalizadas (si las necesitas):

```
Variable: Transaction Value
Tipo: Data Layer Variable
Nombre: transactionValue

Variable: User Email
Tipo: Data Layer Variable
Nombre: userEmail
```

### Etiquetas Avanzadas:

```
ETIQUETA: Purchase Event
Tipo: Google Analytics: GA4 Event
Nombre del evento: purchase
Parámetros:
  - transaction_id: {{Transaction ID}}
  - value: {{Transaction Value}}
  - currency: EUR
Activación: Página de Resultado
```

---

## 📊 MONITOREO POST-INSTALACIÓN

### Primeras 24 horas:

```
✅ Verificar que NO hay duplicados en Analytics
✅ Verificar que las conversiones se registran
✅ Verificar que los pageviews son correctos
✅ Verificar que Facebook Pixel funciona (si aplica)
```

### Primeros 7 días:

```
✅ Comparar datos con semana anterior
✅ Verificar que no hay caídas extrañas
✅ Revisar informes de Google Ads
✅ Revisar informes de Google Analytics
```

---

## 🔄 ROLLBACK (Volver Atrás)

Si algo sale mal y quieres volver al estado anterior:

### 1. Restaurar GoogleAnalytics.tsx en layout:

```typescript
// app/layout.tsx
import GoogleAnalytics from '@/components/GoogleAnalytics'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <GoogleAnalytics />
        {/* COMENTAR O ELIMINAR: <GoogleTagManager /> */}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 2. Restaurar código de conversión:

```typescript
// app/[lang]/resultado/page.tsx
useEffect(() => {
  if (testData) {
    ;(window as any).gtag('event', 'conversion', {
      'send_to': 'AW-17232820139/qMCRCP_NnK4bEKvvn5lA',
      'value': 1.00,
      'currency': 'EUR',
    })
  }
}, [testData])
```

### 3. Deploy y verificar

---

## 💡 RECOMENDACIÓN FINAL

**Para tu caso específico (MindMetric.io):**

```
❌ NO necesitas GTM ahora mismo porque:
   - Solo tienes 3 etiquetas (Analytics, Ads, Facebook)
   - Ya tienes todo funcionando
   - Acabas de arreglar problemas con etiquetas
   - No cambias etiquetas frecuentemente

✅ Considera GTM en el futuro si:
   - Necesitas añadir 10+ etiquetas
   - Tu equipo de marketing necesita autonomía
   - Necesitas A/B testing de etiquetas
   - Necesitas triggers complejos
```

---

## 📞 SOPORTE

Si decides instalar GTM y tienes problemas:

1. **Verifica con Tag Assistant:** https://tagassistant.google.com/
2. **Revisa GTM Preview Mode:** Modo vista previa en GTM dashboard
3. **Consulta la documentación:** https://support.google.com/tagmanager

---

**Fecha:** 17 Dic 2025
**Estado recomendado:** NO instalar GTM por ahora
**Alternativa:** Mantener configuración actual (funciona perfectamente)

