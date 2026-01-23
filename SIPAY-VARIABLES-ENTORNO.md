# 🔐 Variables de Entorno para Sipay

## Variables Requeridas

Configura estas variables en tu archivo `.env.local` (desarrollo) y en Vercel (producción):

### Backend (Servidor):

```bash
SIPAY_API_KEY=tu_api_key_aqui
SIPAY_API_SECRET=tu_api_secret_aqui
SIPAY_RESOURCE=tu_resource_id_aqui
SIPAY_ENDPOINT=https://sandbox.sipay.es
```

### Frontend (Públicas):

```bash
NEXT_PUBLIC_SIPAY_KEY=tu_api_key_aqui
NEXT_PUBLIC_SIPAY_RESOURCE=tu_resource_id_aqui
NEXT_PUBLIC_SIPAY_ENDPOINT=https://sandbox.sipay.es
```

---

## 🚀 Configurar en Vercel

### Opción 1: CLI

```bash
vercel env add SIPAY_API_KEY production
vercel env add SIPAY_API_SECRET production
vercel env add SIPAY_RESOURCE production
vercel env add SIPAY_ENDPOINT production
vercel env add NEXT_PUBLIC_SIPAY_KEY production
vercel env add NEXT_PUBLIC_SIPAY_RESOURCE production
vercel env add NEXT_PUBLIC_SIPAY_ENDPOINT production
```

### Opción 2: Dashboard

1. https://vercel.com/dashboard
2. Tu proyecto → Settings → Environment Variables
3. Agregar cada variable para Production, Preview, Development

---

## ⚠️ Notas Importantes

1. **Sandbox vs Producción:**
   - Sandbox: `https://sandbox.sipay.es`
   - Producción: `https://api.sipay.es`

2. **Variables Públicas:**
   - Las que empiezan con `NEXT_PUBLIC_` son visibles en el frontend
   - NO pongas secrets en variables públicas

3. **Seguridad:**
   - NUNCA subas `.env.local` a Git
   - Usa `.gitignore` para excluir archivos de entorno

---

## 📋 Template Completo (.env.local)

```bash
# Sipay (Backend)
SIPAY_API_KEY=
SIPAY_API_SECRET=
SIPAY_RESOURCE=
SIPAY_ENDPOINT=https://sandbox.sipay.es

# Sipay (Frontend)
NEXT_PUBLIC_SIPAY_KEY=
NEXT_PUBLIC_SIPAY_RESOURCE=
NEXT_PUBLIC_SIPAY_ENDPOINT=https://sandbox.sipay.es

# Database
DATABASE_URL=
POSTGRES_URL=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@mindmetric.io

# App
NEXT_PUBLIC_APP_URL=https://mindmetric.io
NEXT_PUBLIC_API_URL=https://mindmetric.io/api
SESSION_SECRET=
```

