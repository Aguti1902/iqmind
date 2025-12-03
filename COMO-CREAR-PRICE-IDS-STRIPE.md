# 💳 Cómo Crear los Price IDs en Stripe

## 📋 Resumen

MindMetric tiene **DOS planes de suscripción**, por lo tanto necesitas crear **DOS productos** en Stripe Dashboard y obtener **DOS Price IDs**.

---

## 🎯 Los Dos Planes

| Plan | Precio | Frecuencia | Variable en el Panel |
|------|--------|------------|---------------------|
| **Quincenal** | €9.99 | Cada 2 semanas | `stripe_test_price_id_quincenal` |
| **Mensual** | €19.99 | Mensual | `stripe_test_price_id_mensual` |

---

## 🚀 Paso a Paso

### **ANTES DE EMPEZAR**

1. Ve a: https://dashboard.stripe.com
2. Inicia sesión
3. Asegúrate de estar en **modo TEST** (toggle arriba a la derecha)

---

### **📦 PASO 1: Crear el Producto Base**

1. Ve a: **Products** → **Add product**
   
2. Completa:
   - **Name**: `MindMetric Premium`
   - **Description**: `Acceso completo a todos los tests psicológicos de MindMetric`
   - **Image**: (opcional) Sube tu logo

3. **NO hagas click en "Add product" todavía**

---

### **💰 PASO 2: Crear el Precio Quincenal**

1. En la sección **Pricing**:
   - **Price**: `9.99`
   - **Currency**: `EUR`
   - **Billing period**: Selecciona **"Custom"**
     - **Every**: `2`
     - **Period**: `weeks` (semanas)
   - **Price description** (opcional): `Plan Quincenal`

2. Click en **"Add product"**

3. **COPIA EL PRICE ID** que aparece:
   ```
   Ejemplo: price_1AbCdEfGhIjKlMnO
   ```

4. **Guárdalo** como: `Price ID Quincenal TEST`

---

### **💰 PASO 3: Añadir el Precio Mensual**

1. En la página del producto que acabas de crear
2. Scroll hasta la sección **Pricing**
3. Click en **"Add another price"**

4. Completa:
   - **Price**: `19.99`
   - **Currency**: `EUR`
   - **Billing period**: `Monthly`
   - **Price description** (opcional): `Plan Mensual`

5. Click en **"Add price"**

6. **COPIA EL PRICE ID** que aparece:
   ```
   Ejemplo: price_1QrStUvWxYzAbCdE
   ```

7. **Guárdalo** como: `Price ID Mensual TEST`

---

## 📝 Resumen de lo que tienes ahora

Deberías tener:

```
✅ 1 Producto: "MindMetric Premium"
✅ 2 Precios:
   - €9.99 cada 2 semanas → price_xxxxxxxxxxxxx (Quincenal)
   - €19.99 al mes → price_yyyyyyyyyyy (Mensual)
```

---

## 🎯 PASO 4: Añadir los Price IDs al Panel de Admin

### **Opción A: Ejecutar Migración (Recomendado)**

1. Visita en tu navegador:
   ```
   https://mindmetric.io/api/admin/add-price-ids
   ```

2. Verás:
   ```json
   {
     "success": true,
     "message": "Price IDs añadidos correctamente"
   }
   ```

### **Opción B: Añadirlos Manualmente**

Si la migración ya se ejecutó, simplemente:

1. Ve a: `https://mindmetric.io/es/admin`
2. Pestaña: **"Credenciales de Pago"**
3. Scroll hasta **"Claves de Test"**
4. Pega los Price IDs:
   - **Price ID Quincenal (Test)**: `price_xxxxxxxxxxxxx`
   - **Price ID Mensual (Test)**: `price_yyyyyyyyyyy`
5. Click en **"Guardar Configuración"**

---

## 🔄 Repetir para Modo PRODUCCIÓN

Cuando estés listo para lanzar:

### **1. Cambiar a Modo Live**

1. En Stripe Dashboard, cambia el toggle a **"Live mode"**
2. Ve a **Products**
3. Verás que **NO hay productos** (test y live son separados)

### **2. Crear el Producto de Nuevo**

Repite los pasos 1, 2 y 3 pero en modo Live:

1. **Products** → **Add product**
2. **Name**: `MindMetric Premium`
3. **Pricing**:
   - Precio 1: €9.99 cada 2 semanas
   - Precio 2: €19.99 al mes (añadir después)

### **3. Copiar los Price IDs LIVE**

Los Price IDs en modo Live serán diferentes:

```
Ejemplo LIVE:
- price_1FgHiJkLmNoPqRsT (Quincenal)
- price_1TuVwXyZaBcDeFgH (Mensual)
```

