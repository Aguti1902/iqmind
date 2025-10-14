# Guía de Instalación Paso a Paso - IQLevel

Esta guía te llevará a través de todo el proceso de instalación y configuración del proyecto IQLevel.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Local](#instalación-local)
3. [Configuración de Paddle](#configuración-de-paddle)
4. [Configuración de Analytics](#configuración-de-analytics)
5. [Primera Ejecución](#primera-ejecución)
6. [Verificación](#verificación)
7. [Solución de Problemas](#solución-de-problemas)

## 🔧 Requisitos Previos

### Software Necesario

1. **Node.js** (versión 18.0.0 o superior)
   - Descarga: https://nodejs.org/
   - Verifica la instalación: `node --version`

2. **npm** (incluido con Node.js)
   - Verifica la instalación: `npm --version`

3. **Git** (opcional, para control de versiones)
   - Descarga: https://git-scm.com/

### Cuentas Necesarias

1. **Paddle** (Procesador de Pagos)
   - Registro: https://www.paddle.com/
   - Tipo: Cuenta de Comerciante
   - Tiempo de aprobación: 1-3 días hábiles

2. **Google Analytics** (Opcional)
   - Registro: https://analytics.google.com/
   - Gratuito

3. **Meta Business** (Opcional, para Meta Pixel)
   - Registro: https://business.facebook.com/
   - Gratuito

## 💻 Instalación Local

### Paso 1: Preparar el Proyecto

El proyecto ya está creado en:
```bash
/Users/guti/Desktop/CURSOR WEBS/IQLEVEL
```

Abre una terminal y navega a este directorio:
```bash
cd "/Users/guti/Desktop/CURSOR WEBS/IQLEVEL"
```

### Paso 2: Instalar Dependencias

Ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```bash
npm install
```

Esto instalará:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts (para gráficos)
- React Icons
- Paddle SDK

**Tiempo estimado:** 2-5 minutos (dependiendo de tu conexión)

### Paso 3: Configurar Variables de Entorno

1. Crea un archivo llamado `.env.local` en la raíz del proyecto:

```bash
touch .env.local
```

2. Abre `.env.local` con tu editor favorito y añade:

```env
# PADDLE CONFIGURATION
# Mientras configuras Paddle, usa 'sandbox' para pruebas
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PADDLE_INITIAL_PRODUCT_ID=pri_xxxxxxxxxx
NEXT_PUBLIC_PADDLE_SUBSCRIPTION_PRODUCT_ID=pri_xxxxxxxxxx

# GOOGLE ANALYTICS (Opcional)
# Deja vacío si no lo vas a usar aún
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# META PIXEL (Opcional)
# Deja vacío si no lo vas a usar aún
NEXT_PUBLIC_META_PIXEL_ID=

# API CONFIGURATION
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Nota:** Por ahora, puedes dejar los IDs de Paddle y Analytics vacíos. El sitio funcionará en modo demo.

## 🏦 Configuración de Paddle

### Modo Sandbox (Pruebas)

1. **Inicia sesión en Paddle**
   - Ve a https://sandbox-vendors.paddle.com/

2. **Obtén tu Client Token**
   - Ve a Developer Tools → Authentication
   - Copia el "Client-side token"
   - Pégalo en `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`

3. **Crear Producto Inicial (0,50€)**
   - Ve a Catalog → Products → Add Product
   - Nombre: "Resultado Test IQ"
   - Precio: 0,50€
   - Tipo: One-time payment
   - Copia el Price ID y pégalo en `NEXT_PUBLIC_PADDLE_INITIAL_PRODUCT_ID`

4. **Crear Suscripción Premium (19,99€/mes)**
   - Ve a Catalog → Products → Add Product
   - Nombre: "IQLevel Premium"
   - Precio: 19,99€
   - Tipo: Subscription (Monthly)
   - Trial: 2 days
   - Copia el Price ID y pégalo en `NEXT_PUBLIC_PADDLE_SUBSCRIPTION_PRODUCT_ID`

5. **Configurar Webhook (Importante)**
   - Ve a Developer Tools → Notifications
   - Add Endpoint
   - URL: `http://localhost:3000/api/subscribe` (para desarrollo)
   - Events: Selecciona todos los de subscription y transaction
   - Guarda

### Modo Producción

Cuando estés listo para producción:

1. Cambia `NEXT_PUBLIC_PADDLE_ENVIRONMENT=production`
2. Usa los tokens y product IDs de producción
3. Actualiza la URL del webhook a tu dominio real

## 📊 Configuración de Analytics

### Google Analytics

1. **Crear Propiedad**
   - Ve a https://analytics.google.com/
   - Admin → Create Property
   - Nombre: "IQLevel"
   - Selecciona tu zona horaria

2. **Obtener Measurement ID**
   - En la configuración de la propiedad
   - Data Streams → Add Stream → Web
   - Copia el Measurement ID (formato: G-XXXXXXXXXX)
   - Pégalo en `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Meta Pixel

1. **Crear Pixel**
   - Ve a https://business.facebook.com/
   - Business Settings → Data Sources → Pixels
   - Add → Create a Pixel
   - Nombre: "IQLevel"

2. **Obtener Pixel ID**
   - Copia el Pixel ID (número de 15-16 dígitos)
   - Pégalo en `NEXT_PUBLIC_META_PIXEL_ID`

## 🚀 Primera Ejecución

### Iniciar el Servidor de Desarrollo

1. En la terminal, ejecuta:

```bash
npm run dev
```

2. Deberías ver un mensaje similar a:
```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
○ Network:      http://192.168.1.x:3000
```

3. Abre tu navegador y ve a: **http://localhost:3000**

### ¡Deberías Ver la Landing Page!

Si todo está bien, verás la página principal de IQLevel con:
- Header con logo y navegación
- Hero section con CTA "Comenzar Test"
- Sección "Cómo funciona"
- Características
- Testimonios
- Footer

## ✅ Verificación

### Checklist de Funcionalidad

Prueba cada una de estas funciones:

- [ ] **Landing Page carga correctamente**
  - Ve a http://localhost:3000

- [ ] **Navegación funciona**
  - Haz clic en "Comenzar Test" → debería ir a /test
  - Haz clic en "Cómo funciona" → scroll suave a la sección

- [ ] **Test funciona**
  - Completa las 20 preguntas
  - Verifica que la barra de progreso avanza
  - Verifica que puedes ir atrás y adelante

- [ ] **Resultado Estimado**
  - Después de completar el test, deberías ver tu CI estimado (borroso)
  - Mensaje para pagar 0,50€

- [ ] **Checkout (en modo demo)**
  - Si Paddle no está configurado, verás un mensaje de simulación
  - Si Paddle está configurado, verás el checkout real en sandbox

- [ ] **Página de Resultados**
  - Después del "pago", deberías ver tu resultado completo
  - Gráficos cargados correctamente
  - Botones de compartir funcionan

- [ ] **Páginas Legales**
  - /terminos → Carga correctamente
  - /privacidad → Carga correctamente
  - /reembolso → Carga correctamente
  - /contacto → Formulario funcional

- [ ] **Responsive Design**
  - Abre en Chrome DevTools
  - Prueba en vista móvil (iPhone, iPad)
  - Todo debería verse bien

## 🐛 Solución de Problemas

### Error: "Module not found"

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Usar otro puerto
npm run dev -- -p 3001
```

O mata el proceso que usa el puerto 3000:
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Paddle no funciona

**Solución:**
1. Verifica que `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` esté correcto
2. Asegúrate de estar en modo `sandbox` si usas credenciales de sandbox
3. Revisa la consola del navegador para errores
4. Si todo falla, el sitio funcionará en modo simulación (para desarrollo)

### Analytics no aparece

**Solución:**
1. Verifica que los IDs estén correctos en `.env.local`
2. Reinicia el servidor: Ctrl+C y luego `npm run dev`
3. Puede tardar 24-48 horas en aparecer datos en Google Analytics

### Estilos no cargan

**Solución:**
```bash
npm run dev
# O si persiste:
rm -rf .next
npm run dev
```

### Error de TypeScript

**Solución:**
```bash
npm run lint
# Verifica los errores reportados
```

## 🔄 Próximos Pasos

Una vez que todo funciona localmente:

1. **Personalizar Contenido**
   - Edita textos en las páginas
   - Cambia colores en `tailwind.config.ts`
   - Ajusta preguntas en `lib/questions.ts`

2. **Configurar Base de Datos** (para producción)
   - MongoDB Atlas (recomendado)
   - PostgreSQL
   - Supabase

3. **Configurar Email**
   - SendGrid
   - Mailgun
   - Resend

4. **Desplegar**
   - Vercel (más fácil)
   - Netlify
   - Tu propio servidor

## 📞 Ayuda Adicional

Si tienes problemas:

1. Revisa el README.md principal
2. Verifica la consola del navegador (F12)
3. Verifica la terminal donde corre `npm run dev`
4. Contacta: soporte@iqlevel.io

---

**¡Felicidades! Ya tienes IQLevel funcionando localmente.** 🎉

