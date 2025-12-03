# 🔐 Crear Usuario Administrador

## 📋 Resumen

Este documento explica cómo crear un usuario administrador para acceder al panel de administración de MindMetric.

---

## 🚀 Método 1: Usar el Endpoint API (Recomendado)

### **Paso 1: Visitar el Endpoint**

Abre tu navegador y visita:

```
https://tudominio.com/api/create-admin-user
```

O en desarrollo local:

```
http://localhost:3000/api/create-admin-user
```

### **Paso 2: Copiar las Credenciales**

Verás una respuesta JSON como esta:

```json
{
  "success": true,
  "message": "Usuario administrador creado exitosamente",
  "credentials": {
    "email": "admin@mindmetric.io",
    "password": "Admin2024!MindMetric",
    "note": "Guarda estas credenciales en un lugar seguro..."
  },
  "accessUrl": {
    "login": "/es/login",
    "admin": "/es/admin"
  }
}
```

### **Paso 3: Iniciar Sesión**

1. Ve a: `https://tudominio.com/es/login`
2. Ingresa las credenciales:
   - **Email**: `admin@mindmetric.io`
   - **Password**: `Admin2024!MindMetric`
3. Click en **"Iniciar Sesión"**

### **Paso 4: Acceder al Panel de Admin**

Ahora puedes ir directamente a:

```
https://tudominio.com/es/admin
```

---

## 🔄 Si el Usuario Ya Existe

Si el usuario ya fue creado antes, verás este mensaje:

```json
{
  "success": false,
  "message": "El usuario administrador ya existe",
  "credentials": {
    "email": "admin@mindmetric.io",
    "password": "Admin2024!MindMetric",
    "note": "Usa estas credenciales para iniciar sesión"
  }
}
```

Simplemente usa esas credenciales para iniciar sesión.

---

## 🛠️ Método 2: Crear Usuario Manualmente (Avanzado)

Si prefieres, puedes crear el usuario directamente en la base de datos:

### **Paso 1: Conectar a tu Base de Datos**

Desde Vercel, tu proveedor de hosting, o usando un cliente SQL.

### **Paso 2: Ejecutar el Query**

```sql
-- 1. Crear el usuario (password hash para "Admin2024!MindMetric")
INSERT INTO users (
  id, 
  email, 
  password, 
  user_name, 
  subscription_status,
  created_at,
  updated_at
) VALUES (
  'user_admin_' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'admin@mindmetric.io',
  '$2a$10$YourBcryptHashHere', -- Debes generar el hash con bcrypt
  'Administrador',
  'active',
  NOW(),
  NOW()
);

-- 2. Añadir a la lista de administradores
INSERT INTO site_config (key, value, description)
VALUES ('admin_emails', 'admin@mindmetric.io', 'Emails de administradores')
ON CONFLICT (key) 
DO UPDATE SET value = site_config.value || ',admin@mindmetric.io';
```

**Nota**: Necesitas generar el hash de la contraseña con bcrypt. Es más fácil usar el Método 1.

---

## 📝 Credenciales Predeterminadas

```
📧 Email:    admin@mindmetric.io
🔑 Password: Admin2024!MindMetric
```

### ⚠️ IMPORTANTE:
- **Cambia la contraseña** después de iniciar sesión por primera vez
- **Guarda** estas credenciales en un lugar seguro
- No compartas la contraseña con nadie

---

## 🔒 Cambiar la Contraseña

Una vez que hayas iniciado sesión:

1. Ve a **Mi Cuenta** (`/es/cuenta`)
2. Busca la sección **"Cambiar Contraseña"**
3. Ingresa:
   - **Contraseña actual**: `Admin2024!MindMetric`
   - **Nueva contraseña**: Tu nueva contraseña segura
   - **Confirmar**: Repite la nueva contraseña
4. Click en **"Guardar"**

---

## 👥 Añadir Más Administradores

Desde el panel de administración (`/es/admin`):

1. Ve a la pestaña **"Administradores"**
2. Añade emails separados por comas:
   ```
   admin@mindmetric.io,otro-admin@mindmetric.io,tercer-admin@mindmetric.io
   ```
3. Click en **"Guardar Configuración"**

Los nuevos administradores necesitarán:
1. Tener una cuenta de usuario (pueden registrarse normalmente)
2. Su email debe estar en la lista de administradores
3. Iniciar sesión y visitar `/es/admin`

---

## 🔧 Solución de Problemas

### "No puedo acceder al endpoint"

**Problema**: Error 404 o página no encontrada

**Solución**:
1. Verifica que la URL sea correcta
2. Asegúrate de que el servidor esté corriendo
3. En producción, espera unos minutos después del deploy

---

### "Error al crear usuario"

**Problema**: Error 500 o error de base de datos

**Solución**:
1. Verifica que `POSTGRES_URL` esté configurada en las variables de entorno
2. Verifica que la tabla `users` exista
3. Ejecuta la migración: `/api/admin/migrate-db`
4. Revisa los logs del servidor

---

### "Usuario creado pero no puedo iniciar sesión"

**Problema**: Credenciales no funcionan

**Solución**:
1. Verifica que estés usando el email correcto: `admin@mindmetric.io`
2. Verifica que la contraseña sea exactamente: `Admin2024!MindMetric`
3. Asegúrate de que no haya espacios extra
4. Prueba en modo incógnito del navegador

---

### "Puedo iniciar sesión pero no puedo acceder a /es/admin"

**Problema**: Página de admin muestra "No autorizado" o redirige

**Solución**:
1. Verifica que tu email esté en la tabla `site_config`:
   ```sql
   SELECT * FROM site_config WHERE key = 'admin_emails';
   ```
2. Si no aparece, añádelo:
   ```sql
   UPDATE site_config 
   SET value = 'admin@mindmetric.io' 
   WHERE key = 'admin_emails';
   ```
3. Cierra sesión y vuelve a iniciar sesión

---

## 📞 Resumen de URLs

| Función | URL | Método |
|---------|-----|--------|
| Crear admin | `/api/create-admin-user` | POST (visitar en navegador) |
| Iniciar sesión | `/es/login` | Formulario |
| Panel admin | `/es/admin` | Página |
| Mi cuenta | `/es/cuenta` | Página |
| Cambiar password | `/es/cuenta` (sección de contraseña) | Formulario |

---

## ✅ Checklist

Antes de considerarlo completado:

- [ ] Visité `/api/create-admin-user`
- [ ] Copié las credenciales
- [ ] Inicié sesión en `/es/login`
- [ ] Accedí al panel en `/es/admin`
- [ ] Cambié la contraseña
- [ ] Guardé las nuevas credenciales

---

## 🎯 Siguiente Paso

Una vez que tengas acceso al panel de administración, consulta:

- **`PANEL_ADMIN.md`** - Guía completa del panel de administración
- **`CONFIGURACION-STRIPE.md`** - Cómo configurar Stripe desde el panel

---

**¡Listo! Ahora tienes acceso completo al panel de administración.** 🎉

