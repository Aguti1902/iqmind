# ❓ Consulta a Sipay: Integración Frontend

## 🎯 Situación Actual

Tenemos:
- ✅ Credenciales configuradas (Key, Secret, Resource)
- ✅ Backend implementado (crear pago, tokenizar, cobros recurrentes)
- ❌ Frontend bloqueado - no sabemos cómo integrar el formulario

---

## 📧 Email para Sipay

```
Asunto: Consulta - Integración del formulario de pago en frontend

Hola,

Estoy integrando Sipay en mi web (mindmetric.io) y tengo las credenciales de sandbox funcionando en el backend.

Sin embargo, tengo dudas sobre cómo integrar el formulario de pago en el frontend.

PREGUNTA 1: ¿Cuál es la URL del SDK JavaScript de Sipay?
He intentado cargar:
- https://sandbox.sipay.es/js/sipay-sdk.js
- https://sandbox.sipay.es/js/sipay.js

Pero no funcionan. ¿Cuál es la URL correcta?

PREGUNTA 2: ¿Sipay proporciona un SDK JavaScript o debo usar redirección?
Necesito saber si:
a) Existe un SDK JavaScript para mostrar el formulario embebido en mi página
b) Debo redirigir al usuario a una URL de Sipay y él vuelve a mi web
c) Debo usar un iframe con una URL específica

PREGUNTA 3: ¿Documentación de integración frontend?
¿Tienen documentación con ejemplos de código JavaScript/React para integrar el formulario?

Mi setup actual:
- Framework: Next.js 14 (React)
- Tipo de pago: Pago inicial (0,50€) + tokenización para pagos recurrentes
- Credenciales: clicklabsdigital (sandbox)

Agradecería un ejemplo de código o enlace a la documentación correcta.

Gracias,
[Tu nombre]
```

---

## 🔍 Mientras Tanto - Opciones de Integración Comunes

### **Opción 1: Hosted Payment Page (Redirect)**
El usuario es redirigido a una página de Sipay:
```javascript
// Backend devuelve URL de pago
const paymentUrl = "https://sandbox.sipay.es/payment?token=xxx"

// Frontend redirige
window.location.href = paymentUrl
```

### **Opción 2: Iframe Embebido**
El formulario de Sipay se muestra en un iframe:
```html
<iframe 
  src="https://sandbox.sipay.es/paymentwall?token=xxx"
  width="100%"
  height="600px"
></iframe>
```

### **Opción 3: SDK JavaScript (si existe)**
```javascript
// Cargar SDK
<script src="https://sandbox.sipay.es/js/sipay.js"></script>

// Inicializar
const sipay = new Sipay({
  key: 'clicklabsdigital',
  // ...
})
```

---

## 📚 Enlaces de Documentación (del usuario)

Del mensaje inicial, teníamos:
- **Frontend:** https://developer.sipay.es/docs/documentation/online/selling/only_card

⚠️ **Necesitamos revisar esta documentación** para ver el ejemplo de integración.

---

## 🎯 Próximos Pasos

1. **Enviar email a Sipay** solicitando clarificación
2. **Revisar documentación** en el enlace proporcionado
3. **Implementar** según su respuesta

---

**Creado:** Enero 24, 2026  
**Estado:** ⏳ Esperando respuesta de Sipay

