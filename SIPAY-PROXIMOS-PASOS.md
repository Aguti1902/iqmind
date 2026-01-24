# 🚀 Próximos Pasos - Integración Sipay

Esta guía te indica exactamente qué hacer para completar la integración de Sipay.

---

## ✅ Estado Actual

### Ya Implementado:
- ✅ Cliente de Sipay (`lib/sipay-client.ts`)
- ✅ Endpoints API backend completos
- ✅ Componente frontend con SDK de Sipay
- ✅ Documentación completa
- ✅ Ejemplo HTML de referencia

### Pendiente:
- ⏳ Obtener credenciales de Sipay
- ⏳ Configurar variables de entorno
- ⏳ Probar en sandbox
- ⏳ Deploy a producción

---

## 📋 Checklist de Implementación

### Paso 1: Solicitar Credenciales Sandbox a Sipay

**¿Qué solicitar?**

Contacta a Sipay (soporte@sipay.es) y solicita:

1. **Alta de Cliente y Establecimiento**
   - Nombre de la empresa: **MindMetric**
   - URL del sitio web: **https://mindmetric.io**
   - Tipo de negocio: **Tests psicológicos online**
   - Email de contacto: [tu email]
   - Teléfono: [tu teléfono]
   - DNI/NIF: [tu identificación]

2. **Recurso MSTK (Identidad y Resource)**
   - Tokenización de tarjetas (mdwr + fpay + payment wall)
   - Google Pay
   - Apple Pay

3. **Backoffice Sipay (SUWE)**
   - Nombre y apellidos: [tu nombre]
   - Email: [email con acceso para 2FA]
   - Teléfono: [tu teléfono]
   - DNI: [tu DNI]

**¿Qué recibirás?**
```
API Key Sandbox: xxxx-xxxx-xxxx-xxxx
API Secret Sandbox: xxxxxxxxxxxxxxxx
Resource ID: xxxxxxxxxxxxxxxx
Endpoint Sandbox: https://sandbox.sipay.es
```

---

### Paso 2: Configurar Variables de Entorno Local

Crea o edita el archivo `.env.local`:

```bash
# Sipay Sandbox (Backend)
SIPAY_API_KEY=xxxx-xxxx-xxxx-xxxx
SIPAY_API_SECRET=xxxxxxxxxxxxxxxx
SIPAY_RESOURCE=xxxxxxxxxxxxxxxx
SIPAY_ENDPOINT=https://sandbox.sipay.es

# Sipay Sandbox (Frontend)
NEXT_PUBLIC_SIPAY_KEY=xxxx-xxxx-xxxx-xxxx
NEXT_PUBLIC_SIPAY_RESOURCE=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_SIPAY_ENDPOINT=https://sandbox.sipay.es
```

**⚠️ IMPORTANTE:** Asegúrate de que `.env.local` esté en `.gitignore`

---

### Paso 3: Probar Localmente

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Navegar al checkout:**
   ```
   http://localhost:3000/es/checkout
   ```

3. **Probar con tarjeta de prueba:**
   - **Número:** `4548819407777774`
   - **Caducidad:** `12/25`
   - **CVV:** `123`
   - **Nombre:** Cualquiera

4. **Verificar en logs:**
   ```bash
   # En la consola del servidor deberías ver:
   💳 Cargando formulario de pago Sipay...
   ✅ Sesión de pago creada
   💳 Procesando pago con token...
   ✅ Pago procesado exitosamente
   ```

5. **Verificar en Backoffice Sipay:**
   - Ve a: https://suwe.sipay.es
   - Login con tus credenciales
   - Transacciones → Deberías ver el pago de 0,50€

---

### Paso 4: Configurar en Vercel (Desarrollo/Preview)

```bash
# Configurar para development
vercel env add SIPAY_API_KEY development
vercel env add SIPAY_API_SECRET development
vercel env add SIPAY_RESOURCE development
vercel env add SIPAY_ENDPOINT development

vercel env add NEXT_PUBLIC_SIPAY_KEY development
vercel env add NEXT_PUBLIC_SIPAY_RESOURCE development
vercel env add NEXT_PUBLIC_SIPAY_ENDPOINT development

# Configurar para preview
vercel env add SIPAY_API_KEY preview
vercel env add SIPAY_API_SECRET preview
vercel env add SIPAY_RESOURCE preview
vercel env add SIPAY_ENDPOINT preview

vercel env add NEXT_PUBLIC_SIPAY_KEY preview
vercel env add NEXT_PUBLIC_SIPAY_RESOURCE preview
vercel env add NEXT_PUBLIC_SIPAY_ENDPOINT preview
```

---

### Paso 5: Testing Completo en Sandbox

