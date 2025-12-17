# 🧪 Flujo de Prueba Completo - MindMetric

## ✅ Estado Actual del Sistema

```
✅ Base de datos: Conectada y configurada
✅ Tablas: Creadas correctamente
✅ Usuario admin: admin@mindmetric.io / Admin123!
✅ Sitio web: Online en https://mindmetric.io
✅ APIs: Funcionando correctamente
⚠️  Stripe: Pendiente de configurar
```

---

## 🔐 Paso 1: Configurar Stripe (5 minutos)

### 1.1. Acceder al Admin Panel

```
URL: https://mindmetric.io/admin
Email: admin@mindmetric.io
Password: Admin123!
```

### 1.2. Obtener Claves de Stripe

**Dashboard de Stripe (Test Mode):**

1. **API Keys** → https://dashboard.stripe.com/test/apikeys
   ```
   Publishable Key: pk_test_XXXXXXXXXX
   Secret Key: sk_test_XXXXXXXXXX (click "Reveal test key")
   ```

2. **Webhooks** → https://dashboard.stripe.com/test/webhooks
   - Si no existe, crea uno nuevo:
     - URL: `https://mindmetric.io/api/webhooks/stripe`
     - Eventos: Selecciona todos o al menos:
       - `payment_intent.succeeded`
       - `customer.subscription.created`
       - `customer.subscription.updated`
       - `customer.subscription.deleted`
   - Copia el **Signing Secret**:
   ```
   Webhook Secret: whsec_XXXXXXXXXX
   ```

3. **Products** → https://dashboard.stripe.com/test/products
   - Si no existen, créalos:
   
   **Producto 1: Suscripción Quincenal**
   - Nombre: "MindMetric Premium - Quincenal"
   - Precio: €9.99
   - Billing: Recurring → Every 2 weeks
   - Copia el **Price ID**: `price_XXXXXXXXXX`
   
   **Producto 2: Suscripción Mensual**
   - Nombre: "MindMetric Premium - Mensual"
   - Precio: €19.99
   - Billing: Recurring → Monthly
   - Copia el **Price ID**: `price_XXXXXXXXXX`

### 1.3. Configurar en el Admin Panel

1. Ve a https://mindmetric.io/admin
2. Inicia sesión
3. Rellena estos campos en la sección **"TEST MODE"**:
   ```
   Stripe Mode: test
   Publishable Key: pk_test_XXXXXXXXXX
   Secret Key: sk_test_XXXXXXXXXX
   Webhook Secret: whsec_XXXXXXXXXX
   Price ID Quincenal: price_XXXXXXXXXX
   Price ID Mensual: price_XXXXXXXXXX
   ```
4. Haz clic en **"Guardar Configuración"**
5. Espera la confirmación

---

## 🧪 Paso 2: Probar el Flujo Completo (10 minutos)

### 2.1. Test Completo con Pago

```
📍 URL: https://mindmetric.io/es/test
```

**Flujo esperado:**

1. **Página de Inicio**
   - ✅ Ver landing page
   - ✅ Click en "Comenzar Test"

2. **Formulario de Datos**
   - ✅ Ingresar nombre: "Test Usuario"
   - ✅ Leer instrucciones
   - ✅ Click "Comenzar Test"

3. **Realizar Test (20 preguntas)**
   - ✅ Ver matriz 3x3 con el problema
   - ✅ Ver 6 opciones de respuesta
   - ✅ Seleccionar una opción
   - ✅ Avanzar automáticamente a la siguiente
   - ✅ Ver barra de progreso
   - ✅ Ver contador de tiempo
   - ✅ Completar las 20 preguntas

4. **Resultado Estimado**
   - ✅ Ver "¡Test Usuario, Tu Resultado Está Casi Listo!"
   - ✅ Ver resultado borroso (ej: "Tu CI: 1••")
   - ✅ Ver botón "Desbloquear Resultado por 0,50€"
   - ✅ Click en el botón

5. **Checkout**
   - ✅ Ver resumen del pedido
   - ✅ Ver precio: €0.50
   - ✅ Ingresar email: `test-flow@gmail.com` (usa un email nuevo cada vez)
   - ✅ Aceptar términos y condiciones
   - ✅ Ver formulario de Stripe cargado
   - ✅ Ingresar datos de tarjeta de prueba:
     ```
     Número: 4242 4242 4242 4242
     Fecha: 12/25 (cualquier fecha futura)
     CVC: 123 (cualquier 3 dígitos)
     Código postal: 12345 (cualquier código)
     ```
   - ✅ Click "Pagar 0,50€"
   - ✅ Ver "Procesando pago..."

6. **Resultado Completo**
   - ✅ Redirigir a `/es/resultado`
   - ✅ Ver "Test Usuario, Este es Tu Coeficiente Intelectual"
   - ✅ Ver CI completo (ej: "120")
   - ✅ Ver descripción del resultado
   - ✅ Ver gráficos y estadísticas
   - ✅ Ver botones de compartir

7. **Emails Recibidos (esperar 1-2 minutos)**
   - ✅ Email 1: "¡Pago confirmado! Tu CI: 120 🎉"
     - Confirma el pago de €0.50
     - Muestra el resultado de CI
     - Botón para ver dashboard
   
   - ✅ Email 2: "🎉 ¡Bienvenido a MindMetric! - Acceso a tu cuenta"
     - Credenciales de acceso:
       - Email: test-flow@gmail.com
       - Contraseña: (generada automáticamente)
     - CI destacado
     - Botón "Acceder al Dashboard"

