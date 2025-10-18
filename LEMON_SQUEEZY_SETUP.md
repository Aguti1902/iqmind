# 🍋 Configuración de Lemon Squeezy - Guía Completa

## ¿Por qué Lemon Squeezy?

Lemon Squeezy es **mucho mejor que Stripe** para tu modelo de negocio por las siguientes razones:

### ✅ Ventajas clave:

1. **Merchant of Record**: Lemon Squeezy actúa como comerciante registrado, lo que significa:
   - Ellos se encargan de todos los impuestos (IVA, Sales Tax, etc.) automáticamente
   - Menos riesgo legal para ti
   - Compliance automático con regulaciones globales

2. **Mejor gestión de disputas**:
   - Políticas más flexibles con chargebacks
   - Menos restrictivo que Stripe
   - Menor riesgo de cierre de cuenta

3. **Ideal para SaaS**:
   - Diseñado específicamente para suscripciones
   - Soporte nativo para trials
   - Gestión automática de renovaciones

4. **Sin sorpresas**:
   - Tarifas transparentes: 5% + comisión del procesador
   - Sin costos ocultos
   - Sin requerimientos de volumen mínimo

5. **Fácil de usar**:
   - API simple y bien documentada
   - Dashboard intuitivo
   - Webhooks confiables

## 📋 Pasos para Configurar Lemon Squeezy

### 1. Crear cuenta en Lemon Squeezy

