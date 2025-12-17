#!/bin/bash

# Script para actualizar variables de entorno en Vercel
# Necesitas tener instalado Vercel CLI: npm i -g vercel

echo "🔄 Actualizando variables de entorno en Vercel..."
echo ""

POSTGRES_URL="postgresql://postgres:ceBbFkVimnxRTPQAYtxNgYBGXWUVquxT@switchback.proxy.rlwy.net:58127/railway"

echo "📝 URL de la base de datos:"
echo "$POSTGRES_URL"
echo ""

echo "⚠️  INSTRUCCIONES MANUALES:"
echo ""
echo "1. Ve a: https://vercel.com/"
echo "2. Selecciona tu proyecto 'mindmetric' o 'iqlevel'"
echo "3. Ve a: Settings → Environment Variables"
echo "4. Busca 'POSTGRES_URL' y haz clic en 'Edit'"
echo "5. Pega esta URL:"
echo ""
echo "   $POSTGRES_URL"
echo ""
echo "6. Asegúrate de que esté en: Production, Preview, Development"
echo "7. Repite para 'DATABASE_URL' (misma URL)"
echo "8. Guarda los cambios"
echo "9. Ve a: Deployments"
echo "10. Haz clic en 'Redeploy' en el último deployment"
echo ""
echo "O usa Vercel CLI (si está instalado):"
echo ""
echo "  vercel env add POSTGRES_URL production"
echo "  # Pega la URL cuando te la pida"
echo ""
echo "  vercel env add DATABASE_URL production"
echo "  # Pega la URL cuando te la pida"
echo ""
echo "  vercel --prod"
echo ""

