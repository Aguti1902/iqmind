# 🔍 DEBUG: Error 500 en /api/migrate-db

## 📋 PARA VER EL ERROR COMPLETO:

### Opción 1: Abrir directamente en el navegador
1. Ve a: https://www.mindmetric.io/api/migrate-db
2. Deberías ver un JSON con el error
3. Cópiame TODO el JSON que aparece

### Opción 2: Ver logs en Vercel
1. Ve a: https://vercel.com/dashboard
2. Tu proyecto → "Logs" (pestaña arriba)
3. Filtra por "api/migrate-db"
4. Busca líneas con ❌ o "Error"
5. Cópiame las líneas del error

---

## 🎯 LO QUE NECESITO VER:

El error debería verse algo así:
```json
{
  "success": false,
  "error": "AQUÍ ESTÁ EL ERROR REAL",
  "stack": "..."
}
```

O en los logs:
```
❌ Error en migración: ...
```

---

## 🔧 MIENTRAS TANTO...

Si no puedes acceder a los logs, prueba esto:

### Verificar que POSTGRES_URL esté configurada:
1. Vercel → Settings → Environment Variables
2. Busca `POSTGRES_URL`
3. Debe tener la URL de Railway
4. Debe verse así: `postgresql://postgres:XXX@containers-us-west-XXX.railway.app:XXXX/railway`

### Verificar que Railway esté online:
1. Ve a https://railway.app/
2. Tu proyecto → Postgres-Zleq
3. Verifica que esté "online" (verde)

---

**Una vez que me pases el error completo, lo arreglo en 2 minutos.** 🚀

