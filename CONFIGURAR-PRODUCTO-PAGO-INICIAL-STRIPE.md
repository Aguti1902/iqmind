# 💳 Cómo Configurar el Producto de Pago Inicial en Stripe

## 🎯 ¿Por qué es importante?

Aunque el código puede cobrar directamente con `PaymentIntent`, es **MUCHO MEJOR** crear un producto en Stripe porque:

✅ **Más transparente** - El cliente ve claramente qué está comprando
✅ **Menos riesgo de disputas** - Aparece con nombre claro en el extracto bancario
✅ **Cumple mejor con políticas de Stripe** - Stripe prefiere productos bien definidos
✅ **Mejor para reportes** - Puedes ver estadísticas del producto
✅ **Más profesional** - No parece un cargo "ad-hoc"

---

## 📦 Producto a Crear

**Nombre:** Resultado Test de Inteligencia  
**Precio:** €0.50 (pago único)  
**Tipo:** One-time payment (NO recurrente)  
**Descripción:** Acceso completo al resultado personalizado del test de CI

---

## 🚀 Paso a Paso

### **MODO TEST** (Para probar)

#### 1. Acceder a Stripe Dashboard
1. Ve a: https://dashboard.stripe.com
2. Inicia sesión
3. Asegúrate de estar en **modo TEST** (toggle arriba a la derecha)

#### 2. Crear el Producto
1. Ve a: **Products** → **Add product**
2. Completa el formulario:

**Información del producto:**
```
Name: Resultado Test de Inteligencia
Description: Acceso completo a tu resultado personalizado del test de CI con análisis detallado por categorías y recomendaciones personalizadas.
```

**Pricing:**
```
Price: 0.50
Currency: EUR
Billing period: One time (NO recurrente)
```

**Advanced options** (opcional pero recomendado):
```
Statement descriptor: Test IQ
(Esto aparecerá en el extracto bancario del cliente)
```

3. Click en **"Add product"**

#### 3. Copiar el Price ID
1. Después de crear el producto, verás un **Price ID** como:
   ```
   price_1AbCdEfGhIjKlMnO
   ```
2. **Cópialo** - lo necesitarás después

---

### **MODO PRODUCTION** (Para cobros reales)

Repite los mismos pasos pero en modo LIVE:

1. Ve a Stripe Dashboard
2. Cambia a **modo LIVE** (toggle arriba a la derecha)
3. **Products** → **Add product**
4. Usa los **mismos datos** que en TEST
5. Copia el **Price ID de LIVE** (será diferente al de TEST)

---

## 🔧 Configurar el Price ID en tu Aplicación

### Opción A: Panel de Admin (Recomendado)

1. Ve al panel de admin de tu aplicación
2. **Configuración** → **Stripe**
3. Añade:
   - **Test Price ID (Pago Inicial):** `price_xxxxx` (el de TEST)
   - **Live Price ID (Pago Inicial):** `price_xxxxx` (el de LIVE)

### Opción B: Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Añade:
   ```
   STRIPE_INITIAL_PAYMENT_PRICE_ID_TEST=price_xxxxx
   STRIPE_INITIAL_PAYMENT_PRICE_ID_LIVE=price_xxxxx
   ```

### Opción C: Base de Datos (Railway)

Conecta a tu base de datos y ejecuta:

