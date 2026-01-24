# 💳 Sipay - Integración MindMetric

**Estado:** ✅ Código implementado - Pendiente credenciales

---

## 🎯 Resumen Ejecutivo

### ¿Qué es Sipay?
Pasarela de pagos europea que permite:
- ✅ Pagos con tarjeta (Visa, Mastercard)
- ✅ Tokenización para pagos recurrentes
- ✅ Apple Pay y Google Pay
- ✅ 3D Secure automático
- ✅ Devoluciones

### ¿Qué está implementado?
- ✅ Cliente de Sipay (`lib/sipay-client.ts`)
- ✅ 8 endpoints API backend
- ✅ Componente frontend con SDK
- ✅ Documentación completa
- ✅ Scripts de prueba

### ¿Qué falta?
- ⏳ Obtener credenciales de Sipay
- ⏳ Configurar variables de entorno
- ⏳ Probar en sandbox

---

## 📁 Archivos de Documentación

| Archivo | Descripción | Cuándo usarlo |
|---------|-------------|---------------|
| **`SIPAY-PROXIMOS-PASOS.md`** | Checklist paso a paso | ⭐ **EMPIEZA AQUÍ** |
| **`SIPAY-GUIA-COMPLETA-OFICIAL.md`** | Guía técnica completa | Para detalles de implementación |
| **`CONFIGURAR-SIPAY.md`** | Configuración general | Referencia rápida |
| **`sipay-example-integration.html`** | Ejemplo HTML funcional | Para ver código en acción |
| **`test-sipay-integration.js`** | Script de prueba | Para probar endpoints |
| **`SIPAY-VARIABLES-ENTORNO.md`** | Variables de entorno | Al configurar Vercel |

---

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Solicitar Credenciales

Envía email a: **soporte@sipay.es**

```
Asunto: Solicitud de credenciales Sandbox - MindMetric

Hola,

Solicito credenciales de Sandbox para integrar Sipay en mi aplicación:

- Empresa: MindMetric
- Web: https://mindmetric.io
- Negocio: Tests psicológicos online
- Contacto: [tu email]
- Teléfono: [tu teléfono]

Necesito:
1. Credenciales Sandbox (API Key, Secret, Resource)
2. Acceso a Backoffice (SUWE)
3. Configuración de tokenización (MSTK)

Gracias,
[Tu nombre]
```

### Paso 2: Configurar Variables

Cuando recibas las credenciales, crea `.env.local`:

```bash
SIPAY_API_KEY=xxxx-xxxx-xxxx-xxxx
SIPAY_API_SECRET=xxxxxxxxxxxxxxxx
SIPAY_RESOURCE=xxxxxxxxxxxxxxxx
SIPAY_ENDPOINT=https://sandbox.sipay.es

NEXT_PUBLIC_SIPAY_KEY=xxxx-xxxx-xxxx-xxxx
NEXT_PUBLIC_SIPAY_RESOURCE=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_SIPAY_ENDPOINT=https://sandbox.sipay.es
```

### Paso 3: Probar

```bash
npm run dev
# Navega a: http://localhost:3000/es/checkout
# Usa tarjeta de prueba: 4548819407777774 / 12/25 / 123
```

---

## 📖 Documentación Oficial Sipay

### Frontend (Formulario de Pago):
🔗 https://developer.sipay.es/docs/documentation/online/selling/only_card

### Backend (APIs):

| Función | Documentación |
|---------|---------------|
| **Pago + Tokenización** | https://developer.sipay.es/docs/api/mdwr/allinone#2-autorizaci%C3%B3n-con-autenticaci%C3%B3n-con-almacenamiento-de-tarjeta-tokenizaci%C3%B3n |
| **Pagos Recurrentes (MIT)** | https://developer.sipay.es/docs/api/mdwr/allinone#4-autorizaci%C3%B3n-con-exenci%C3%B3n-mit-r |
| **Devoluciones** | https://developer.sipay.es/docs/api/mdwr/refund |
| **Consultar Token** | https://developer.sipay.es/docs/api/mdwr/card |
| **Borrar Token** | https://developer.sipay.es/docs/api/mdwr/unregister |
| **Apple Pay** | https://developer.sipay.es/docs/documentation/online/selling/wallets/apay |
| **Google Pay** | https://developer.sipay.es/docs/documentation/online/selling/wallets/gpay |

---

## 🧪 Tarjetas de Prueba (Sandbox)

```
VISA:       4548819407777774
Caducidad:  12/25
CVV:        123
Resultado:  ✅ Pago exitoso
```

---

## 🔌 Endpoints Implementados

| Endpoint | Función |
|----------|---------|
| `POST /api/sipay/create-payment` | Crear sesión de pago |
| `POST /api/sipay/process-payment` | Procesar pago + tokenizar |
| `POST /api/sipay/recurring-payment` | Cobro recurrente (MIT) |
| `POST /api/sipay/refund` | Devolución |
| `POST /api/sipay/card-info` | Consultar token |
| `POST /api/sipay/delete-card` | Borrar token |
| `POST /api/sipay/apple-pay` | Pago Apple Pay |
| `POST /api/sipay/google-pay` | Pago Google Pay |

---

## ✅ Checklist Mínimo

```
[ ] Solicitar credenciales Sandbox a Sipay
[ ] Configurar .env.local
[ ] npm run dev
[ ] Probar checkout con tarjeta de prueba
[ ] Verificar pago en Backoffice Sipay
[ ] Solicitar credenciales de Producción
[ ] Configurar en Vercel (production)
[ ] Deploy
[ ] Probar en producción
```

---

## 🆘 Problemas Comunes

### "Sipay configuration is missing"
➜ Falta configurar variables de entorno

### "SDK de Sipay no cargado"
➜ Verifica que el script de Sipay se cargue correctamente

### "Card token not found"
➜ El usuario no tiene token guardado (debe hacer pago inicial primero)

### "Invalid signature"
➜ El `SIPAY_API_SECRET` es incorrecto

---

## 📞 Soporte

- **Sipay:** soporte@sipay.es
- **Docs Sipay:** https://developer.sipay.es/docs/
- **Backoffice Sandbox:** https://suwe.sipay.es
- **Backoffice Producción:** https://backoffice.sipay.es

---

## 🎓 Próximos Pasos

1. **Lee:** `SIPAY-PROXIMOS-PASOS.md` (empieza aquí)
2. **Implementa:** Sigue el checklist paso a paso
3. **Prueba:** Usa `test-sipay-integration.js`
4. **Deploy:** Sigue la guía de producción

---

**Última actualización:** Enero 2026  
**Autor:** MindMetric Tech Team  
**Tiempo estimado:** 2-3 horas (depende de Sipay)

