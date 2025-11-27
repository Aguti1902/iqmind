# 🎨 GUÍA DE REBRANDING - EVITAR DETECCIÓN

## ⚠️ CONTEXTO

Si Stripe cerró tu cuenta anterior, necesitas hacer un **rebranding completo** para evitar ser detectado como la misma web. Esto incluye cambios en el código, diseño, y toda la identidad visual.

---

## 📝 CAMBIOS EN ARCHIVOS DE TEXTO

### 1. package.json
```json
{
  "name": "nuevo-nombre-proyecto",  // ❌ Cambiar de "iqlevel"
  "version": "1.0.0",
  "description": "Nueva descripción diferente"  // Añadir si no existe
}
```

### 2. README.md
- Reescribir completamente con nueva descripción
- No mencionar el nombre anterior
- Cambiar todos los ejemplos de URLs

### 3. next.config.js
Si tienes configuración personalizada:
```javascript
const nextConfig = {
  // ... resto de config
  env: {
    NEXT_PUBLIC_APP_NAME: 'NuevoNombre',  // Cambiar
    NEXT_PUBLIC_SITE_NAME: 'NuevoNombre' // Cambiar
  }
}
```

---

## 🖼️ CAMBIOS DE IMÁGENES Y LOGOS

### Ubicación de Imágenes
```
/public/images/
  - Favicon.png        ← REEMPLAZAR
  - FAVICON2.png       ← REEMPLAZAR
  - LOGO.png          ← REEMPLAZAR
  - LOGO2.png         ← REEMPLAZAR
  - LOGO2.svg         ← REEMPLAZAR
  - LOGO2BLANCO.png   ← REEMPLAZAR
  - LOGO2BLANCO.svg   ← REEMPLAZAR
```

**Acción:** Elimina TODOS estos archivos y crea nuevos con:
- Colores DIFERENTES
- Tipografía DIFERENTE
- Diseño COMPLETAMENTE nuevo
- Mismo tamaño (para no romper el layout)

---

## 🌐 CAMBIOS EN METADATA Y SEO

### 1. app/layout.tsx (Root Layout)

Busca y cambia:

```typescript
export const metadata: Metadata = {
  title: 'Nuevo Nombre - Test de IQ',  // ❌ Cambiar
  description: 'Nueva descripción única y diferente',  // ❌ Cambiar
  keywords: 'nuevas, keywords, diferentes',  // ❌ Cambiar
  
  openGraph: {
    title: 'Nuevo Nombre - Test de IQ',  // ❌ Cambiar
    description: 'Nueva descripción',  // ❌ Cambiar
    siteName: 'Nuevo Nombre',  // ❌ Cambiar
    images: [{
      url: '/og-image-nuevo.png',  // ❌ Crear imagen nueva
      width: 1200,
      height: 630
    }]
  },
  
  twitter: {
    title: 'Nuevo Nombre',  // ❌ Cambiar
    description: 'Nueva descripción',  // ❌ Cambiar
    images: ['/twitter-image-nuevo.png']  // ❌ Crear imagen nueva
  }
}
```

### 2. Archivos de idiomas (messages/*.json)

**IMPORTANTE:** Estos archivos contienen el nombre de tu marca en varios lugares.

#### messages/es.json
```json
{
  "siteTitle": "Nuevo Nombre",  // ❌ Cambiar
  "siteDescription": "Nueva descripción del sitio",  // ❌ Cambiar
  "brandName": "Nuevo Nombre",  // ❌ Cambiar
  
  // Buscar en TODO el archivo:
  // - Reemplazar nombre antiguo con nuevo
  // - Cambiar frases características
  // - Modificar textos de marketing
}
```

Aplica lo mismo en:
- `messages/en.json`
- `messages/fr.json`
- `messages/de.json`
- `messages/it.json`
- `messages/pt.json`
- `messages/sv.json`
- `messages/no.json`
- `messages/uk.json`

---

## 🎨 CAMBIOS DE DISEÑO Y COLORES

### 1. tailwind.config.ts

Cambia los colores principales:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // ❌ CAMBIAR TODOS ESTOS COLORES
          50: '#nuevo-color',
          100: '#nuevo-color',
          // ... etc
          900: '#nuevo-color'
        }
      }
    }
  }
}
```

**Colores actuales a cambiar:**
- `#218B8E` (turquesa principal) → Cambiar a otro color
- Cualquier referencia a colores teal/turquoise
- Gradientes característicos

