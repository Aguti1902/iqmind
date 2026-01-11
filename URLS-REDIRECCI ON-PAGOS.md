# 🔀 URLs de Redirección de Pagos - Mindmetric

Documento de referencia rápida con todas las URLs de redirección para las diferentes pasarelas de pago.

---

## 🌍 URLs Base

**Sitio web:** https://mindmetric.io/

**Idiomas soportados:**
- Español (`es`) - Por defecto
- Inglés (`en`)
- Francés (`fr`)
- Alemán (`de`)
- Italiano (`it`)
- Portugués (`pt`)
- Sueco (`sv`)
- Noruego (`no`)
- Ucraniano (`uk`)

---

## 💳 Prime Payments

### ✅ URL de Éxito (Multiidioma)
```
https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}
```

**Otras variantes por idioma:**
- `https://mindmetric.io/en/success?session_id={CHECKOUT_SESSION_ID}`
- `https://mindmetric.io/fr/success?session_id={CHECKOUT_SESSION_ID}`
- `https://mindmetric.io/de/success?session_id={CHECKOUT_SESSION_ID}`
- etc.

### ❌ URL de Cancelación
```
https://mindmetric.io/es?canceled=true
```

### 🪝 Webhook URL
```
https://mindmetric.io/api/prime-payments-webhook
```

### 📋 URL del Script del Controlador
```
https://mindmetric.io/
```

---

## 💎 Stripe (Sistema Actual)

### ✅ URL de Éxito (Suscripciones)
```
https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}
```

### ✅ URL de Éxito (Pago Inicial del Test)
```
https://mindmetric.io/resultado?session_id={CHECKOUT_SESSION_ID}
```

### ❌ URL de Cancelación (Suscripciones)
```
https://mindmetric.io/es?canceled=true
```

### ❌ URL de Cancelación (Pago Inicial del Test)
```
https://mindmetric.io/checkout
```

### 🪝 Webhook URL
```
https://mindmetric.io/api/webhooks/stripe
```

---

## 🏪 Whop (Sistema Alternativo)

### ✅ URL de Éxito
```
https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}
```

### ❌ URL de Cancelación
```
https://mindmetric.io/es?canceled=true
```

### 🪝 Webhook URL
```
https://mindmetric.io/api/webhooks/whop
```

---

## 📊 Resumen de Endpoints API

| Pasarela | Endpoint Webhook | Estado |
|----------|------------------|--------|
| **Stripe** | `/api/webhooks/stripe` | ✅ Activo |
| **Prime Payments** | `/api/prime-payments-webhook` | 🔄 En configuración |
| **Whop** | `/api/webhooks/whop` | ⚠️ Alternativo |

---

## 🎯 Páginas de Destino

### Página de Éxito (`/[lang]/success`)
**Ubicación:** `app/[lang]/success/page.tsx`

**Parámetros:**
- `session_id` - ID de la sesión de pago

**Funcionalidad:**
- Muestra confirmación de pago
- Activa el acceso del usuario
- Envía email de bienvenida

### Página de Resultado (`/resultado`)
**Ubicación:** `app/resultado/page.tsx`

**Parámetros:**
- `session_id` - ID de la sesión de pago

**Funcionalidad:**
- Muestra el resultado del test de IQ
- Activa trial de 2 días
- Inicia suscripción

### Página de Checkout (`/checkout`)
**Ubicación:** `app/checkout/page.tsx`

**Funcionalidad:**
- Formulario de pago inicial
- Integración con Stripe

### Página Principal (`/[lang]`)
**Ubicación:** `app/[lang]/page.tsx`

**Parámetros opcionales:**
- `canceled=true` - Indica que el pago fue cancelado

---

## 🔧 Configuración por Pasarela

### Para Prime Payments:

Configura en el dashboard de Prime Payments:

1. **URL de redirección después del pago exitoso:**
   ```
   https://mindmetric.io/es/success?session_id={CHECKOUT_SESSION_ID}
   ```

2. **URL de redirección después de la cancelación del pago:**
   ```
   https://mindmetric.io/es?canceled=true
   ```

3. **URL del script del controlador:**
   ```
   https://mindmetric.io/api/prime-payments-webhook
   ```

### Para Stripe:

Ya configurado. Ver archivo: [CONFIGURACION-STRIPE.md](./CONFIGURACION-STRIPE.md)

### Para Whop:

Ver archivo: [CONFIGURAR-WHOP.md](./CONFIGURAR-WHOP.md)

---

## 📝 Notas Importantes

1. **Placeholder `{CHECKOUT_SESSION_ID}`:**
   - Algunas pasarelas reemplazan automáticamente este placeholder
   - Otras requieren configuración específica
   - Verifica la documentación de cada pasarela

2. **Idioma por defecto:**
   - Si no se especifica idioma, se usa `es` (español)
   - El middleware maneja las redirecciones

3. **Parámetro `canceled=true`:**
   - Opcional pero recomendado
   - Permite mostrar un mensaje específico al usuario

4. **Webhooks:**
   - Todos los webhooks requieren verificación de firma
   - Los secretos están en variables de entorno
   - Ver logs en Vercel para debugging

---

## ✅ Checklist de Verificación

Antes de activar una pasarela de pago, verifica:

- [ ] URLs de redirección configuradas en el dashboard de la pasarela
- [ ] Webhook URL configurado y funcionando
- [ ] Páginas de destino existen y funcionan correctamente
- [ ] Variables de entorno configuradas en Vercel
- [ ] Prueba de pago exitoso completada
- [ ] Prueba de pago cancelado completada
- [ ] Webhook recibe notificaciones correctamente
- [ ] Emails de confirmación se envían correctamente

---

## 🆘 Troubleshooting

### Problema: 404 en URL de redirección

**Posibles causas:**
1. La página no existe
2. El middleware está bloqueando la ruta
3. Error de tipeo en la URL

**Solución:**
1. Verifica que la página exista en `app/[lang]/success/page.tsx`
2. Revisa el `middleware.ts` para asegurar que no bloquee la ruta
3. Comprueba la URL en el dashboard de la pasarela

### Problema: Parámetro `session_id` no se recibe

**Posibles causas:**
1. La pasarela no soporta el placeholder `{CHECKOUT_SESSION_ID}`
2. Configuración incorrecta

**Solución:**
1. Consulta la documentación de la pasarela
2. Algunos sistemas usan `{SESSION_ID}` en lugar de `{CHECKOUT_SESSION_ID}`
3. Prueba con una URL sin el parámetro y obtén el ID del webhook

---

**Última actualización:** Enero 2026
**Mantenido por:** Equipo de Desarrollo Mindmetric

