# 🔍 COMANDOS PARA BUSCAR REFERENCIAS A CAMBIAR

## 📋 GUÍA DE COMANDOS DE BÚSQUEDA

Usa estos comandos en tu terminal para encontrar TODAS las referencias que necesitas cambiar.

---

## 🔎 BUSCAR NOMBRE DEL PROYECTO

### 1. Buscar "iqlevel" (insensitive)
```bash
cd /Users/guti/Desktop/CURSOR\ WEBS/IQLEVEL
grep -ri "iqlevel" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 2. Buscar "iqmind" (insensitive)
```bash
grep -ri "iqmind" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 3. Buscar variantes
```bash
grep -ri "iq level" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "iq-level" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

---

## 🌐 BUSCAR URLs Y DOMINIOS

### 1. Buscar dominios antiguos
```bash
grep -r "iqmind.io" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "iqlevel.com" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "vercel.app" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 2. Buscar URLs completas
```bash
grep -r "https://" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | grep -v "stripe\|vercel\|google\|facebook"
```

---

## 📧 BUSCAR EMAILS

### 1. Buscar emails de soporte
```bash
grep -ri "support@" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "contact@" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "info@" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "admin@" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 2. Buscar cualquier email en el código
```bash
grep -rE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

---

## 🎨 BUSCAR COLORES ESPECÍFICOS

### 1. Buscar color principal (#218B8E - turquesa)
```bash
grep -r "#218B8E" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "218b8e" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 2. Buscar referencias a "teal" o "turquoise"
```bash
grep -ri "teal" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "turquoise" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 3. Buscar otros colores hexadecimales
```bash
grep -rE "#[0-9A-Fa-f]{6}" app/ components/ --exclude-dir={node_modules,.next}
```

---

## 📝 BUSCAR TEXTOS CARACTERÍSTICOS

### 1. Buscar frases de marketing
```bash
grep -ri "descubre tu potencial" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "coeficiente intelectual" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "test de iq" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 2. Buscar claims únicos
```bash
grep -ri "resultado certificado" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -ri "análisis detallado" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

---

## 🖼️ BUSCAR REFERENCIAS A IMÁGENES

### 1. Listar todas las imágenes
```bash
find public/images -type f -name "*.png" -o -name "*.jpg" -o -name "*.svg"
```

### 2. Buscar referencias a logos
```bash
grep -r "LOGO" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "logo" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "favicon" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 3. Buscar referencias a imágenes específicas
```bash
grep -r "Favicon.png" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "LOGO2" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

---

## 💰 BUSCAR PRECIOS

### 1. Buscar precio inicial (0.50€)
```bash
grep -r "0.50" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "0,50" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r '"50"' . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 2. Buscar precio de suscripción (19.99€)
```bash
grep -r "19.99" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "19,99" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "1999" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

