# 🚨 CONSULTA URGENTE A SIPAY - Integración Frontend

## Contexto
Estamos integrando Sipay en nuestra aplicación web (Next.js/React) y necesitamos ayuda con la integración del formulario de pago en el frontend.

## Lo que necesitamos

**Objetivo:** Mostrar un formulario de pago de tarjeta **embebido directamente en nuestra página** (no redirección, no modal popup).

### Flujo deseado:
1. Usuario está en checkout
2. Ve campos de tarjeta (número, CVV, fecha, nombre) **en la misma página**
3. Ingresa datos de tarjeta
4. Hace click en botón "Pagar 0,50€"
5. Sipay tokeniza la tarjeta y devuelve token
6. Enviamos token a nuestro backend para procesar el pago

## Preguntas específicas

### 1. ¿Cuál es el script correcto para cargar el SDK?

Hemos intentado:
- `https://sandbox.sipay.es/js/sipay-sdk.js` ❌ (404 Not Found)
- `https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js` ❌ (Solo modal, no formulario embebido)

**¿Cuál es la URL correcta del SDK de Sipay para formularios embebidos?**

### 2. ¿Cómo se inicializa el formulario?

¿Es algo así?:

```javascript
// ¿Opción A?
const sipay = new Sipay({
  key: 'clicklabsdigital',
  resource: 'clicklabsdigital',
  amount: 50,
  currency: 'EUR'
})
sipay.render('payment-form-container')
sipay.on('token', (token) => {
  // Enviar token al backend
})
```

```javascript
// ¿Opción B?
Sipay.init({
  containerId: 'payment-form',
  key: 'clicklabsdigital',
  ...
})
```

```html
<!-- ¿Opción C? -->
<iframe src="https://sandbox.sipay.es/payment/xxxx"></iframe>
```

### 3. ¿Usan Hosted Payment Page o SDK?

- **Hosted Payment Page:** Generamos URL desde backend → redirigimos al usuario
- **SDK embebido:** Cargamos script → renderizamos formulario en iframe
- **API directa:** No hay SDK, integramos manualmente

**¿Cuál método usa Sipay para "only_card"?**

### 4. ¿Tienen un ejemplo completo de integración React?

¿Pueden compartir:
- Código HTML/JavaScript de ejemplo
- Repositorio de demostración
- Documentación con código completo

## Nuestras credenciales de sandbox

```
Endpoint: https://sandbox.sipay.es
Key: clicklabsdigital
Secret: 3KsWEtN9J0z
Resource: clicklabsdigital
```

## Documentación que hemos revisado

- ✅ Frontend: https://developer.sipay.es/docs/documentation/online/selling/only_card
- ✅ Backend (tokenización): https://developer.sipay.es/docs/api/mdwr/allinone#2-autorizaci%C3%B3n-con-autenticaci%C3%B3n-con-almacenamiento-de-tarjeta-tokenizaci%C3%B3n
- ✅ Backend (MIT): https://developer.sipay.es/docs/api/mdwr/allinone#4-autorizaci%C3%B3n-con-exenci%C3%B3n-mit-r

**Pero la documentación del frontend no especifica claramente cómo cargar el SDK o renderizar el formulario.**

## Contacto urgente

Por favor, ¿pueden responder con:
1. URL del script del SDK
2. Código de ejemplo de inicialización
3. Método de captura de token

**Email para respuesta:** info@agutidesigns.com

---

## Alternativa temporal

Mientras esperamos respuesta de Sipay, ¿podemos usar una Hosted Payment Page como alternativa?

Si generamos una URL de pago desde el backend, ¿pueden mostrarla en un iframe embebido?

```html
<iframe 
  src="https://sandbox.sipay.es/checkout/[session-id]" 
  width="100%" 
  height="500"
/>
```

---

**Prioridad:** ALTA - Bloqueando despliegue a producción
**Fecha:** Enero 26, 2026

