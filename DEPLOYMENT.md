# Guía de Despliegue - IQLevel

Esta guía te ayudará a desplegar IQLevel en producción.

## 📋 Checklist Pre-Despliegue

Antes de desplegar, asegúrate de:

- [ ] El sitio funciona correctamente en local
- [ ] Has probado el flujo completo del test
- [ ] Paddle está configurado en modo sandbox y funcionando
- [ ] Has personalizado todos los textos legales
- [ ] Has cambiado logos y marca (si aplica)
- [ ] Has configurado Google Analytics (opcional)
- [ ] Has configurado Meta Pixel (opcional)
- [ ] Tienes un dominio registrado

## 🚀 Opción 1: Vercel (Recomendado)

Vercel es la opción más fácil y está optimizado para Next.js.

### Paso 1: Preparar el Proyecto

1. **Inicializar Git** (si no lo has hecho)
   ```bash
   cd "/Users/guti/Desktop/CURSOR WEBS/IQLEVEL"
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Subir a GitHub** (recomendado)
   - Crea un repositorio en https://github.com/new
   - Sigue las instrucciones para subir tu código

### Paso 2: Desplegar en Vercel

1. **Crear cuenta en Vercel**
   - Ve a https://vercel.com/signup
   - Regístrate con tu cuenta de GitHub

2. **Importar Proyecto**
   - Haz clic en "Add New" → "Project"
   - Selecciona tu repositorio de GitHub
   - Framework Preset: Next.js (detectado automáticamente)

3. **Configurar Variables de Entorno**
   
   En la pantalla de configuración, añade todas tus variables de entorno:
   
   ```
   NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=tu_token_de_produccion
   NEXT_PUBLIC_PADDLE_INITIAL_PRODUCT_ID=pri_xxxxx
   NEXT_PUBLIC_PADDLE_SUBSCRIPTION_PRODUCT_ID=pri_xxxxx
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_META_PIXEL_ID=123456789012345
   NEXT_PUBLIC_API_URL=https://tu-dominio.vercel.app/api
   ```

4. **Deploy**
   - Haz clic en "Deploy"
   - Espera 2-3 minutos
   - ¡Tu sitio estará en vivo!

### Paso 3: Configurar Dominio Personalizado

1. En Vercel, ve a tu proyecto → Settings → Domains
2. Añade tu dominio (ej: iqlevel.io)
3. Sigue las instrucciones para configurar DNS:
   - Tipo A: 76.76.21.21
   - CNAME: cname.vercel-dns.com

### Paso 4: Actualizar Paddle

1. Ve a Paddle Production Dashboard
2. Developer Tools → Notifications → Webhooks
3. Actualiza la URL a: `https://tu-dominio.com/api/subscribe`

## 🌐 Opción 2: Netlify

### Paso 1: Preparar el Build

1. Añade estos scripts a `package.json` (ya están):
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start"
     }
   }
   ```

### Paso 2: Desplegar

1. **Crear cuenta en Netlify**
   - Ve a https://www.netlify.com/
   - Regístrate con GitHub

2. **Importar Proyecto**
   - New site from Git → GitHub
   - Selecciona tu repositorio
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Configurar Variables de Entorno**
   - Site settings → Build & deploy → Environment
   - Añade todas las variables como en Vercel

4. **Deploy**
   - Deploy site
   - Tu sitio estará en: https://tu-sitio.netlify.app

## ☁️ Opción 3: DigitalOcean App Platform

### Requisitos
- Cuenta en DigitalOcean
- Repositorio en GitHub

### Pasos

1. **Crear App**
   - Ve a https://cloud.digitalocean.com/apps
   - Create App → GitHub
   - Selecciona tu repositorio

2. **Configurar**
   - Name: iqlevel
   - Branch: main
   - Build Command: `npm run build`
   - Run Command: `npm run start`

3. **Variables de Entorno**
   - Añade todas las variables necesarias

4. **Deploy**
   - Haz clic en "Create Resources"
   - Tiempo estimado: 5-10 minutos

## 🐳 Opción 4: Docker (Servidor Propio)

### Crear Dockerfile

Crea un archivo `Dockerfile` en la raíz:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Crear .dockerignore

```
node_modules
.next
.git
.env.local
README.md
```

### Construir y Ejecutar

```bash
# Construir imagen
docker build -t iqlevel .

# Ejecutar
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_PADDLE_ENVIRONMENT=production \
  -e NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=tu_token \
  # ... más variables
  iqlevel
```

## 🔒 Configuración SSL/HTTPS

### Vercel/Netlify
- SSL automático incluido ✅

### Servidor Propio
1. Usa Caddy (automático):
   ```
   https://tu-dominio.com {
     reverse_proxy localhost:3000
   }
   ```

2. O usa Nginx + Certbot:
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```

## 📊 Configuración Post-Despliegue

### 1. Verificar Paddle