### 3. Buscar días de trial (2)
```bash
grep -r "trial_days" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r '"2".*días' . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

---

## 📊 BUSCAR ANALYTICS IDs

### 1. Google Analytics
```bash
grep -r "GA_MEASUREMENT_ID" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "G-" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | grep -i "google"
```

### 2. Meta Pixel
```bash
grep -r "META_PIXEL_ID" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
grep -r "fbq" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
```

---

## 🗄️ BUSCAR EN ARCHIVOS ESPECÍFICOS

### 1. Revisar package.json
```bash
cat package.json | grep -i "name\|description\|author"
```

### 2. Revisar archivos de metadata
```bash
grep -n "metadata" app/layout.tsx app/*/layout.tsx
```

### 3. Revisar archivos de idiomas
```bash
for file in messages/*.json; do
  echo "=== $file ==="
  grep -i "iqlevel\|iqmind\|siteName\|brandName" "$file"
done
```

---

## 🔧 BUSCAR EN ARCHIVOS DE CONFIGURACIÓN

### 1. Variables de entorno
```bash
grep -r "NEXT_PUBLIC" . --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir={node_modules,.next}
```

### 2. Archivos de configuración
```bash
cat next.config.js | grep -i "env\|name"
cat tailwind.config.ts | grep -i "color\|theme"
cat tsconfig.json | grep -i "name\|path"
```

---

## 📱 BUSCAR EN COMPONENTES

### 1. Headers y Footers
```bash
grep -rn "header\|footer" components/ --ignore-case
```

### 2. Titles y Headings
```bash
grep -rn "h1\|title" app/ components/ | head -20
```

---

## 🔍 BUSCAR TODO A LA VEZ

### Script completo de búsqueda

Copia este script y guárdalo como `buscar-referencias.sh`:

```bash
#!/bin/bash

echo "🔍 BUSCANDO REFERENCIAS A CAMBIAR..."
echo ""

echo "📌 NOMBRE DEL PROYECTO:"
grep -ri "iqlevel" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | wc -l
grep -ri "iqmind" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | wc -l
echo ""

echo "🌐 DOMINIOS:"
grep -r "iqmind.io" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | wc -l
echo ""

echo "📧 EMAILS:"
grep -rE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | wc -l
echo ""

echo "🎨 COLORES (#218B8E):"
grep -r "#218B8E" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | wc -l
echo ""

echo "💰 PRECIOS:"
echo "  0.50€: $(grep -r '0.50' . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | wc -l)"
echo "  19.99€: $(grep -r '19.99' . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG} | wc -l)"
echo ""

echo "🖼️ IMÁGENES EN /public/images:"
find public/images -type f | wc -l
echo ""

echo "✅ Revisa cada sección para ver los detalles."
```

**Uso:**
```bash
chmod +x buscar-referencias.sh
./buscar-referencias.sh
```

---

## 📊 GENERAR REPORTE COMPLETO

### Script para generar reporte en archivo

```bash
#!/bin/bash

REPORT="reporte-cambios-$(date +%Y%m%d-%H%M%S).txt"

{
  echo "==================================="
  echo "REPORTE DE REFERENCIAS A CAMBIAR"
  echo "Generado: $(date)"
  echo "==================================="
  echo ""
  
  echo "1. NOMBRE DEL PROYECTO (iqlevel/iqmind):"
  grep -ri "iqlevel\|iqmind" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
  echo ""
  
  echo "2. DOMINIOS:"
  grep -r "iqmind.io" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
  echo ""
  
  echo "3. EMAILS:"
  grep -rE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
  echo ""
  
  echo "4. COLOR PRINCIPAL (#218B8E):"
  grep -r "#218B8E" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
  echo ""
  
  echo "5. PRECIOS (0.50 y 19.99):"
  grep -r "0.50\|19.99" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG}
  echo ""
  
  echo "6. IMÁGENES:"
  find public/images -type f
  echo ""
  
} > "$REPORT"

echo "✅ Reporte generado: $REPORT"
```

**Uso:**
```bash
chmod +x generar-reporte.sh
./generar-reporte.sh
```

---

## 🔄 COMANDOS DE REEMPLAZO (CON PRECAUCIÓN)

### ⚠️ IMPORTANTE: Haz backup antes de ejecutar estos comandos

### 1. Reemplazar nombre del proyecto
```bash
# PRIMERO HAZ BACKUP!
cp -r . ../BACKUP-IQLEVEL-$(date +%Y%m%d)

# Luego reemplaza (ejemplo, ajusta según tu nuevo nombre)
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.json" | \
  xargs sed -i '' 's/iqlevel/nuevonombre/g'
```

### 2. Reemplazar color principal
```bash
# Reemplazar #218B8E con #FF6B6B (ejemplo)
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | \
  xargs sed -i '' 's/#218B8E/#FF6B6B/gi'
```

### 3. Reemplazar dominio
```bash
# Reemplazar iqmind.io con nuevo-dominio.com
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.md" | \
  xargs sed -i '' 's/iqmind\.io/nuevo-dominio.com/g'
```

---

## ✅ VERIFICACIÓN FINAL

### Comando para verificar que cambiaste todo:

```bash
#!/bin/bash

echo "🔍 VERIFICANDO CAMBIOS..."
echo ""

COUNT_NAME=$(grep -ri "iqlevel\|iqmind" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG,BACKUP*} 2>/dev/null | wc -l)
COUNT_DOMAIN=$(grep -r "iqmind.io" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG,BACKUP*} 2>/dev/null | wc -l)
COUNT_COLOR=$(grep -r "#218B8E" . --exclude-dir={node_modules,.next,.git,STRIPE_CONFIG,BACKUP*} 2>/dev/null | wc -l)

if [ $COUNT_NAME -eq 0 ] && [ $COUNT_DOMAIN -eq 0 ] && [ $COUNT_COLOR -eq 0 ]; then
  echo "✅ ¡PERFECTO! No se encontraron referencias al proyecto antiguo."
else
  echo "❌ AÚN HAY REFERENCIAS:"
  echo "   - Nombre proyecto: $COUNT_NAME"
  echo "   - Dominio antiguo: $COUNT_DOMAIN"
  echo "   - Color principal: $COUNT_COLOR"
  echo ""
  echo "Revisa los archivos manualmente."
fi
```

---

**💡 TIP:** Ejecuta estos comandos ANTES de empezar a hacer cambios para tener una lista completa de qué modificar.

**⚠️ PRECAUCIÓN:** Los comandos de reemplazo masivo pueden romper el código. Siempre haz backup primero y revisa los cambios antes de hacer commit.