8. **Acceder al Dashboard**
   - ✅ Copiar contraseña del email 2
   - ✅ Ir a https://mindmetric.io/es/cuenta
   - ✅ Login con email y contraseña del email
   - ✅ Ver dashboard con:
     - Tests realizados: 1
     - CI Más Alto: 120
     - CI Promedio: 120
     - Historial del test
     - Gráfico de progreso
     - Tests disponibles

9. **Verificar en Stripe**
   - ✅ Ir a https://dashboard.stripe.com/test/payments
   - ✅ Ver pago de €0.50 completado
   - ✅ Ver customer creado
   - ✅ Verificar metadata del pago

10. **Verificar en la Base de Datos**
    - ✅ Usuario creado en tabla `users`
    - ✅ Test guardado en tabla `test_results`
    - ✅ Respuestas y tiempo registrados

---

## 🔍 Verificaciones Adicionales

### 1. Panel de Admin

```
URL: https://mindmetric.io/admin
Email: admin@mindmetric.io
Password: Admin123!
```

**Verificar:**
- ✅ Configuración de Stripe visible
- ✅ Modo: test
- ✅ Todas las claves configuradas
- ✅ Price IDs presentes

### 2. Logs de Vercel

```
URL: https://vercel.com/[tu-proyecto]/logs
```

**Buscar:**
- ✅ `payment_intent.succeeded`
- ✅ `Email 1/2 enviado: Pago exitoso`
- ✅ `Usuario creado`
- ✅ `Test result guardado`
- ✅ `Email 2/2 enviado: Credenciales`

### 3. Railway Database

```
Ejecuta estas queries en Railway → Data/Query:
```

**Ver usuarios creados:**
```sql
SELECT id, email, user_name, iq, subscription_status, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

**Ver tests realizados:**
```sql
SELECT id, user_id, iq, correct_answers, time_elapsed, completed_at 
FROM test_results 
ORDER BY completed_at DESC 
LIMIT 5;
```

**Ver configuración:**
```sql
SELECT key, value 
FROM site_config 
WHERE key LIKE 'stripe%' 
ORDER BY key;
```

---

## ❌ Problemas Comunes y Soluciones

### "No se recibió publishableKey"

**Causa:** Stripe no está configurado o la configuración no se guardó.

**Solución:**
1. Ve a https://mindmetric.io/admin
2. Verifica que todas las claves estén llenas
3. Haz clic en "Guardar Configuración"
4. Espera la confirmación
5. Recarga la página de checkout

### "Tests realizados: 0" en el dashboard

**Causa:** El test no se guardó en la base de datos.

**Solución:**
1. Usa un **email diferente** en cada prueba
2. Si el usuario ya existe, el sistema no lo crea de nuevo
3. Verifica en Railway que el test_result se creó

### No llegan los emails

**Causa:** SendGrid no está configurado o el email está en spam.

**Solución:**
1. Verifica que `SENDGRID_API_KEY` esté en Vercel
2. Revisa la carpeta de spam
3. Espera 2-3 minutos (a veces tardan)
4. Verifica los logs de Vercel

### Error 500 en el checkout

**Causa:** Conexión a la base de datos fallando.

**Solución:**
1. Verifica que `POSTGRES_URL` en Vercel sea la URL pública de Railway
2. Redeploy en Vercel
3. Espera 1-2 minutos

---

## 📊 Checklist de Prueba

```
CONFIGURACIÓN:
[ ] Stripe configurado en admin panel
[ ] Webhook creado en Stripe
[ ] Products creados en Stripe
[ ] Price IDs obtenidos

FLUJO DE TEST:
[ ] Landing page carga correctamente
[ ] Formulario de datos funciona
[ ] Test de 20 preguntas funciona
[ ] Todas las preguntas se muestran
[ ] Contador de tiempo funciona
[ ] Barra de progreso avanza

CHECKOUT:
[ ] Página de checkout carga
[ ] Formulario de Stripe aparece
[ ] Tarjeta de prueba es aceptada
[ ] Pago se procesa correctamente

RESULTADO:
[ ] Página de resultado muestra CI completo
[ ] Gráficos y estadísticas visibles
[ ] Botones funcionan

EMAILS:
[ ] Email 1 (Pago confirmado) recibido
[ ] Email 2 (Credenciales) recibido
[ ] Credenciales funcionan para login

DASHBOARD:
[ ] Login funciona con credenciales del email
[ ] Dashboard muestra test realizado
[ ] "Tests realizados: 1" visible
[ ] CI correcto mostrado
[ ] Historial del test visible

BASE DE DATOS:
[ ] Usuario creado en tabla users
[ ] Test guardado en tabla test_results
[ ] Respuestas registradas

STRIPE:
[ ] Pago visible en dashboard de Stripe
[ ] Customer creado
[ ] Metadata del pago correcto
```

---

## 🎉 ¡Sistema Completamente Funcional!

Una vez que todas las verificaciones pasen, tu sistema estará 100% operativo:

✅ Base de datos funcionando
✅ Usuarios pueden registrarse
✅ Tests se guardan correctamente
✅ Pagos se procesan con Stripe
✅ Emails se envían automáticamente
✅ Dashboard muestra resultados

**¡Estás listo para producción!** 🚀

