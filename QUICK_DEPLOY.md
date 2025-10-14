# ⚡ Quick Deploy - IQmind

Guía rápida para desplegar IQmind en producción.

## 🚀 Pasos Rápidos

### 1️⃣ Subir a GitHub (5 minutos)

```bash
# Opción A: Usar el script helper
./deploy.sh
# Selecciona opción 1

# Opción B: Manual
git remote add origin https://github.com/TU_USUARIO/iqmind.git
git branch -M main
git push -u origin main
```

### 2️⃣ Crear Base de Datos en Railway (5 minutos)

1. Ve a [railway.app](https://railway.app)
2. Login con GitHub
3. New Project → Add PostgreSQL
4. Copia el `DATABASE_URL`
5. Ve a Query tab y ejecuta el SQL de `DATABASE_SETUP.md`

### 3️⃣ Desplegar en Vercel (5 minutos)

1. Ve a [vercel.com](https://vercel.com)
2. Login con GitHub
3. New Project → Import `iqmind`
4. Add Environment Variables:
   ```
   DATABASE_URL=tu_railway_url
   NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
   ```
5. Deploy!

### 4️⃣ Configurar Stripe (10 minutos)

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Crea producto: €19.99/mes
3. Copia Price ID
4. Webhook → Add endpoint:
   - URL: `https://tu-app.vercel.app/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`
5. Copia Webhook Secret

### 5️⃣ Actualizar Vercel con Stripe (5 minutos)

1. Ve a Vercel → Project Settings → Environment Variables
2. Agrega:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_PRICE_ID=price_xxx
   ```
3. Redeploy

## ✅ Verificación

### Test 1: Homepage
```
https://tu-app.vercel.app
```

### Test 2: Test Flow
1. Click "Start Test"
2. Completa el test
3. Usa tarjeta de prueba: `4242 4242 4242 4242`
4. Verifica resultados

### Test 3: Base de Datos
1. Ve a Railway → PostgreSQL → Query
2. Ejecuta: `SELECT * FROM users;`
3. Deberías ver el nuevo usuario

## 🔗 Enlaces Importantes

- **GitHub**: https://github.com/TU_USUARIO/iqmind
- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app/dashboard
- **Stripe**: https://dashboard.stripe.com

## 📋 Checklist

- [ ] Código en GitHub
- [ ] Base de datos en Railway
- [ ] App desplegada en Vercel
- [ ] Variables de entorno configuradas
- [ ] Stripe configurado
- [ ] Webhook funcionando
- [ ] Test de pago exitoso
- [ ] Base de datos guardando datos

## 🆘 Problemas Comunes

### Error: "Module not found"
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Error: "Database connection failed"
- Verifica `DATABASE_URL` en Vercel
- Asegúrate que Railway DB está running
- Verifica que las tablas existen

### Error: "Stripe webhook failed"
- Verifica URL del webhook en Stripe
- Verifica `STRIPE_WEBHOOK_SECRET` en Vercel
- Revisa logs en Vercel

## 📞 Ayuda

- **Guía completa**: Ver `DEPLOYMENT.md`
- **Setup DB**: Ver `DATABASE_SETUP.md`
- **Setup Stripe**: Ver `STRIPE_SETUP.md`
- **Soporte**: support@iqmind.io

## 🎉 ¡Listo!

Tu app está en producción. Ahora puedes:
- Compartir el link
- Configurar dominio personalizado
- Monitorear analytics
- Escalar según necesites

