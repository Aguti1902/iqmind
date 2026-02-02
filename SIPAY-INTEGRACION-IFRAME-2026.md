# Integración Sipay con ejemplos oficiales (iframe_2026)

Sipay envió ejemplos de React y Next.js para integrar FastPay (solo tarjeta) en una SPA. Este documento describe cómo se han aplicado en MindMetric.

## Qué envió Sipay

- **Carpeta:** `iframe_2026`
- **Contenido:**
  - `iframe_nextjs/` — Ejemplo Next.js (App Router)
  - `iframe_react/` — Ejemplo React (Vite)
  - `INSTRUCTIONS.md` en cada uno con pasos de ejecución e integración

## Enfoque oficial recomendado

En Next.js/React **no** se pone el botón FastPay directamente en el DOM de React, porque el script de FastPay enlaza el botón al cargar (p. ej. en `DOMContentLoaded`) y en una SPA el botón puede no existir o no estar estable cuando el script corre.

**Solución oficial:** cargar el formulario FastPay dentro de un **iframe** que apunta a una **página HTML estática**. Esa página tiene el botón en el HTML y el script de FastPay al final, por lo que el orden es correcto. Al terminar el pago, la página del iframe envía el resultado al padre con **postMessage**.

### Flujo

1. La página Next.js (checkout) llama a tu API para crear la sesión de pago y obtiene `orderId`, `amount`, `sipayConfig.key`, etc.
2. Se muestra un **iframe** con `src="/fastpay-standalone.html?key=...&amount=...&orderId=...&lang=..."`.
3. La página `fastpay-standalone.html`:
   - Tiene un `<button class="fastpay-btn">` con los `data-*` necesarios.
   - Carga el script de FastPay al final del `<body>`.
   - Opcionalmente hace un click programático al botón tras ~600 ms para abrir el formulario (como en el ejemplo de Sipay).
   - En el callback de FastPay: `window.parent.postMessage({ type: 'sipay_fastpay_done', request_id, orderId, amountCents, payload }, '*')`.
4. La página Next.js escucha `message` y, si `event.data.type === 'sipay_fastpay_done'` y hay `request_id`, llama a tu backend con `request_id` para completar el pago (autorización + tokenización) y redirige al resultado.

## Archivos en MindMetric

| Archivo | Uso |
|--------|-----|
| `public/fastpay-standalone.html` | Página estática que carga FastPay; lee `key`, `amount`, `orderId`, `lang` por query y envía el resultado por postMessage. Basada en `iframe_2026/iframe_nextjs/public/fastpay-standalone.html`. |
| `app/[lang]/checkout/checkout-sipay.tsx` | Página de checkout: crea sesión, muestra iframe a `fastpay-standalone.html` con query params, escucha postMessage y llama a `/api/sipay/process-payment` con el `request_id`. |

## Cómo probar

1. Ir a `/[lang]/checkout` (o la ruta que lleve al checkout Sipay).
2. Comprobar que se crea la sesión y aparece el iframe con el formulario de tarjeta (launcher o formulario según el ejemplo).
3. Completar el pago en el iframe; la ventana padre debe recibir el postMessage y redirigir a la página de resultado tras procesar el pago en el backend.

## Producción

- En **sandbox** el script es: `https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js`.
- En **producción** hay que cambiar a: `https://live.sipay.es/fpay/v1/static/bundle/fastpay.js` (en `fastpay-standalone.html` o según variable de entorno / build).

## Referencia

- Ejemplo Next.js: `iframe_2026/iframe_nextjs/`
- Instrucciones: `iframe_2026/iframe_nextjs/INSTRUCTIONS.md`
- Documentación Sipay Only Card: https://developer.sipay.es/docs/documentation/online/selling/only_card
