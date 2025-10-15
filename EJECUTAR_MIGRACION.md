# 🚀 EJECUTAR MIGRACIÓN DE BASE DE DATOS

## ⚡ PASOS SÚPER RÁPIDOS

### 1️⃣ HACER PUSH A GITHUB

**Opción A - GitHub Desktop:**
- Abre GitHub Desktop
- Click en **"Push origin"**

**Opción B - Terminal:**
```bash
git push origin main
```

---

### 2️⃣ ESPERAR QUE VERCEL HAGA DEPLOY
- Ve a https://vercel.com/dashboard
- Espera 2-3 minutos hasta que el deploy termine
- Verifica que salga ✅ verde

---

### 3️⃣ EJECUTAR LA MIGRACIÓN (1 CLICK)

**Simplemente abre esta URL en tu navegador:**

```
https://www.iqmind.io/api/migrate-db
```

O en local (si estás probando):
```
http://localhost:3000/api/migrate-db
```

**Deberías ver una respuesta JSON como:**
```json
{
  "success": true,
  "message": "✅ Migración de base de datos completada exitosamente",
  "tables": {
    "users": 15,
    "test_results": 8,
    "password_resets": 6
  }
}
```

✅ **¡Eso es todo! La migración se ejecutó automáticamente.**

---

### 4️⃣ BORRAR EL ARCHIVO DE MIGRACIÓN (IMPORTANTE)

Por seguridad, una vez que la migración funcione, borra este archivo:

```bash
# Desde terminal
rm app/api/migrate-db/route.ts

# O simplemente bórralo manualmente desde el explorador de archivos
```

Luego haz commit:
```bash
git add -A
git commit -m "Eliminar endpoint de migración temporal"
git push origin main
```

---

### 5️⃣ VERIFICAR QUE TODO FUNCIONA

1. Ve a https://www.iqmind.io/es/test
2. Completa un test
3. Haz el pago de 0.50€
4. Revisa tu email y obtén las credenciales
5. Haz login en https://www.iqmind.io/es/cuenta
6. ✅ Deberías ver tu resultado del test
7. ✅ Recarga la página - los datos deben persistir

---

## ⚠️ SI ALGO SALE MAL

### Error: "DATABASE_URL not found"
- Ve a Vercel → Settings → Environment Variables
- Verifica que `DATABASE_URL` esté configurada
- Debe apuntar a tu base de datos de Railway

### Error: "Table already exists"
- ✅ Esto es normal, significa que algunas tablas ya estaban creadas
- La migración es segura, no borra datos existentes

### Error: "Could not connect to database"
- Verifica que Railway esté funcionando
- Ve a Railway → tu proyecto → verifica que esté en línea

---

## 🎉 RESULTADO ESPERADO

Después de estos pasos:
- ✅ Base de datos migrada correctamente
- ✅ Login funciona
- ✅ Tests se guardan en el dashboard
- ✅ Los datos persisten entre deploys
- ✅ Cancelaciones funcionan

---

## 📞 NOTAS

- El endpoint `/api/migrate-db` es temporal
- Solo necesitas ejecutarlo UNA VEZ
- Es seguro ejecutarlo varias veces (no duplica datos)
- Bórralo después de usarlo por seguridad