### 2. Buscar colores hardcodeados

Ejecuta este comando para encontrar colores:

```bash
grep -r "#218B8E" app/
grep -r "teal" app/
grep -r "turquoise" app/
```

Reemplaza TODOS con tu nueva paleta de colores.

---

## 📧 CAMBIOS DE TEXTOS Y COMUNICACIÓN

### 1. Emails (lib/email-translations.ts)

```typescript
export const emailTranslations = {
  es: {
    subject: 'Bienvenido a Nuevo Nombre',  // ❌ Cambiar
    title: 'Tu resultado está listo',  // ❌ Cambiar
    // ... cambiar TODOS los textos
    footer: '© 2024 Nuevo Nombre. Todos los derechos reservados.'  // ❌ Cambiar
  }
}
```

### 2. Textos legales

Actualiza estos archivos:
```
/app/[lang]/terminos/page.tsx
/app/[lang]/privacidad/page.tsx
/app/[lang]/reembolso/page.tsx
```

**Cambiar:**
- Nombre de la empresa
- Dirección (si aplica)
- Email de contacto
- Todos los datos identificativos

---

## 🔗 CAMBIOS DE URLs Y DOMINIOS

### 1. Variables de Entorno en Vercel

```
NEXT_PUBLIC_APP_URL=https://nuevo-dominio.com  // ❌ Cambiar
NEXT_PUBLIC_SITE_URL=https://nuevo-dominio.com  // ❌ Cambiar
```

### 2. Archivos con URLs hardcodeadas

Busca y reemplaza:

```bash
grep -r "iqmind.io" .
grep -r "iqlevel" .
```

Cambia TODAS las referencias al dominio antiguo.

---

## 📊 CAMBIOS DE ANALYTICS

### 1. Google Analytics (si está configurado)

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  // ❌ Crear NUEVA propiedad
```

**Acción:**
1. Crear una nueva propiedad en Google Analytics
2. NO conectarla con la anterior
3. Usar un nuevo ID

### 2. Meta Pixel (si está configurado)

```
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX  // ❌ Crear NUEVO pixel
```

**Acción:**
1. Crear un nuevo Pixel en Facebook Ads
2. NO usar el anterior
3. Implementar el nuevo ID

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### Nombres de Tablas (Opcional pero recomendado)

Si quieres ser extra seguro, cambia los nombres de las tablas:

```sql
-- Ejemplo de renombrado
ALTER TABLE users RENAME TO nuevo_users;
ALTER TABLE test_results RENAME TO nuevo_test_results;
-- etc.
```

Luego actualiza en `lib/database-postgres.ts` todas las referencias.

**⚠️ CUIDADO:** Solo haz esto si sabes lo que haces, o crea una NUEVA base de datos.

---

## 🎯 CAMBIOS DE ESTRATEGIA Y FUNCIONALIDAD

### Diferencias para Evitar Detección

1. **Cambiar el flujo de precios:**
   ```typescript
   // En lugar de 0.50€ inicial + 19.99€/mes
   // Prueba con:
   - 1€ inicial + 14.99€/mes
   - 0.99€ inicial + 24.99€/mes
   - Sin pago inicial + 29.99€/mes (14 días trial)
   ```

2. **Cambiar los días de trial:**
   ```typescript
   trial_days: '7'  // En lugar de '2'
   // o
   trial_days: '14'
   ```

3. **Cambiar el número de preguntas del test:**
   ```typescript
   // En lib/questions.ts
   // Añadir o quitar algunas preguntas
   // Cambiar el orden
   ```

4. **Cambiar textos de descripción del producto en Stripe:**
   ```
   Producto: "Premium Membership"
   Descripción: "Acceso completo a análisis de inteligencia"
   (Diferente al anterior)
   ```

---

## 📱 CAMBIOS EN COMPONENTES

### Buscar referencias visuales específicas

```bash
# Buscar por nombre antiguo
grep -ri "iqlevel" app/
grep -ri "iqmind" app/