```sql
-- Para TEST
INSERT INTO site_config (key, value, description) 
VALUES ('stripe_test_price_id_initial', 'price_xxxxx', 'Price ID del pago inicial TEST (€0.50)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Para LIVE
INSERT INTO site_config (key, value, description) 
VALUES ('stripe_live_price_id_initial', 'price_xxxxx', 'Price ID del pago inicial LIVE (€0.50)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

## ✅ Verificar que Funciona

### 1. Verificar el Producto en Stripe
1. Ve a: **Products** en Stripe Dashboard
2. Deberías ver tu producto: "Resultado Test de Inteligencia"
3. Precio: €0.50
4. Estado: Active

### 2. Hacer un Pago de Prueba
1. Ve a tu aplicación en modo TEST
2. Completa el test de CI
3. En la página de checkout, verifica que el precio sea **€0.50**
4. Usa una tarjeta de prueba de Stripe:
   ```
   Número: 4242 4242 4242 4242
   Fecha: Cualquier fecha futura (ej: 12/25)
   CVC: Cualquier 3 dígitos (ej: 123)
   ```
5. Completa el pago

### 3. Verificar en Stripe Dashboard
1. Ve a: **Payments** en Stripe Dashboard
2. Deberías ver el pago de €0.50
3. Click en el pago → verifica que tenga:
   - **Description:** "Desbloqueo Resultado Test IQ - [nombre del cliente]"
   - **Customer:** El email del cliente
   - **Status:** Succeeded

### 4. Verificar que se Creó la Suscripción
1. Ve a: **Subscriptions** en Stripe Dashboard
2. Deberías ver una nueva suscripción en estado **"Trialing"**
3. Trial end date: 30 días desde ahora
4. Customer: El mismo del pago anterior

---

## ⚠️ Problemas Comunes

### Problema: "No se encuentra el Price ID"
**Causa:** El Price ID no está configurado o es incorrecto
**Solución:**
1. Verifica que el Price ID esté correcto (empieza con `price_`)
2. Verifica que esté en el modo correcto (TEST o LIVE)
3. Verifica que esté configurado en la aplicación

### Problema: "El pago se cobra pero no se crea la suscripción"
**Causa:** El webhook `payment_intent.succeeded` no está funcionando
**Solución:**
1. Verifica que el webhook esté configurado en Stripe
2. Verifica los logs del webhook en Vercel
3. Verifica que el `priceId` de la suscripción mensual esté configurado

### Problema: "Stripe detecta el pago como no autorizado"
**Causa:** Descripción poco clara o múltiples cargos sin consentimiento
**Solución:**
1. Usa el producto que creaste en Stripe (más transparente)
2. Asegúrate de que la descripción sea clara
3. Nunca hagas múltiples cargos sin consentimiento explícito

---

## 📝 Resumen Rápido

**Producto a crear:**
- **Nombre:** Resultado Test de Inteligencia
- **Precio:** €0.50 (one-time)
- **Statement descriptor:** Test IQ

**Price IDs a guardar:**
- TEST: `price_xxxxx`
- LIVE: `price_xxxxx`

**Configurar en:**
- Panel de admin, o
- Variables de entorno en Vercel, o
- Base de datos en Railway

**Verificar:**
1. ✅ Producto visible en Stripe Dashboard
2. ✅ Pago de prueba funciona
3. ✅ Se crea la suscripción automáticamente
4. ✅ Cliente recibe email con credenciales

---

## 🎯 Ventajas de Este Enfoque

| Aspecto | PaymentIntent directo | Con Producto en Stripe |
|---------|----------------------|------------------------|
| **Transparencia** | ⚠️ Poca | ✅ Alta |
| **Disputas** | ⚠️ Más riesgo | ✅ Menos riesgo |
| **Políticas Stripe** | ⚠️ Cumple básico | ✅ Cumple completamente |
| **Reportes** | ⚠️ Limitados | ✅ Completos |
| **Profesionalidad** | ⚠️ Ad-hoc | ✅ Profesional |
| **Extracto bancario** | ⚠️ Genérico | ✅ Descriptivo |

---

## 🔄 Próximos Pasos

1. [ ] Crear producto en Stripe (TEST)
2. [ ] Copiar Price ID de TEST
3. [ ] Configurar Price ID en la aplicación
4. [ ] Hacer pago de prueba
5. [ ] Verificar que funciona
6. [ ] Crear producto en Stripe (LIVE)
7. [ ] Copiar Price ID de LIVE
8. [ ] Configurar Price ID de LIVE
9. [ ] Cambiar a modo LIVE
10. [ ] Verificar con pago real

---

**Última actualización:** Diciembre 2025

**Nota:** Aunque por ahora el código usa `PaymentIntent` directo (que funciona), crear el producto en Stripe es la mejor práctica y te protege de futuros problemas con Stripe.

