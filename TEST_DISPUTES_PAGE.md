# Test de Página de Disputas

## URL que da error:
`https://iqmind.mobi/es/admin/disputes`

## Diagnóstico

La página está creada correctamente en:
`/app/[lang]/admin/disputes/page.tsx`

## Posibles causas del 404:

### 1. **No se ha hecho deploy**
Si acabas de crear los archivos, necesitas hacer deploy:

```bash
git add .
git commit -m "feat: dispute monitoring dashboard"
git push
```

Vercel hará deploy automáticamente.

### 2. **Servidor de desarrollo**
Si estás en local:

```bash
# Detener el servidor (Ctrl+C)
# Reiniciar:
npm run dev
```

### 3. **Ruta dinámica [lang]**
Verifica que la URL sea exactamente:
- ✅ `https://iqmind.mobi/es/admin/disputes`
- ✅ `https://iqmind.mobi/en/admin/disputes`
- ❌ `https://iqmind.mobi/admin/disputes` (sin idioma)

## Test Manual

### Opción 1: Crear enlace en admin principal

Añade este botón en `/app/[lang]/admin/page.tsx`:

```typescript
// Dentro del return, después del header
<div className="mt-6">
  <a 
    href="/es/admin/disputes"
    className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700"
  >
    <FaExclamationTriangle />
    Ver Monitor de Disputas
  </a>
</div>
```

### Opción 2: Acceso directo

1. Ir a: https://iqmind.mobi/es/admin
2. Luego navegar a: https://iqmind.mobi/es/admin/disputes

### Opción 3: Test de API directa

```bash
# Verificar que la API funciona
curl https://iqmind.mobi/api/admin/disputes \
  -H "x-user-email: tu-email@iqmind.mobi"
```

## Solución Rápida

1. **Hacer deploy ahora**:
```bash
cd /Users/guti/Desktop/CURSOR\ WEBS/IQLEVEL
git add .
git commit -m "feat: sistema de monitoreo de disputas"
git push
```

2. **Esperar 2-3 minutos** para que Vercel despliegue

3. **Probar**: https://iqmind.mobi/es/admin/disputes

4. **Si persiste el error**:
   - Verificar en Vercel Dashboard que el deploy terminó
   - Ver logs: `vercel logs`
   - Verificar que estás logueado como admin

## Verificación Post-Deploy

```bash
# Ver logs en tiempo real
vercel logs --follow

# Buscar errores
vercel logs | grep "disputes"
vercel logs | grep "404"
```

## Autenticación Requerida

La página requiere:
1. Estar logueado (tener `userEmail` en localStorage)
2. Ser admin (email en la lista de admins en BD)

Si no estás logueado:
1. Ir a: https://iqmind.mobi/es/login
2. Loguearte con tu email de admin
3. Luego ir a: https://iqmind.mobi/es/admin/disputes

## Debug en Consola

Abre la consola del navegador (F12) y verifica:

```javascript
// Verificar que tienes email guardado
localStorage.getItem('userEmail')

// Debería mostrar: "tu-email@iqmind.mobi"
// Si muestra null, necesitas loguearte
```