# Buscar por frases características
grep -ri "descubre tu potencial" app/
grep -ri "test de coeficiente intelectual" app/
```

Cambia TODAS las ocurrencias con nuevos textos.

---

## 🔍 CHECKLIST DE REBRANDING COMPLETO

### Identidad Visual
- [ ] Logo nuevo (sin similitudes con el anterior)
- [ ] Favicon nuevo
- [ ] Paleta de colores diferente
- [ ] Tipografías diferentes
- [ ] Imágenes OG y Twitter nuevas

### Textos y Contenido
- [ ] Nombre del sitio cambiado en metadata
- [ ] Descripciones reescritas (diferentes)
- [ ] Mensajes de email cambiados
- [ ] Textos legales actualizados
- [ ] Mensajes en todos los idiomas actualizados

### Código y Configuración
- [ ] package.json renombrado
- [ ] Variables de entorno actualizadas
- [ ] URLs hardcodeadas cambiadas
- [ ] Colores en Tailwind modificados
- [ ] Analytics y pixels nuevos

### Stripe y Pagos
- [ ] Statement descriptor diferente
- [ ] Business name diferente
- [ ] Support email diferente (dominio nuevo)
- [ ] Logo en Stripe diferente
- [ ] Precios ligeramente diferentes
- [ ] Descripción del producto reescrita

### Técnico
- [ ] Dominio nuevo (sin relación con el anterior)
- [ ] Cuenta de Vercel nueva (opcional pero recomendado)
- [ ] Base de datos nueva o renombrada
- [ ] Webhooks con nuevo dominio
- [ ] SSL/HTTPS configurado en nuevo dominio

---

## 🚀 PASOS PARA EJECUTAR EL REBRANDING

### 1. Preparación (Antes de cambiar código)
- [ ] Comprar dominio nuevo
- [ ] Crear cuenta Stripe nueva (con datos diferentes)
- [ ] Diseñar logo y paleta de colores nuevos
- [ ] Escribir nuevos textos y descripciones

### 2. Cambios de Código (Orden recomendado)
1. Cambiar package.json y README
2. Reemplazar todos los logos e imágenes
3. Actualizar tailwind.config.ts (colores)
4. Modificar archivos de idiomas (messages/*.json)
5. Cambiar metadata en layout.tsx
6. Actualizar emails (lib/email-translations.ts)
7. Modificar páginas legales
8. Buscar y reemplazar URLs antiguas
9. Actualizar Analytics IDs

### 3. Deploy y Verificación
- [ ] Commit y push a GitHub
- [ ] Configurar Vercel con nuevo dominio
- [ ] Añadir variables de entorno de Stripe nuevas
- [ ] Configurar webhooks en Stripe con nuevo dominio
- [ ] Probar el flujo completo de pago
- [ ] Verificar emails que se envían
- [ ] Comprobar que todo funciona correctamente

---

## ⚠️ ERRORES COMUNES A EVITAR

### ❌ NO hagas esto:
1. Usar el mismo logo con solo cambiar el color
2. Mantener textos muy similares
3. Usar la misma cuenta bancaria en Stripe
4. Usar el mismo soporte email
5. Mantener la misma estructura de precios
6. Copiar las mismas descripciones
7. Usar las mismas keywords en SEO

### ✅ SÍ haz esto:
1. Diseño completamente nuevo
2. Textos reescritos desde cero
3. Cuenta bancaria diferente (si es posible)
4. Email de soporte nuevo (con el nuevo dominio)
5. Precios ligeramente diferentes
6. Descripciones únicas y originales
7. Keywords y SEO strategy nueva

---

## 📞 DATOS DE CONTACTO A CAMBIAR

### En el código:
```typescript
// Buscar en todos los archivos:
- Email de soporte
- Teléfono de contacto
- Dirección física (si aplica)
- Enlaces a redes sociales
- Nombre de la empresa
```

### En Stripe:
```
- Business name
- Support email
- Support phone
- Business address
- Website URL
- Statement descriptor
```

### En Vercel:
```
- Project name
- Domain
- Git repository (opcional: crear repo nuevo)
```

---

**✅ Si sigues esta guía completa, Stripe no podrá asociar tu nueva web con la anterior.**

**⚠️ IMPORTANTE:** El factor más crítico es usar datos bancarios y de contacto DIFERENTES. Si Stripe cerró tu cuenta por violación de ToS, asegúrate de no repetir el comportamiento que causó el cierre.

