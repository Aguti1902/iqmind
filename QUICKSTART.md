# ⚡ Quick Start - MindMetric

Guía ultra rápida para poner en marcha MindMetric en 5 minutos.

## 🚀 Inicio Rápido (Sin Configuración)

```bash
# 1. Navegar al proyecto
cd "/Users/guti/Desktop/CURSOR WEBS/IQLEVEL"

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:3000
```

**¡Listo!** El sitio funciona en modo demo (sin pagos reales).

## 📝 Configuración Mínima (Con Paddle)

```bash
# 1. Crear archivo de configuración
cp .env.example .env.local

# 2. Editar .env.local
# Añade tu token de Paddle:
# NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxx
# NEXT_PUBLIC_PADDLE_INITIAL_PRODUCT_ID=pri_xxxxx
# NEXT_PUBLIC_PADDLE_SUBSCRIPTION_PRODUCT_ID=pri_xxxxx

# 3. Reiniciar servidor
npm run dev
```

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Iniciar en desarrollo (con hot reload)
npm run dev

# Iniciar en otro puerto
npm run dev -- -p 3001

# Limpiar cache y reiniciar
rm -rf .next
npm run dev
```

### Build y Producción
```bash
# Crear build de producción
npm run build

# Ejecutar build de producción localmente
npm run start

# Verificar errores de TypeScript
npm run lint
```

### Mantenimiento
```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Arreglar vulnerabilidades
npm audit fix

# Limpiar todo y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🔍 Estructura de Navegación

```
http://localhost:3000/          → Landing page
http://localhost:3000/test      → Test de CI
http://localhost:3000/resultado-estimado  → Pre-pago
http://localhost:3000/checkout  → Página de pago
http://localhost:3000/resultado → Resultados completos
http://localhost:3000/cuenta    → Panel de usuario
http://localhost:3000/terminos  → Términos legales
http://localhost:3000/privacidad → Política privacidad
http://localhost:3000/reembolso → Política reembolso
http://localhost:3000/contacto  → Formulario contacto
```

## ⚙️ Archivos Clave para Editar

### Contenido
```
app/page.tsx              → Landing page
app/test/page.tsx         → Página del test
lib/questions.ts          → Preguntas y algoritmo CI
```

### Estilos
```
app/globals.css           → Estilos globales
tailwind.config.ts        → Configuración colores/tema
```

### Configuración
```
.env.local                → Variables de entorno
next.config.js            → Configuración Next.js
package.json              → Dependencias
```

### Componentes
```
components/Header.tsx     → Cabecera
components/Footer.tsx     → Pie de página
components/Analytics.tsx  → Scripts analytics
```

## 🎨 Personalización Rápida

### Cambiar Colores
Edita `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    600: '#TU_COLOR',  // Color principal
  }
}
```

### Cambiar Textos de la Landing
Edita `app/page.tsx`:
```typescript
<h1>Tu título aquí</h1>
<p>Tu descripción aquí</p>
```

### Ajustar Preguntas del Test
Edita `lib/questions.ts`:
```typescript
export const questions: Question[] = [
  {
    id: 1,
    question: 'Tu pregunta aquí',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 0  // índice de respuesta correcta
  }
]
```

### Cambiar Precios
Edita los textos en:
- `app/resultado-estimado/page.tsx`
- `app/checkout/page.tsx`
- `app/terminos/page.tsx`

## 🐛 Solución Rápida de Problemas

### Error: Puerto en uso
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
# O usar otro puerto
npm run dev -- -p 3001
```

### Error: Módulos no encontrados
```bash
rm -rf node_modules package-lock.json
npm install
```

### Paddle no funciona
1. Verifica `.env.local` existe
2. Verifica tokens correctos
3. Reinicia servidor: Ctrl+C → `npm run dev`
4. Revisa consola del navegador (F12)

### Estilos no aparecen
```bash
rm -rf .next
npm run dev
```

## 📦 Despliegue Rápido en Vercel

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy a producción
vercel --prod
```

## 🧪 Testing Rápido

### Probar flujo completo:
1. ✅ Ir a `/` → Ver landing
2. ✅ Click "Comenzar Test"
3. ✅ Responder 20 preguntas
4. ✅ Ver resultado estimado
5. ✅ Ir a checkout
6. ✅ Simular pago (sin Paddle configurado)
7. ✅ Ver resultado completo

### Resetear test:
Abre consola del navegador (F12) y ejecuta:
```javascript
localStorage.clear()
location.reload()
```

## 📊 Variables de Entorno - Cheatsheet

```env
# Mínimo para funcionar (modo demo):
# (nada, funciona sin variables)

# Con Paddle (pagos reales):
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxx
NEXT_PUBLIC_PADDLE_INITIAL_PRODUCT_ID=pri_xxxxx
NEXT_PUBLIC_PADDLE_SUBSCRIPTION_PRODUCT_ID=pri_xxxxx

# Con Analytics (opcional):
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

## 🎯 Checklist de Lanzamiento

### Pre-Lanzamiento
- [ ] Test funciona completamente
- [ ] Paddle configurado y probado
- [ ] Textos legales revisados
- [ ] Analytics configurados
- [ ] Diseño responsive verificado
- [ ] Dominio registrado

### Lanzamiento
- [ ] Desplegado en Vercel/Netlify
- [ ] DNS configurado
- [ ] SSL activo (HTTPS)
- [ ] Variables de producción configuradas
- [ ] Paddle en modo production
- [ ] Primera venta de prueba exitosa

### Post-Lanzamiento
- [ ] Monitorear analytics diariamente
- [ ] Revisar errores en logs
- [ ] Responder feedback de usuarios
- [ ] Optimizar según datos
- [ ] Promocionar en redes sociales

## 📚 Recursos

### Documentación
- `README.md` → Documentación completa
- `INSTALL.md` → Instalación detallada
- `DEPLOYMENT.md` → Guía de despliegue
- `RESUMEN.md` → Visión general del proyecto

### Enlaces
- Next.js: https://nextjs.org/docs
- Paddle: https://developer.paddle.com/
- Vercel: https://vercel.com
- Tailwind: https://tailwindcss.com

## 💡 Tips Rápidos

1. **Prueba en modo demo primero** (sin configurar nada)
2. **Configura Paddle en sandbox** antes de producción
3. **Usa Vercel para deployment** (más fácil)
4. **Monitorea analytics desde día 1**
5. **Haz backups regulares** de tu código
6. **Lee los comentarios en el código** para entender cómo funciona

## 🆘 ¿Atascado?

1. Revisa la consola del navegador (F12)
2. Revisa la terminal donde corre `npm run dev`
3. Lee el archivo correspondiente en la documentación
4. Busca el error en Google
5. Revisa logs de Vercel (si está desplegado)

## 🎉 ¡Éxito!

Si llegaste hasta aquí y todo funciona:
1. ✅ Personaliza el contenido
2. ✅ Configura Paddle
3. ✅ Despliega en Vercel
4. ✅ ¡Empieza a generar ingresos!

---

**Tiempo total para estar online: 1-2 horas** ⚡

