# 👤 Crear Usuario de Prueba

## 🚀 Método Rápido (Recomendado)

### Paso 1: Asegúrate de que el servidor esté corriendo

```bash
npm run dev
```

### Paso 2: Abre tu navegador y ve a:

```
http://localhost:3000/api/create-test-user
```

Verás una respuesta JSON con las credenciales.

---

## 📋 Credenciales del Usuario de Prueba

Una vez creado, podrás acceder con:

- **Email:** `test@mindmetric.io`
- **Password:** `Test1234!`

---

## 🎯 ¿Qué incluye el usuario de prueba?

✅ **Cuenta activa** con suscripción válida por 1 año  
✅ **IQ registrado:** 125  
✅ **3 resultados de tests** de IQ históricos:
  - Hace 60 días: IQ 118
  - Hace 30 días: IQ 122
  - Hace 7 días: IQ 125

✅ **Acceso completo** a todas las funcionalidades premium

---

## 🌐 URLs de Acceso

### Login:
```
http://localhost:3000/es/login
```

### Dashboard/Cuenta:
```
http://localhost:3000/es/cuenta
```

### Tests Disponibles:
- **IQ Test:** `http://localhost:3000/es/test`
- **ADHD:** `http://localhost:3000/es/tests/adhd`
- **Ansiedad:** `http://localhost:3000/es/tests/anxiety`
- **Depresión:** `http://localhost:3000/es/tests/depression`
- **Personalidad:** `http://localhost:3000/es/tests/personality`
- **Inteligencia Emocional:** `http://localhost:3000/es/tests/eq`

---

## ⚠️ Importante

### Si la API no funciona:

1. Verifica que tengas configurada la base de datos en `.env.local`:
   ```env
   DATABASE_URL=postgresql://...
   # o
   POSTGRES_URL=postgresql://...
   ```

2. Asegúrate de que PostgreSQL esté corriendo

3. Si ya tienes la base de datos configurada en producción (Vercel), el usuario ya está creado allí

---

## 🔄 Recrear el Usuario

Si necesitas recrear el usuario (por ejemplo, si cambias la contraseña o quieres datos frescos):

1. **Opción A: Usar la API** (recomendado)
   ```bash
   # Con el servidor corriendo:
   curl http://localhost:3000/api/create-test-user
   ```

2. **Opción B: Crear manualmente desde la consola del dashboard**
   - Ve a tu panel de base de datos
   - Ejecuta el script SQL manualmente

---

## 🧪 Probar Funcionalidades

### Test de Login:
1. Ve a `http://localhost:3000/es/login`
2. Ingresa `test@mindmetric.io` / `Test1234!`
3. Deberías ver tu dashboard con tu IQ de 125

### Ver Historial:
1. Login con el usuario de prueba
2. Ve a "Mi Cuenta" o Dashboard
3. Verás los 3 tests de IQ históricos con gráficos de evolución

### Hacer un Nuevo Test:
1. Ve a cualquier test (IQ, ADHD, etc.)
2. Complétalo
3. El resultado se guardará automáticamente en tu cuenta

---

## 📊 Estructura de Datos

El usuario de prueba incluye:

```json
{
  "email": "test@mindmetric.io",
  "userName": "Usuario de Prueba",
  "iq": 125,
  "subscriptionStatus": "active",
  "trialEndDate": "2025-12-02" // +1 año desde creación
  "accessUntil": "2025-12-02" // +1 año desde creación
  "tests_results": [
    { "iq": 118, "date": "60 días atrás" },
    { "iq": 122, "date": "30 días atrás" },
    { "iq": 125, "date": "7 días atrás" }
  ]
}
```

---

## 🔐 Seguridad

- La contraseña está hasheada con bcrypt (12 salt rounds)
- El usuario solo existe en tu base de datos local/desarrollo
- Puedes cambiar la contraseña desde el perfil una vez logueado

---

## 💡 Uso Recomendado

Este usuario es perfecto para:

✅ Probar el flujo de usuario completo  
✅ Verificar el dashboard con datos reales  
✅ Hacer demos del producto  
✅ Testing de features nuevas  
✅ Verificar que los gráficos se ven correctamente  
✅ Probar la gestión de suscripción  

---

## 🆘 Troubleshooting

### "Error: No se encontró DATABASE_URL"
→ Configura tu base de datos en `.env.local`

### "Usuario ya existe"
→ Normal. La API actualiza el usuario existente con nuevos datos

### "No puedo hacer login"
→ Verifica que hayas creado el usuario con la API primero
→ Asegúrate de usar las credenciales exactas (case-sensitive)

### "No veo los tests en el dashboard"
→ Los tests se crearon en la base de datos
→ Verifica que tu consulta esté trayendo los test_results correctamente

---

## 📝 Notas

- El usuario se crea/actualiza cada vez que llamas a la API
- Los tests históricos se recrean cada vez
- La suscripción siempre se extiende 1 año desde el momento de creación
- Puedes modificar el script en `app/api/create-test-user/route.ts` para personalizar los datos


