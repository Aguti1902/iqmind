# 🔐 Variables de Entorno para Prime Payments

## Variables requeridas

Añade estas variables a tu archivo `.env.local` (desarrollo) y a Vercel (producción):

```bash
# Prime Payments Configuration
PRIME_PAYMENTS_SECRET_1=uRhEsH1uxa
PRIME_PAYMENTS_SECRET_2=EaJsSwmMCD
PRIME_PAYMENTS_API_KEY=fGwRDfKAKzwB
PRIME_PAYMENTS_PROJECT_NAME=Mindmetric
```

## Configurar en Vercel

### Opción 1: Desde la línea de comandos

```bash
# Instalar Vercel CLI si no lo tienes
npm install -g vercel

# Login
vercel login

# Añadir variables (ejecuta cada comando)
vercel env add PRIME_PAYMENTS_SECRET_1 production
# Cuando te lo pida, pega: uRhEsH1uxa

vercel env add PRIME_PAYMENTS_SECRET_2 production
# Cuando te lo pida, pega: EaJsSwmMCD

vercel env add PRIME_PAYMENTS_API_KEY production
# Cuando te lo pida, pega: fGwRDfKAKzwB

vercel env add PRIME_PAYMENTS_PROJECT_NAME production
# Cuando te lo pida, pega: Mindmetric
```

### Opción 2: Desde el Dashboard de Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto "IQLEVEL" o "mindmetric"
3. Ve a **Settings** → **Environment Variables**
4. Añade cada variable una por una:

| Name | Value | Environment |
|------|-------|-------------|
| `PRIME_PAYMENTS_SECRET_1` | `uRhEsH1uxa` | Production, Preview, Development |
| `PRIME_PAYMENTS_SECRET_2` | `EaJsSwmMCD` | Production, Preview, Development |
| `PRIME_PAYMENTS_API_KEY` | `fGwRDfKAKzwB` | Production, Preview, Development |
| `PRIME_PAYMENTS_PROJECT_NAME` | `Mindmetric` | Production, Preview, Development |

5. Haz clic en **Save** para cada una
6. **IMPORTANTE:** Después de añadir las variables, haz un nuevo deployment para que surtan efecto

### Opción 3: Script automatizado

Crea un archivo `update-prime-payments-env.sh`:

```bash
#!/bin/bash

echo "Configurando variables de Prime Payments en Vercel..."

vercel env add PRIME_PAYMENTS_SECRET_1 production <<EOF
uRhEsH1uxa
EOF

vercel env add PRIME_PAYMENTS_SECRET_2 production <<EOF
EaJsSwmMCD
EOF

vercel env add PRIME_PAYMENTS_API_KEY production <<EOF
fGwRDfKAKzwB
EOF

vercel env add PRIME_PAYMENTS_PROJECT_NAME production <<EOF
Mindmetric
EOF

echo "✅ Variables configuradas correctamente"
echo "⚠️ Recuerda hacer un nuevo deployment para aplicar los cambios"
```

Dale permisos de ejecución y ejecútalo:

```bash
chmod +x update-prime-payments-env.sh
./update-prime-payments-env.sh
```

## Verificar que las variables estén configuradas

```bash
vercel env ls
```

Deberías ver las 4 variables de Prime Payments listadas.

## Desarrollo local

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
PRIME_PAYMENTS_SECRET_1=uRhEsH1uxa
PRIME_PAYMENTS_SECRET_2=EaJsSwmMCD
PRIME_PAYMENTS_API_KEY=fGwRDfKAKzwB
PRIME_PAYMENTS_PROJECT_NAME=Mindmetric
```

⚠️ **IMPORTANTE:** Nunca subas `.env.local` a Git. Este archivo ya está en `.gitignore`.

## Aplicar cambios

Después de configurar las variables en Vercel:

```bash
# Hacer un nuevo deployment
vercel --prod

# O si usas Git
git push
```

El deployment automático aplicará las nuevas variables de entorno.

## Verificar que funciona

Después del deployment, verifica que el webhook funcione:

```bash
curl -X POST https://mindmetric.io/api/prime-payments-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Si las variables están correctamente configuradas, deberías recibir un error de firma inválida (esperado), pero no un error de variable no definida.

## Troubleshooting

### Error: "PRIME_PAYMENTS_SECRET_1 is not defined"

**Solución:** Las variables no están configuradas en Vercel o el deployment no se ha actualizado.

1. Verifica en Vercel Dashboard → Settings → Environment Variables
2. Asegúrate de que las variables estén en "Production"
3. Haz un nuevo deployment: `vercel --prod`

### Error: "Invalid signature"

**Solución:** Esto es normal si haces una prueba manual. Prime Payments debe enviar un header con la firma.

### Las variables están configuradas pero no funcionan

**Solución:** Espera unos minutos después de configurar las variables y haz un nuevo deployment completo:

```bash
vercel --prod --force
```

---

**Última actualización:** Enero 2026