#### Test 1: Pago Exitoso
```bash
# Tarjeta de prueba
Número: 4548819407777774
Caducidad: 12/25
CVV: 123
```

**Resultado esperado:**
- ✅ Pago procesado
- ✅ Token guardado en BD
- ✅ Usuario redirigido a resultado
- ✅ Transacción visible en Backoffice Sipay

#### Test 2: Pago Denegado
```bash
# Tarjeta de prueba
Número: 4548819407777774
Caducidad: 12/25
CVV: 999  # Forzar denegación
```

**Resultado esperado:**
- ❌ Pago denegado
- ❌ Usuario ve mensaje de error
- ❌ No se guarda token

#### Test 3: Pago Recurrente
```bash
curl -X POST http://localhost:3000/api/sipay/recurring-payment \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mindmetric.io",
    "amount": 9.99,
    "description": "Suscripción mensual MindMetric"
  }'
```

**Resultado esperado:**
- ✅ Pago recurrente procesado
- ✅ Usuario con subscriptionStatus = 'active'
- ✅ Transacción visible en Backoffice

#### Test 4: Reembolso
```bash
curl -X POST http://localhost:3000/api/sipay/refund \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_xxxxxxxx",
    "amount": 0.50,
    "reason": "Test de reembolso",
    "email": "test@mindmetric.io"
  }'
```

**Resultado esperado:**
- ✅ Reembolso procesado
- ✅ Visible en Backoffice como "Refund"

---

### Paso 6: Solicitar Credenciales de Producción

Una vez que todo funcione en sandbox:

1. **Contactar a Sipay** para solicitar credenciales de producción
2. **Proporcionar:**
   - Documentos legales de la empresa
   - Información fiscal
   - Comprobante de dominio (mindmetric.io)

3. **Recibirás:**
   ```
   API Key Live: xxxx-xxxx-xxxx-xxxx
   API Secret Live: xxxxxxxxxxxxxxxx
   Resource ID Live: xxxxxxxxxxxxxxxx
   Endpoint Live: https://api.sipay.es
   ```

---

### Paso 7: Configurar en Vercel (Producción)

```bash
vercel env add SIPAY_API_KEY production
# Valor: [tu API Key de producción]

vercel env add SIPAY_API_SECRET production
# Valor: [tu API Secret de producción]

vercel env add SIPAY_RESOURCE production
# Valor: [tu Resource ID de producción]

vercel env add SIPAY_ENDPOINT production
# Valor: https://api.sipay.es

vercel env add NEXT_PUBLIC_SIPAY_KEY production
# Valor: [tu API Key de producción]

vercel env add NEXT_PUBLIC_SIPAY_RESOURCE production
# Valor: [tu Resource ID de producción]

vercel env add NEXT_PUBLIC_SIPAY_ENDPOINT production
# Valor: https://api.sipay.es
```

---

### Paso 8: Deploy a Producción

```bash
git add .
git commit -m "Add Sipay production credentials"
git push
```

Vercel desplegará automáticamente.

---

### Paso 9: Verificar en Producción

1. **Hacer un pago real de prueba** (0,50€)
2. **Verificar en Backoffice de producción:** https://backoffice.sipay.es
3. **Monitorear logs en Vercel:**
   ```bash
   vercel logs --follow
   ```

---

## 🔍 Verificación Final

### Checklist de Producción:
- [ ] Pago inicial funciona (0,50€)
- [ ] Token se guarda correctamente
- [ ] Trial de 2 días se activa
- [ ] Usuario accede a resultado
- [ ] Email de confirmación se envía
- [ ] Pago recurrente funciona después de trial
- [ ] Reembolsos funcionan
- [ ] Transacciones visibles en Backoffice

---

## 📞 Soporte

Si tienes problemas en algún paso:

### Sipay:
- **Email:** soporte@sipay.es
- **Docs:** https://developer.sipay.es/docs/

### MindMetric (Documentación):
- `SIPAY-GUIA-COMPLETA-OFICIAL.md` - Guía completa
- `CONFIGURAR-SIPAY.md` - Configuración inicial
- `sipay-example-integration.html` - Ejemplo HTML

---

## 🎯 Resumen Rápido

```bash
# 1. Solicitar credenciales Sandbox a Sipay
# 2. Configurar .env.local
# 3. npm run dev y probar localmente
# 4. Configurar en Vercel (development/preview)
# 5. Testing completo en sandbox
# 6. Solicitar credenciales de Producción
# 7. Configurar en Vercel (production)
# 8. Deploy
# 9. Verificar en producción
```

---

**Última actualización:** Enero 2026  
**Tiempo estimado:** 2-3 horas (depende de respuesta de Sipay)