1. Cambia a modo production en `.env`:
   ```
   NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
   ```

2. Actualiza webhook URL en Paddle:
   ```
   https://tu-dominio.com/api/subscribe
   ```

3. Prueba con una transacción real (usa tu propia tarjeta)

### 2. Configurar Analytics

**Google Analytics:**
1. Verifica que el tracking code aparece en el HTML
2. Envía un evento de prueba
3. Espera 24-48h para ver datos

**Meta Pixel:**
1. Usa Facebook Pixel Helper (extensión de Chrome)
2. Verifica que los eventos se envían
3. Revisa en Events Manager

### 3. SEO Básico

1. **Crear sitemap.xml**
   
   Crea `app/sitemap.ts`:
   ```typescript
   import { MetadataRoute } from 'next'
   
   export default function sitemap(): MetadataRoute.Sitemap {
     return [
       {
         url: 'https://tu-dominio.com',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 1,
       },
       {
         url: 'https://tu-dominio.com/test',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.9,
       },
       // ... más URLs
     ]
   }
   ```

2. **Crear robots.txt**
   
   Crea `app/robots.ts`:
   ```typescript
   import { MetadataRoute } from 'next'
   
   export default function robots(): MetadataRoute.Robots {
     return {
       rules: {
         userAgent: '*',
         allow: '/',
         disallow: ['/cuenta/', '/api/'],
       },
       sitemap: 'https://tu-dominio.com/sitemap.xml',
     }
   }
   ```

3. **Optimizar meta tags**
   - Ya están configurados en `app/layout.tsx`
   - Personaliza según tu marca

### 4. Monitoreo

**Opciones:**

1. **Vercel Analytics** (si usas Vercel)
   - Automático, solo actívalo en settings

2. **Sentry** (errores)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

3. **LogRocket** (sesiones de usuario)
   - Opcional, para ver cómo interactúan los usuarios

## 🧪 Testing en Producción

### Checklist Post-Despliegue

- [ ] Landing page carga correctamente
- [ ] Test funciona de principio a fin
- [ ] Pago con Paddle funciona (prueba real)
- [ ] Email de confirmación llega
- [ ] Resultado se muestra correctamente
- [ ] Gráficos cargan
- [ ] Botones de compartir funcionan
- [ ] Páginas legales cargan
- [ ] Formulario de contacto funciona
- [ ] Responsive en móvil (Chrome DevTools)
- [ ] Velocidad aceptable (PageSpeed Insights)
- [ ] SSL activo (candado verde en navegador)

### Herramientas de Testing

1. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Objetivo: >90 en móvil y desktop

2. **GTmetrix**
   - https://gtmetrix.com/
   - Analiza velocidad de carga

3. **SSL Labs**
   - https://www.ssllabs.com/ssltest/
   - Verifica configuración SSL

## 🔧 Mantenimiento

### Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar seguridad
npm audit

# Arreglar vulnerabilidades
npm audit fix
```

### Backups

1. **Código**: Git + GitHub (ya tienes)
2. **Base de datos**: 
   - MongoDB Atlas: backups automáticos
   - PostgreSQL: `pg_dump` diario
3. **Configuración**: 
   - Exporta variables de entorno de Vercel

### Monitoreo Continuo

1. **Uptime**
   - UptimeRobot (gratuito)
   - Pingdom

2. **Errores**
   - Revisa logs en Vercel/Netlify
   - Configura Sentry para alertas

3. **Analytics**
   - Revisa Google Analytics semanalmente
   - Analiza tasa de conversión

## 📈 Optimizaciones Avanzadas

### CDN
- Vercel/Netlify incluyen CDN automático ✅

### Caché
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/images/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### Compresión de Imágenes
- Usa Next.js Image component (ya implementado)
- Comprime assets con TinyPNG

## 🆘 Solución de Problemas en Producción

### Build falla

**Error común**: Missing dependencies
```bash
# Solución: Verificar package.json
npm install
npm run build
```

### Paddle no funciona

1. Verifica el environment: `production`
2. Verifica el client token (debe ser de production)
3. Revisa la consola del navegador
4. Verifica webhook URL en Paddle

### Analytics no registra

1. Espera 24-48 horas
2. Verifica el ID en el código fuente
3. Usa extensiones de Chrome para verificar

### Sitio lento

1. Ejecuta PageSpeed Insights
2. Optimiza imágenes
3. Activa cache
4. Usa CDN (Vercel/Netlify lo incluyen)

## 📞 Soporte

Si tienes problemas:

1. Revisa logs de tu plataforma
2. Busca el error en Google
3. Revisa documentación de Next.js
4. Contacta soporte de tu hosting

---

**¡Felicidades! Tu sitio está en producción.** 🎉

Recuerda:
- Monitorea regularmente
- Mantén actualizadas las dependencias
- Haz backups periódicos
- Escucha feedback de usuarios

