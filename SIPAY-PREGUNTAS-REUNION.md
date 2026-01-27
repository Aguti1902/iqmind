# 📋 Preguntas para Reunión con Sipay FastPay

## 🎯 Contexto de la Situación

**Aplicación**: MindMetric (https://mindmetric.io)  
**Stack**: Next.js 14 (React) con App Router  
**Objetivo**: Integrar FastPay iframe embebido para pagos de 0,50€  
**Estado Actual**: FastPay funciona en HTML puro pero NO en React/Next.js

---

## ✅ Lo que SÍ Funciona

Hemos creado un archivo HTML standalone (`test_fpay.html`) con la estructura exacta de su documentación:

```html
<script src="https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js"></script>

<button 
  class="fastpay-btn"
  data-key="clicklabsdigital"
  data-amount="50"
  data-currency="EUR"
  data-template="v4"
  data-callback="callbackFunction"
  data-paymentbutton="Pagar"
  data-cardholdername="true"
  data-remember="checkbox"
  data-remembertext="Recordar tarjeta"
  data-hiddenprice="false"
  data-lang="es">
</button>
```

**Resultado**: ✅ El iframe se renderiza perfectamente, se capturan datos de tarjeta, funciona al 100%.

---

## ❌ Lo que NO Funciona

**El mismo código exacto** en React/Next.js NO renderiza el iframe.

### Intentos Realizados:

1. ✅ **Botón renderizado en JSX**
   - Estructura idéntica al HTML
   - Todos los atributos `data-*` correctos
   - `class="fastpay-btn"` presente
   - ❌ Resultado: FastPay no detecta el botón

2. ✅ **Script en `<head>` con Next.js `<Script>`**
   - Strategy: `beforeInteractive`
   - Carga antes de React hydration
   - ❌ Resultado: FastPay no detecta el botón

3. ✅ **Script cargado dinámicamente con timing preciso**
   - Botón creado PRIMERO
   - Script cargado DESPUÉS (100ms delay)
   - useRef para mantener referencia estable
   - ❌ Resultado: FastPay no detecta el botón

4. ✅ **`dangerouslySetInnerHTML`**
   - Inyecta HTML sin que React lo toque
   - HTML exacto del ejemplo que funciona
   - ❌ Resultado: FastPay no detecta el botón

### Observaciones Técnicas:

- El botón está presente en el DOM (verificado con DevTools)
- Los atributos son idénticos al ejemplo que funciona
- El script `fastpay.js` se carga correctamente (200 OK)
- `window.FastPay` es `undefined` (FastPay no se inicializa)
- No hay errores en la consola
- **IMPORTANTE**: Según documentación, `request_id` expira en 5 minutos
- La documentación oficial NO menciona React/SPAs en ningún lugar
- El "Ejemplo completo" de la documentación no está visible/accesible

---

## 📚 Revisión de Documentación Oficial

Hemos revisado exhaustivamente la documentación oficial: https://developer.sipay.es/docs/documentation/online/selling/only_card/

### Lo que la documentación SÍ dice:

✅ **Script en `<head>`**: "Se recomienda incluir el fichero javascript en la etiqueta `<head>`"  
✅ **Viewport meta**: Necesario para responsive  
✅ **Atributos data-\***: Todos documentados claramente  
✅ **data-callback vs data-redirect**: Son mutuamente excluyentes  
✅ **request_id expira en 5 minutos**: Tiempo límite para procesar el pago  
✅ **Dimensiones del iframe**: 430x600 px en pantalla completa  

### Lo que la documentación NO dice:

❌ **Nada sobre React/Vue/Angular**  
❌ **Nada sobre SPAs (Single Page Applications)**  
❌ **Nada sobre integración en frameworks modernos**  
❌ **El "Ejemplo completo" no está visible en la página**  
❌ **No hay guía para timing de inicialización**  
❌ **No menciona cómo FastPay detecta los botones**  

**Conclusión**: La documentación **asume HTML estático puro** sin considerar arquitecturas modernas de frontend.

---

## 🔍 Preguntas Específicas para Sipay

### 1. Compatibilidad con SPAs

**Pregunta**: ¿FastPay es compatible con Single Page Applications (SPAs) como React, Vue, Angular?

**Por qué es importante**: En SPAs, el DOM se modifica dinámicamente y el ciclo de vida es diferente a HTML estático.

---

### 2. Inicialización Manual

**Pregunta**: ¿Existe alguna forma de inicializar FastPay manualmente en lugar de depender de la detección automática del botón?

**Ejemplo de lo que buscamos**:
```javascript
// ¿Algo así existe?
FastPay.init({
  container: '#my-container',
  key: 'clicklabsdigital',
  amount: 50,
  currency: 'EUR',
  callback: myCallback
});
```

---

### 3. Documentación para React/Next.js

**Pregunta**: ¿Tienen documentación específica o ejemplos de integración de FastPay en aplicaciones React o Next.js?

**Por qué**: Su documentación actual solo muestra HTML estático. Necesitamos guía específica para frameworks modernos.

---

### 4. Timing de Inicialización

**Pregunta**: ¿En qué momento exacto FastPay busca los botones con `class="fastpay-btn"`?

**Escenarios**:
- ¿Solo cuando el script se carga?
- ¿Observa cambios en el DOM (MutationObserver)?
- ¿Necesita que el botón exista ANTES de cargar el script?
- ¿Podemos forzar una re-inicialización después de cargar el script?

---

### 5. Eventos del Script

**Pregunta**: ¿El script `fastpay.js` dispara algún evento cuando se inicializa o cuando detecta/transforma botones?

**Por qué**: Necesitamos saber cuándo FastPay está listo para poder sincronizar con el ciclo de vida de React.

**Ejemplo de lo que buscamos**:
```javascript
window.addEventListener('fastpay:ready', () => {
  console.log('FastPay initialized');
});
```

---

### 6. Objeto Global FastPay

**Pregunta**: ¿Debería haber un objeto `window.FastPay` disponible después de cargar el script?

**Observación**: En nuestras pruebas, `window.FastPay` es `undefined`, lo que sugiere que el script no se está inicializando correctamente.

---

### 7. Configuración del Recurso

**Pregunta**: ¿La KEY `clicklabsdigital` está correctamente configurada para:
- Sandbox environment
- FastPay iframe embebido
- Dominio `mindmetric.io`

**Por qué**: Queremos descartar que sea un problema de configuración de cuenta.

---

### 8. Restricciones de Dominio

**Pregunta**: ¿Hay restricciones de dominio configuradas para nuestra cuenta que puedan estar bloqueando FastPay?

**Dominios donde necesitamos que funcione**:
- `mindmetric.io` (producción)
- `localhost:3000` (desarrollo)
- Dominios de preview de Vercel (ej: `mindmetric-xyz.vercel.app`)

---

### 9. Modo de Integración Alternativo

**Pregunta**: Si FastPay iframe embebido no es compatible con SPAs, ¿existe alguna alternativa?

**Opciones que conocemos**:
- ✅ Redirección a página externa (hosted payment page)
- ✅ Modal/popup
- ❌ Iframe embebido (lo que necesitamos pero no funciona)

**Por qué preferimos iframe embebido**: Mejor experiencia de usuario, sin salir de la aplicación.

---

### 10. Ejemplo Completo de la Documentación

**Pregunta**: En la página https://developer.sipay.es/docs/documentation/online/selling/only_card/ se menciona un "Ejemplo completo" al final, pero no se muestra el código. ¿Pueden proporcionárnoslo?

**Por qué es importante**: Queremos asegurarnos de que no estamos pasando por alto ningún detalle de implementación.

---

### 11. Integración en Frameworks Modernos

**Pregunta**: ¿Por qué la documentación oficial NO menciona React, Vue, Angular o ningún framework moderno? ¿FastPay está diseñado solo para HTML estático?

**Observación**: La documentación asume HTML puro en todos los ejemplos. No hay guías para SPAs.

---

### 12. Soporte Técnico Directo

**Pregunta**: ¿Pueden ayudarnos con la integración directamente? ¿Tienen servicio de implementación?

**Lo que podemos proporcionar**:
- Acceso a nuestro repositorio de código
- Reunión técnica de screen sharing
- Entorno de staging para pruebas

---

## 📊 Información Técnica de Nuestra Aplicación

### Stack Tecnológico:
- **Framework**: Next.js 14.2.35 (App Router)
- **React**: 18.x
- **Rendering**: Server-Side Rendering (SSR) + Client Components
- **Hosting**: Vercel
- **Base de datos**: PostgreSQL (Neon)

### Flujo de Pago Deseado:
```
1. Usuario completa test → Página de checkout (React)
2. Usuario introduce email → Click en "Continuar al Pago"
3. FastPay iframe aparece → Usuario introduce datos de tarjeta
4. Callback con request_id → Procesamos pago con API de Sipay
5. Redirigimos a página de resultado → Usuario accede al test
```

### Flujo Actual (Workaround):
```
1. Usuario completa test → Página de checkout (React)
2. Usuario introduce email → Click en "Continuar al Pago"
3. REDIRECCIÓN a /sipay-checkout.html (HTML puro, sin React)
4. FastPay iframe aparece → Usuario introduce datos de tarjeta
5. Callback con request_id → REDIRECCIÓN a /sipay-result (React)
6. Procesamos pago → Redirigimos a página de resultado
```

**Problema del workaround**: La doble redirección no es ideal para UX, pero es la única forma que funciona.

---

## 🎯 Lo que Necesitamos de Sipay

### Opción Ideal:
Una forma de integrar FastPay iframe directamente en nuestra aplicación React/Next.js sin redirecciones.

### Alternativas Aceptables:

1. **Documentación técnica específica** para React/Next.js
2. **Soporte directo de implementación** (screen sharing, código de ejemplo)
3. **Modo de integración alternativo** compatible con SPAs
4. **Confirmación** de que FastPay NO es compatible con SPAs (para que dejemos de intentar)

---

## 📝 Código de Ejemplo para Compartir

Si Sipay necesita ver nuestro código, tenemos:

1. **HTML standalone que funciona**: `test_fpay.html` ✅
2. **Componente React que no funciona**: `checkout-sipay.tsx` ❌
3. **Repositorio completo**: GitHub (podemos dar acceso)
4. **URL de staging**: Pueden probar directamente

---

## ✅ Checklist para la Reunión

Antes de la reunión, asegúrate de:

- [ ] Tener acceso a la consola de desarrollador
- [ ] Poder hacer screen sharing
- [ ] Tener el archivo `test_fpay.html` funcionando para demostrar
- [ ] Tener la aplicación React abierta para mostrar el problema
- [ ] Anotar el número de recurso: `clicklabsdigital`
- [ ] Tener las credenciales de sandbox a mano
- [ ] Preparar ejemplos de código para mostrar

---

## 🎤 Apertura Sugerida para la Reunión

> "Hola, estamos integrando FastPay en nuestra aplicación Next.js (React). Hemos seguido su documentación al pie de la letra y funciona perfectamente en HTML puro, pero no funciona en React. Hemos probado múltiples approaches técnicos sin éxito. Necesitamos entender si FastPay es compatible con SPAs y, de ser así, cómo implementarlo correctamente. Si no es compatible, necesitamos conocer alternativas."

---

## 🚨 Si Todo lo Demás Falla

Si Sipay confirma que FastPay NO es compatible con React/Next.js, tenemos dos opciones:

### Opción A: Mantener el Workaround Actual
- ✅ Funciona al 100%
- ❌ UX no es ideal (doble redirección)
- ✅ Fácil de mantener

### Opción B: Usar Stripe o Otro Proveedor
- ✅ Excelente compatibilidad con React
- ✅ Documentación completa
- ❌ Cambio de proveedor (trabajo adicional)

---

**Fecha**: 2026-01-28  
**Preparado por**: Equipo Técnico MindMetric  
**Contacto**: info@agutidesigns.com

