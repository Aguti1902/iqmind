#!/bin/bash

# 🚀 Push to GitHub - MindMetric
# Script interactivo para subir código a GitHub

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 Push to GitHub - MindMetric          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if in git repo
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ No estás en un repositorio Git${NC}"
    exit 1
fi

# Check if remote exists
if ! git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}⚠️  No hay remote 'origin' configurado${NC}"
    echo ""
    read -p "¿Agregar remote? (y/n): " add_remote
    
    if [ "$add_remote" = "y" ]; then
        git remote add origin https://github.com/Aguti1902/mindmetric.git
        echo -e "${GREEN}✅ Remote agregado${NC}"
    else
        echo -e "${RED}❌ No se puede continuar sin remote${NC}"
        exit 1
    fi
fi

# Show current status
echo ""
echo -e "${BLUE}📊 Estado actual:${NC}"
git status -s
echo ""

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ No hay cambios pendientes${NC}"
else
    echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
    echo ""
    read -p "¿Hacer commit? (y/n): " do_commit
    
    if [ "$do_commit" = "y" ]; then
        read -p "Mensaje del commit: " commit_msg
        
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Cambios commiteados${NC}"
    fi
fi

# Show last commit
echo ""
echo -e "${BLUE}📝 Último commit:${NC}"
git log -1 --oneline
echo ""

# Push to GitHub
echo -e "${BLUE}🚀 Subiendo a GitHub...${NC}"
echo ""
echo -e "${YELLOW}ℹ️  Si te pide credenciales:${NC}"
echo -e "   Username: ${GREEN}Aguti1902${NC}"
echo -e "   Password: ${GREEN}[Tu Personal Access Token]${NC}"
echo ""
echo -e "${YELLOW}💡 ¿No tienes token?${NC}"
echo -e "   1. Ve a: https://github.com/settings/tokens"
echo -e "   2. Generate new token (classic)"
echo -e "   3. Selecciona scope: 'repo'"
echo -e "   4. Copia el token y úsalo como password"
echo ""
read -p "Presiona Enter para continuar..."

# Try to push
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ ¡Código subido exitosamente!      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}🔗 Ver en GitHub:${NC}"
    echo -e "   https://github.com/Aguti1902/mindmetric"
    echo ""
    echo -e "${BLUE}📋 Próximos pasos:${NC}"
    echo -e "   1. Ve a Vercel.com"
    echo -e "   2. Importa el repositorio"
    echo -e "   3. Sigue el deployment guide"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ Error al subir código             ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Posibles causas:${NC}"
    echo -e "   • Credenciales incorrectas"
    echo -e "   • Token expirado o inválido"
    echo -e "   • Problema de red"
    echo ""
    echo -e "${BLUE}💡 Soluciones:${NC}"
    echo -e "   1. Verifica tu Personal Access Token"
    echo -e "   2. Lee GITHUB_AUTH.md para más ayuda"
    echo -e "   3. Intenta con SSH (ver GITHUB_AUTH.md)"
    echo ""
fi

