# Panel de Administración - IQmind

## 🎯 Descripción

El panel de administración te permite gestionar toda la configuración de tu sitio web desde una interfaz visual moderna, sin necesidad de tocar código o variables de entorno.

## 🚀 Acceso

**URL:** `https://tudominio.com/es/admin`

**Requisitos:**
- Debes estar autenticado (logged in)
- Tu email debe estar en la lista de administradores

## 📋 Configuración Inicial

### 1. Ejecutar Migración de Base de Datos

Antes de usar el panel, ejecuta la migración para crear la tabla de configuración:

```bash
# Visita esta URL en tu navegador:
https://tudominio.com/api/admin/migrate-db
```

Deberías ver: `{"message":"Migración completada exitosamente","success":true}`

### 2. Añadir tu Email como Administrador

**Primera vez (Manual):**

Conecta a tu base de datos y ejecuta:

```sql
UPDATE site_config 
SET value = 'tu-email@ejemplo.com' 
WHERE key = 'admin_emails';
```

**Después:** Podrás añadir más administradores desde el propio panel.

## 🎨 Características del Panel

### 1. **Modo de Stripe** (Test/Producción)

- **Botón destacado** en la parte superior para cambiar entre:
  - 🧪 **Modo Test**: Para desarrollo y pruebas
  - 🚀 **Modo Producción**: Para pagos reales

- Los cambios se aplican inmediatamente al guardar
- Visual claro con colores amarillo (test) y verde (producción)

### 2. **Credenciales de Stripe**

Gestiona todas tus claves de Stripe en un solo lugar:

#### Claves de Test:
- Publishable Key (pk_test_...)
- Secret Key (sk_test_...)
- Price ID (price_test_...)

#### Claves de Producción:
- Publishable Key (pk_live_...)
- Secret Key (sk_live_...)
- Price ID (price_live_...)

**Nota:** Las claves secretas se muestran como contraseñas por seguridad.

### 3. **Precios y Configuración**

Controla los precios mostrados en tu web:

- **Pago Inicial**: Cobro único para ver resultados (ej: 0.50€)
- **Suscripción Mensual**: Precio de la mensualidad (ej: 9.99€)
- **Días de Prueba**: Período de prueba gratuita (ej: 7 días)

### 4. **Gestión de Administradores**

- Lista de emails separados por comas
- Solo estos usuarios pueden acceder al panel
- Actualizaciones en tiempo real

## 🔐 Seguridad

- ✅ Autenticación requerida
- ✅ Verificación de permisos de administrador
- ✅ Claves sensibles ocultas (tipo password)
- ✅ Registro de quién actualiza cada configuración

## 📊 Cómo Usar

### Cambiar Modo de Stripe

1. Accede al panel
2. Haz clic en el botón **"Cambiar a Producción"** (o Test)
3. Haz clic en **"Guardar Configuración"**
4. ✅ Los cambios se aplican inmediatamente

### Actualizar Credenciales

1. Ve a la pestaña **"Credenciales Stripe"**
2. Ingresa tus claves (test o producción)
3. Haz clic en **"Guardar Configuración"**
4. ✅ Las nuevas claves se usan automáticamente

### Cambiar Precios

1. Ve a la pestaña **"Precios y Textos"**
2. Actualiza los valores
3. Haz clic en **"Guardar Configuración"**
4. ✅ Los nuevos precios se muestran en la web

### Añadir Administradores

1. Ve a la pestaña **"Administradores"**
2. Añade emails separados por comas
3. Haz clic en **"Guardar Configuración"**
4. ✅ Los nuevos administradores pueden acceder al panel

## 🔄 Integración con la Aplicación

El panel actualiza la tabla `site_config` en la base de datos. Para usar estos valores en tu aplicación:

```typescript
import { db } from '@/lib/database-postgres'

// Obtener una configuración específica
const stripeMode = await db.getConfigByKey('stripe_mode')

// Obtener toda la configuración
const config = await db.getAllConfig()
```

## 🛠️ Archivos Creados

### Base de Datos:
- `lib/db-schema.sql` - Schema con tabla `site_config`
- `lib/database-postgres.ts` - Funciones para manejar configuración

### API Endpoints:
- `app/api/admin/config/route.ts` - GET/POST configuración
- `app/api/admin/check/route.ts` - Verificar si usuario es admin
- `app/api/admin/migrate-db/route.ts` - Ejecutar migración

### Frontend:
- `app/[lang]/admin/page.tsx` - Panel de administración

## 🎯 Próximos Pasos

1. ✅ Ejecutar migración de BD
2. ✅ Añadir tu email como administrador
3. ✅ Acceder al panel
4. ✅ Configurar credenciales de Stripe
5. ✅ Ajustar precios según tu modelo de negocio
6. ✅ Cambiar a modo producción cuando estés listo

## 💡 Tips

- **Backup**: Guarda tus claves de Stripe en un lugar seguro
- **Test primero**: Prueba siempre en modo test antes de producción
- **Monitoreo**: Verifica que los precios en Stripe coincidan con los del panel
- **Seguridad**: Usa emails únicos y confiables como administradores

## ❓ Solución de Problemas

### No puedo acceder al panel
- Verifica que tu email esté en `admin_emails`
- Asegúrate de estar autenticado
- Revisa la consola del navegador por errores

### Los cambios no se aplican
- Haz clic en "Guardar Configuración"
- Verifica la conexión a la base de datos
- Revisa los logs del servidor

### Error al ejecutar migración
- Verifica que `POSTGRES_URL` esté configurada
- Comprueba los permisos de la base de datos
- Revisa que la tabla no exista ya

## 📞 Soporte

Si tienes problemas, verifica:
1. Variables de entorno configuradas
2. Conexión a base de datos activa
3. Permisos de administrador correctos
4. Logs del servidor para más detalles

---

**¡Disfruta de tu nuevo panel de administración! 🎉**

