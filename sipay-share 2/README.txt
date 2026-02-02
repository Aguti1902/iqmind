MINDMETRIC - INTEGRACIÓN FASTPAY
Recurso Sipay: clicklabsdigital
Fecha: 2026-01-28

═══════════════════════════════════════════════════════════════

PROBLEMA:
FastPay funciona perfectamente en HTML puro pero NO funciona en React/Next.js

═══════════════════════════════════════════════════════════════

ARCHIVOS INCLUIDOS:

1. SipayCheckout.tsx
   → Componente React que NO renderiza el iframe
   → Línea 74-84: Carga del script con next/script
   → Línea 100-119: Botón con todos los data-* atributos
   → Línea 40-55: Callback function configurado
   → STATUS: ❌ NO FUNCIONA

2. checkout-payment-page.tsx
   → Página Next.js que usa el componente SipayCheckout
   → Usa Suspense para SSR
   → Pasa props: email, amount, merchantKey, callbacks
   → STATUS: ❌ NO FUNCIONA

3. test-fastpay-working.html
   → HTML puro standalone
   → MISMO código de los ejemplos de su documentación
   → STATUS: ✅ FUNCIONA PERFECTAMENTE

4. package.json
   → Next.js: 14.2.35
   → React: 18.x
   → Vercel deployment

5. next.config.js
   → Configuración del proyecto

═══════════════════════════════════════════════════════════════

LO QUE HEMOS PROBADO:

✅ Botón renderizado en JSX con todos los data-* atributos
✅ Script cargado con next/script (beforeInteractive, afterInteractive)
✅ Script cargado dinámicamente con createElement
✅ dangerouslySetInnerHTML para inyectar HTML sin React
✅ Botón creado ANTES de cargar el script
✅ Script cargado ANTES del hydration
✅ useRef para mantener referencias estables
✅ MutationObserver para detectar cambios
✅ Delays y timeouts para timing
✅ Verificación en DevTools: botón presente, atributos correctos

RESULTADO: En TODOS los casos, FastPay NO detecta el botón.

═══════════════════════════════════════════════════════════════

OBSERVACIONES TÉCNICAS:

- El botón está presente en el DOM ✅
- Los atributos son idénticos al HTML que funciona ✅
- El script fastpay.js se carga (200 OK) ✅
- window.FastPay es undefined ❌
- No hay errores en la consola ✅
- El iframe simplemente no aparece ❌

═══════════════════════════════════════════════════════════════

PREGUNTA PRINCIPAL:

¿Qué estamos haciendo mal en React/Next.js?

O

¿FastPay NO es compatible con SPAs (Single Page Applications)?

═══════════════════════════════════════════════════════════════

ALTERNATIVAS QUE NECESITAMOS:

Si FastPay iframe NO es compatible con React:
- ¿Existe un modo de integración alternativo?
- ¿Tienen una librería React oficial?
- ¿Podemos usar redirect o modal?
- ¿Existe documentación para SPAs?

═══════════════════════════════════════════════════════════════

INFORMACIÓN ADICIONAL:

Aplicación: https://mindmetric.io
Stack: Next.js 14 + React 18
Hosting: Vercel
Entorno: Sandbox (preparando para producción)

Documentación revisada:
https://developer.sipay.es/docs/documentation/online/selling/only_card/

═══════════════════════════════════════════════════════════════

CONTACTO:

Nombre: [COMPLETAR]
Email: info@agutidesigns.com
Teléfono: [COMPLETAR]

Disponibilidad para reunión técnica (screen sharing):
- [PROPONER FECHAS/HORAS]

═══════════════════════════════════════════════════════════════

SOLICITUD:

Por favor, revisen nuestro código y díganmos:
1. ¿Qué estamos haciendo mal?
2. ¿O FastPay no funciona con React?
3. ¿Qué solución nos recomiendan?

Muchas gracias por su ayuda.

Equipo MindMetric