### **4. Añadir al Panel de Admin**

1. Ve a: `https://mindmetric.io/es/admin`
2. Pestaña: **"Credenciales de Pago"**
3. Scroll hasta **"Claves de Producción"**
4. Pega los Price IDs LIVE:
   - **Price ID Quincenal (Live)**: `price_...`
   - **Price ID Mensual (Live)**: `price_...`
5. Click en **"Guardar Configuración"**

---

## 📊 Vista del Panel de Admin

Ahora en el panel de admin verás:

```
┌─────────────────────────────────────────────────────┐
│  🔑 Credenciales de Stripe                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🧪 Claves de Test (Desarrollo)                    │
│                                                     │
│  ┌─ Publishable Key ──────────────────┐            │
│  │ pk_test_xxxxx                       │            │
│  └────────────────────────────────────┘            │
│                                                     │
│  ┌─ Secret Key ──────────────────────┐             │
│  │ ••••••••••••••                     │             │
│  └────────────────────────────────────┘            │
│                                                     │
│  ┌─ Webhook Secret ───────────────────┐            │
│  │ ••••••••••••••                     │             │
│  └────────────────────────────────────┘            │
│                                                     │
│  ┌─ Price ID Quincenal ──────────────┐             │
│  │ price_xxxxx (€9.99/2 semanas)     │  ← NUEVO   │
│  └────────────────────────────────────┘            │
│                                                     │
│  ┌─ Price ID Mensual ────────────────┐             │
│  │ price_yyyyy (€19.99/mes)          │  ← NUEVO   │
│  └────────────────────────────────────┘            │
│                                                     │
│  🚀 Claves de Producción (Live)                    │
│  (Mismos campos pero con valores LIVE)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Final

Antes de considerar completada la configuración:

### Para Modo TEST:
- [ ] Producto creado en Stripe (modo Test)
- [ ] Precio quincenal añadido (€9.99 cada 2 semanas)
- [ ] Precio mensual añadido (€19.99 al mes)
- [ ] Price ID Quincenal copiado y pegado en el panel
- [ ] Price ID Mensual copiado y pegado en el panel
- [ ] Configuración guardada en el panel

### Para Modo LIVE (cuando estés listo):
- [ ] Cuenta de Stripe completamente activada
- [ ] Información bancaria proporcionada
- [ ] Producto creado en Stripe (modo Live)
- [ ] Precio quincenal añadido (modo Live)
- [ ] Precio mensual añadido (modo Live)
- [ ] Price IDs Live copiados al panel
- [ ] Configuración guardada en el panel

---

## 🎓 Consejos

### ✅ Buenas Prácticas

1. **Usa nombres descriptivos**: Al crear los precios, usa descripciones claras como "Plan Quincenal" y "Plan Mensual"

2. **Guarda los IDs inmediatamente**: Copia los Price IDs en cuanto los veas. Puedes encontrarlos después, pero es más fácil copiarlos al crearlos.

3. **Prueba en Test primero**: Siempre configura y prueba todo en modo Test antes de pasar a Live.

4. **Documenta tus IDs**: Guarda los Price IDs en un documento seguro para referencia futura.

### ⚠️ Errores Comunes

1. **Olvidar crear el segundo precio**: Recuerda hacer click en "Add another price" para el plan mensual.

2. **Confundir Test con Live**: Los Price IDs de test y live son completamente diferentes. No mezcles.

3. **No guardar en el panel**: Después de pegar los IDs, debes hacer click en "Guardar Configuración".

---

## 🔍 Cómo Verificar que Está Correcto

### En Stripe Dashboard:

1. Ve a **Products**
2. Deberías ver: `MindMetric Premium`
3. Click en el producto
4. Deberías ver **2 precios**:
   - €9.99 / 2 weeks
   - €19.99 / month

### En el Panel de Admin:

1. Ve a `/es/admin`
2. Pestaña: **Credenciales de Pago**
3. Verifica que ambos campos de Price ID estén llenos
4. El formato debe ser: `price_xxxxxxxxxxxxx`

### Probando un Pago:

1. Ve a tu sitio web
2. Click en "Comenzar" en cualquiera de los dos planes
3. El checkout de Stripe debe abrirse
4. Debería mostrar el precio correcto (€9.99 o €19.99)

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Verifica Stripe Dashboard**: ¿Ves los dos precios en el producto?
2. **Revisa el panel de admin**: ¿Están ambos Price IDs guardados?
3. **Prueba un pago test**: Usa la tarjeta `4242 4242 4242 4242`
4. **Revisa los logs**: En Vercel o tu consola local

---

**¡Listo! Ahora tienes ambos planes de suscripción configurados correctamente.** 🎉

