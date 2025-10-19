# 🚀 Pasos Inmediatos para Activar Lemon Squeezy

## 1️⃣ Ejecutar Migración de Base de Datos

Necesitas agregar las nuevas columnas de Lemon Squeezy a tu base de datos:

### Opción A: Desde tu navegador (RECOMENDADO)

1. Abre tu navegador
2. Asegúrate de estar logueado en el panel de admin
3. Abre la consola del navegador (F12 o Cmd+Option+I)
4. Copia y pega este código:

```javascript
fetch('https://tu-dominio.com/api/admin/migrate-lemon', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

5. Reemplaza `tu-dominio.com` con tu dominio real (ej: `iqmind.vercel.app`)
6. Presiona Enter
7. Deberías ver: `{ success: true, message: "Migración completada..." }`

### Opción B: Desde terminal

```bash
# Navega a tu proyecto
cd /Users/guti/Desktop/CURSOR\ WEBS/IQLEVEL

# Ejecuta el script SQL directamente
psql $POSTGRES_URL < lib/db-schema.sql
```

## 2️⃣ Configurar Lemon Squeezy en el Panel de Admin

1. **Ve al panel de admin**: `https://tu-dominio.com/es/admin`

2. **Cambiar proveedor de pago**:
   - En la parte superior verás "Proveedor de Pago"
   - Asegúrate de que esté seleccionado **"🍋 Lemon Squeezy"**
   - Si no lo está, haz click en "Cambiar a Lemon Squeezy"

3. **Seleccionar modo Test**:
   - En "Modo de Operación" asegúrate de estar en **"🧪 Modo Test"**
   - Si está en Production, cambia a Test

4. **Configurar credenciales**:
   - Ve a la pestaña **"Credenciales de Pago"**
   - Verás formularios para Lemon Squeezy
   - Por ahora, deja los campos vacíos (los llenarás después de crear tu cuenta)

5. **Guardar configuración**:
   - Haz click en **"Guardar Configuración"**
   - Espera a que aparezca el mensaje de éxito

## 3️⃣ Crear Cuenta en Lemon Squeezy

1. Ve a [https://lemonsqueezy.com](https://lemonsqueezy.com)
2. Crea una cuenta
3. Verifica tu email
4. Completa el perfil de tu tienda

## 4️⃣ Crear Producto en Lemon Squeezy

1. En el dashboard de Lemon Squeezy, ve a **Products**
2. Click en **"New Product"**
3. Configura:
   - **Name**: "IQmind Premium"
   - **Description**: "Acceso completo a resultados de test de IQ y análisis detallado"
   - **Type**: **Subscription**
   - **Price**: €9.99/mes
   - **Billing interval**: Monthly
   - **Trial period**: 2 días
4. **Guarda el producto**
5. **Anota el Variant ID** (aparece en la URL o en los detalles del producto)

## 5️⃣ Obtener API Keys de Lemon Squeezy

1. Ve a **Settings** > **API** en el dashboard de Lemon Squeezy
2. Asegúrate de estar en **Test mode**
3. Click en **"Create API key"**
4. Dale un nombre: "IQmind Test"
5. **Copia la API key** (comienza con `lmsk_test_...`)
6. **Copia también el Store ID** (número que aparece en tu tienda)

## 6️⃣ Configurar Webhooks en Lemon Squeezy

1. En Lemon Squeezy, ve a **Settings** > **Webhooks**
2. Click en **"Add endpoint"**
3. **URL**: `https://tu-dominio.com/api/lemon-webhook`
4. **Events** (selecciona estos):
   - ✅ `order_created`
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_cancelled`
   - ✅ `subscription_expired`
   - ✅ `subscription_payment_success`
   - ✅ `subscription_payment_failed`
5. **Guarda el webhook**
6. **Copia el Webhook Secret** (comienza con `whsec_...`)

## 7️⃣ Añadir Credenciales al Panel de Admin

1. Vuelve a tu panel de admin: `https://tu-dominio.com/es/admin`
2. Ve a **"Credenciales de Pago"**
3. En la sección **"🧪 Claves de Test (Desarrollo) - Lemon Squeezy"**, rellena:
   - **API Key (Test)**: `lmsk_test_xxxxx...`
   - **Store ID (Test)**: `12345` (tu número de tienda)
   - **Variant ID (Test)**: `67890` (el ID del producto que creaste)
   - **Webhook Secret (Test)**: `whsec_test_xxxxx...`
4. **Guarda la configuración**
5. Espera a que se complete el redeploy (~2 minutos)

## 8️⃣ Probar el Checkout

1. Abre una ventana de incógnito/privada
2. Ve a tu sitio: `https://tu-dominio.com`
3. Completa el test de IQ
4. Introduce tu email
5. Acepta términos
6. Click en "Ver Resultado Completo"
7. **Deberías ser redirigido automáticamente al checkout de Lemon Squeezy**
8. Verás la página de pago de Lemon Squeezy (no la de Stripe)
9. Usa una tarjeta de prueba:
   - **Número**: `4242 4242 4242 4242`
   - **CVV**: `123`
   - **Fecha**: Cualquier fecha futura
10. Completa el pago

## 9️⃣ Verificar que Funciona

1. En el dashboard de Lemon Squeezy, ve a **Orders**
2. Deberías ver tu orden de prueba
3. Ve a **Subscriptions**
4. Deberías ver la suscripción con trial activo
5. En tu base de datos, verifica que el usuario se creó:
   ```sql
   SELECT id, email, subscription_status, subscription_id, trial_end_date
   FROM users
   WHERE email = 'tu-email-de-prueba@ejemplo.com';
   ```

## 🎉 ¡Listo!

Si todo funcionó:
- ✅ El checkout redirige a Lemon Squeezy
- ✅ El pago se procesa
- ✅ La suscripción se crea
- ✅ El usuario se guarda en tu BD
- ✅ Puedes ver los resultados

## 🐛 Si algo falla:

### Error: "Error creando checkout"
- Verifica que las credenciales de Lemon Squeezy estén correctas
- Verifica que el Variant ID sea correcto
- Verifica que estés en modo Test

### Error: "Stripe not configured"
- Ve al panel de admin
- Asegúrate de que "Lemon Squeezy" esté seleccionado como proveedor
- Guarda la configuración de nuevo

### No redirige a Lemon Squeezy
- Limpia caché del navegador (Cmd+Shift+R o Ctrl+Shift+R)
- Espera 2-3 minutos después de guardar configuración
- Verifica en la consola del navegador si hay errores

### Webhook no funciona
- Verifica que la URL del webhook sea correcta
- Verifica que el webhook secret esté configurado
- Revisa los logs del webhook en Lemon Squeezy

## 📞 ¿Necesitas ayuda?

Si algo no funciona, dame el error específico y te ayudo a solucionarlo.

## 🚀 Para pasar a Producción

Cuando estés listo:
1. Obtén las credenciales de **Production** en Lemon Squeezy
2. Configúralas en el panel de admin (sección Production)
3. Cambia el modo a **"🚀 Modo Producción"**
4. Guarda y despliega
5. ¡Ya estás en vivo!

---

**Importante**: Guarda este archivo como referencia. Lo necesitarás cuando hagas la configuración de producción.