1. Ve a [https://lemonsqueezy.com](https://lemonsqueezy.com)
2. Regístrate con tu email
3. Completa la verificación de tu cuenta
4. Configura tu tienda (Store)

### 2. Crear tu Producto/Suscripción

1. En el dashboard, ve a **Products**
2. Click en **New Product**
3. Configura:
   - **Nombre**: "IQmind Premium"
   - **Descripción**: Tu descripción del servicio
   - **Tipo**: Subscription
   - **Precio**: €9.99/mes (o el precio que quieras)
   - **Trial period**: 2 días (configurable)

4. Guarda el producto y anota el **Variant ID** (lo necesitarás más tarde)

### 3. Obtener tus API Keys

#### Para Modo Test:

1. Ve a **Settings** > **API**
2. En la sección "Test mode", crea una nueva API key
3. Anota:
   - **API Key Test**: `lmsk_test_...`
   - **Store ID Test**: Número de tu tienda en modo test
   - **Variant ID Test**: ID del producto creado en modo test

#### Para Modo Production:

1. Una vez que hayas probado todo en test
2. Activa el modo producción en tu cuenta
3. Crea las mismas keys pero en modo producción:
   - **API Key Live**: `lmsk_live_...`
   - **Store ID Live**: Número de tu tienda en modo live
   - **Variant ID Live**: ID del producto creado en modo live

### 4. Configurar Webhooks

1. Ve a **Settings** > **Webhooks**
2. Click en **Add endpoint**
3. URL del webhook: `https://tu-dominio.com/api/lemon-webhook`
4. Selecciona los siguientes eventos:
   - `order_created`
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_payment_success`
   - `subscription_payment_failed`

5. Guarda y anota el **Webhook Secret**

### 5. Configurar en el Panel de Admin

1. Ve a tu panel de admin: `https://tu-dominio.com/es/admin`
2. Asegúrate de estar logueado como administrador
3. Selecciona **Lemon Squeezy** como proveedor de pago
4. Selecciona el modo (**Test** o **Production**)
5. En la pestaña **Credenciales de Pago**, rellena:

   **Para Test:**
   - API Key (Test): `lmsk_test_xxxxx`
   - Store ID (Test): `12345`
   - Variant ID (Test): `67890`
   - Webhook Secret (Test): `whsec_test_xxxxx`

   **Para Production:**
   - API Key (Live): `lmsk_live_xxxxx`
   - Store ID (Live): `12345`
   - Variant ID (Live): `67890`
   - Webhook Secret (Live): `whsec_xxxxx`

6. Configura precios en la pestaña **Precios y Textos**
7. Click en **Guardar Configuración**

### 6. Migrar Base de Datos

Si tienes usuarios existentes de Stripe, ejecuta:

```bash
# Accede a tu terminal
# Navega al proyecto
cd /path/to/IQLEVEL

# Ejecuta el script de migración
npm run migrate-db
```

O ejecuta manualmente el SQL:

```sql
-- Actualizar configuración
INSERT INTO site_config (key, value, description) VALUES
  ('payment_provider', 'lemonsqueezy', 'Proveedor de pagos: stripe o lemonsqueezy'),
  ('payment_mode', 'test', 'Modo de pago: test o production'),
  ('lemonsqueezy_test_api_key', '', 'API Key de Lemon Squeezy (test)'),
  ('lemonsqueezy_live_api_key', '', 'API Key de Lemon Squeezy (production)'),
  ('lemonsqueezy_test_store_id', '', 'Store ID de Lemon Squeezy (test)'),
  ('lemonsqueezy_live_store_id', '', 'Store ID de Lemon Squeezy (production)'),
  ('lemonsqueezy_test_variant_id', '', 'Variant ID del producto/suscripción (test)'),
  ('lemonsqueezy_live_variant_id', '', 'Variant ID del producto/suscripción (production)'),
  ('lemonsqueezy_test_webhook_secret', '', 'Webhook secret de Lemon Squeezy (test)'),
  ('lemonsqueezy_live_webhook_secret', '', 'Webhook secret de Lemon Squeezy (production)')
ON CONFLICT (key) DO NOTHING;
```

## 🧪 Probar en Modo Test

1. En el panel de admin, asegúrate de estar en **Modo Test**
2. Completa un test de IQ en tu sitio
3. Ve al checkout
4. Usa las tarjetas de prueba de Lemon Squeezy:
   - Tarjeta exitosa: `4242 4242 4242 4242`
   - CVV: cualquier 3 dígitos
   - Fecha: cualquier fecha futura

5. Verifica en el dashboard de Lemon Squeezy que:
   - La orden se creó
   - La suscripción se creó
   - El trial está activo

6. Verifica en tu base de datos que el usuario se actualizó con:
   - `subscription_id` de Lemon Squeezy
   - `subscription_status`: 'trial'
   - `trial_end_date`: fecha correcta

## 🚀 Pasar a Producción

1. Asegúrate de tener todas las credenciales de producción configuradas
2. En el panel de admin, cambia a **Modo Production**
3. Click en **Guardar Configuración**
4. Espera 2 minutos para que se aplique el redeploy automático
5. Prueba con una tarjeta real pequeña para verificar

## 📊 Monitorear Suscripciones

### En Lemon Squeezy Dashboard:

- Ve a **Subscriptions** para ver todas las suscripciones activas
- Ve a **Orders** para ver todos los pagos
- Ve a **Customers** para ver tus clientes

### En tu Base de Datos:

```sql
-- Ver usuarios con suscripciones activas
SELECT id, email, subscription_status, trial_end_date, access_until
FROM users
WHERE subscription_status IN ('trial', 'active')
ORDER BY created_at DESC;

-- Ver todas las suscripciones
SELECT subscription_id, subscription_status, COUNT(*) as total
FROM users
WHERE subscription_id IS NOT NULL
GROUP BY subscription_id, subscription_status;
```

## 🔧 Gestión de Disputas Automática

Lemon Squeezy maneja las disputas automáticamente, pero puedes configurar:

1. **Emails automáticos**: En Settings > Emails, configura emails de bienvenida, renovación, etc.
2. **Política de cancelación**: Define si permites reembolsos y bajo qué condiciones
3. **Dunning**: Gestión automática de pagos fallidos con reintentos

### Ventajas vs Stripe:

- Lemon Squeezy es **mucho más flexible** con disputas
- No cierra cuentas tan fácilmente como Stripe
- Mejor soporte para modelos de negocio con trials

## 🎯 Mejores Prácticas

1. **Mantén ambas configuraciones**: Guarda tanto Stripe como Lemon Squeezy en la BD por si necesitas volver
2. **Monitorea webhooks**: Revisa los logs de webhooks regularmente
3. **Prueba exhaustivamente en test**: No pases a producción sin probar todo
4. **Documenta precios**: Asegúrate de que los precios en el panel admin coincidan con Lemon Squeezy
5. **Backups regulares**: Haz backups de tu base de datos antes de cambios grandes

## 🆘 Troubleshooting

### "Webhook signature invalid"

- Verifica que el `webhook_secret` en tu admin panel coincida con el de Lemon Squeezy
- Asegúrate de estar usando el secret del modo correcto (test o production)

### "API Key invalid"

- Verifica que la API key empiece con `lmsk_test_` (test) o `lmsk_live_` (production)
- Genera una nueva key si es necesario

### "Subscription not created"

- Verifica que el `variant_id` sea correcto
- Verifica que el producto esté activo en Lemon Squeezy
- Revisa los logs del webhook

### El checkout no redirige

- Asegúrate de que el `checkout_url` se está generando correctamente
- Verifica que la página de resultado esté configurada en Lemon Squeezy (Settings > Checkout)

## 📞 Soporte

- **Lemon Squeezy Support**: https://lemonsqueezy.com/help
- **Documentación API**: https://docs.lemonsqueezy.com
- **Community**: https://discord.gg/lemonsqueezy

## 🎉 Resumen

Lemon Squeezy es la mejor opción para tu negocio porque:

1. ✅ Menos riesgo de cierre de cuenta
2. ✅ Gestión automática de impuestos
3. ✅ Mejor para disputas
4. ✅ Diseñado para SaaS
5. ✅ Fácil de usar
6. ✅ Sin sorpresas en costos

Con esta configuración, tu sistema de pagos estará **mucho más estable** y podrás **escalar sin preocupaciones**.

