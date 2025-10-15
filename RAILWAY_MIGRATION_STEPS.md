# 🚀 Migración de Base de Datos Railway - Pasos Correctos

## ⚠️ IMPORTANTE: No hay pestaña "Query" en Railway

Railway no tiene un editor SQL integrado. Aquí están las opciones correctas:

---

## 🎯 OPCIÓN 1: Usar TablePlus (Recomendado - MÁS FÁCIL)

### Paso 1: Descargar TablePlus
1. Ve a https://tableplus.com/
2. Descarga e instala (es gratis para uso básico)

### Paso 2: Obtener credenciales de Railway
1. Ve a https://railway.app/
2. Click en tu proyecto `Postgres-Zleq`
3. Click en la pestaña **"Connect"**
4. Copia la **"Postgres Connection URL"**
   - Se ve así: `postgresql://postgres:password@host.railway.app:port/railway`

### Paso 3: Conectar TablePlus a Railway
1. Abre TablePlus
2. Click en **"Create a new connection"**
3. Selecciona **"PostgreSQL"**
4. Pega la URL completa en el campo **"Connection URL"**
   O rellena manualmente:
   - Host: `xxx.railway.app`
   - Port: `xxxx`
   - User: `postgres`
   - Password: `(tu password)`
   - Database: `railway`
5. Click en **"Test"** y luego **"Connect"**

### Paso 4: Ejecutar el Script
1. Una vez conectado, click en **"SQL"** (botón arriba)
2. Abre el archivo `railway-migration.sql` de tu proyecto
3. Copia TODO el contenido del archivo
4. Pégalo en el editor SQL de TablePlus
5. Click en **"Run"** (▶️) o presiona `Cmd + Enter`
6. Verifica que no haya errores en la consola de abajo

✅ ¡Listo! La migración se ejecutó correctamente.

---

## 🎯 OPCIÓN 2: Usar psql desde Terminal

### Paso 1: Verificar que psql esté instalado
```bash
psql --version
```

Si no está instalado:
```bash
brew install postgresql
```

### Paso 2: Obtener credenciales de Railway
1. Ve a https://railway.app/
2. Click en tu proyecto `Postgres-Zleq`
3. Click en la pestaña **"Variables"**
4. Busca y copia `DATABASE_URL`

### Paso 3: Conectar y ejecutar el script
```bash
# Desde el directorio del proyecto
cd "/Users/guti/Desktop/CURSOR WEBS/IQLEVEL"

# Ejecutar el script (reemplaza DATABASE_URL con tu URL real)
psql "postgresql://postgres:password@host.railway.app:port/railway" -f railway-migration.sql
```

✅ Si todo sale bien, verás mensajes como "ALTER TABLE", "CREATE TABLE", etc.

---

## 🎯 OPCIÓN 3: Usar DBeaver (Alternativa gratuita)

### Paso 1: Descargar DBeaver
1. Ve a https://dbeaver.io/download/
2. Descarga la versión Community (gratis)
3. Instala

### Paso 2: Conectar a Railway
1. Abre DBeaver
2. Click en **"New Database Connection"**
3. Selecciona **"PostgreSQL"**
4. En la pestaña **"Connect"** de Railway, copia las credenciales:
   - Host: `xxx.railway.app`
   - Port: `xxxx`
   - Database: `railway`
   - Username: `postgres`
   - Password: `(tu password)`
5. Click en **"Test Connection"** y luego **"Finish"**

### Paso 3: Ejecutar el Script
1. Click derecho en tu conexión → **"SQL Editor"** → **"New SQL Script"**
2. Abre `railway-migration.sql` y copia todo el contenido
3. Pégalo en el editor
4. Click en **"Execute"** (▶️) o presiona `Ctrl + Enter`

---

## 🎯 OPCIÓN 4: Crear tablas manualmente desde código (SI TODO FALLA)

Si ninguna de las opciones anteriores funciona, puedo crear un endpoint temporal en tu app que ejecute la migración automáticamente.

¿Quieres que lo haga? Sería algo así:

```typescript
// app/api/migrate-db/route.ts
export async function POST() {
  // Ejecuta todo el SQL de migración
  // Solo lo ejecutas una vez desde el navegador
  // Luego lo borras
}
```

---

## ❓ ¿Cuál opción prefieres?

1. **TablePlus** (⭐ Recomendado - interfaz gráfica bonita)
2. **psql** (Terminal - rápido pero menos visual)
3. **DBeaver** (Gratis, robusto)
4. **Endpoint temporal** (Automático, sin instalar nada)

Dime cuál prefieres y te guío paso a paso.

