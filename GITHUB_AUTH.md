# 🔐 GitHub Authentication Guide

## Problema
```
remote: Permission to Aguti1902/mindmetric.git denied to nexgent-ai-systems.
fatal: unable to access 'https://github.com/Aguti1902/mindmetric.git/': The requested URL returned error: 403
```

## ✅ Solución Recomendada: Personal Access Token

### Paso 1: Crear Personal Access Token

1. Ve a: **https://github.com/settings/tokens**
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Configura el token:
   - **Note**: `MindMetric Development`
   - **Expiration**: `90 days` (o el que prefieras)
   - **Select scopes**: Marca `repo` (todo)
4. Click **"Generate token"**
5. **¡IMPORTANTE!** Copia el token inmediatamente (no podrás verlo después)

### Paso 2: Usar el Token

```bash
cd /Users/guti/Desktop/CURSOR\ WEBS/IQLEVEL

# Cuando hagas push, usa:
# Username: Aguti1902
# Password: [PEGA TU TOKEN AQUÍ]

git push -u origin main
```

### Paso 3: Guardar Credenciales (Opcional)

Para no tener que ingresar el token cada vez:

```bash
# macOS Keychain
git config --global credential.helper osxkeychain

# Ahora haz push (solo esta vez necesitarás ingresar credenciales)
git push -u origin main
```

---

## 🔄 Alternativa: GitHub CLI

### Instalar GitHub CLI

```bash
# macOS
brew install gh

# O descarga desde: https://cli.github.com/
```

### Autenticarse

```bash
gh auth login

# Selecciona:
# - GitHub.com
# - HTTPS
# - Login with a web browser
# - Copy el código y pega en el navegador
```

### Push con GitHub CLI

```bash
cd /Users/guti/Desktop/CURSOR\ WEBS/IQLEVEL
git push -u origin main
```

---

## 🔑 Alternativa: SSH Keys

### Paso 1: Generar SSH Key

```bash
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Presiona Enter para usar ubicación por defecto
# Opcional: agrega una passphrase
```

### Paso 2: Copiar la Key Pública

```bash
# macOS
cat ~/.ssh/id_ed25519.pub | pbcopy

# Linux
cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
```

### Paso 3: Agregar a GitHub

1. Ve a: **https://github.com/settings/keys**
2. Click **"New SSH key"**
3. **Title**: `MacBook Pro` (o tu dispositivo)
4. **Key**: Pega el contenido copiado
5. Click **"Add SSH key"**

### Paso 4: Cambiar Remote a SSH

```bash
cd /Users/guti/Desktop/CURSOR\ WEBS/IQLEVEL

# Remover remote actual
git remote remove origin

# Agregar remote SSH
git remote add origin git@github.com:Aguti1902/mindmetric.git

# Push
git push -u origin main
```

---

## 🧪 Verificar Configuración

```bash
# Ver remotes
git remote -v

# Ver usuario git
git config user.name
git config user.email

# Si necesitas cambiarlos:
git config --global user.name "Aguti1902"
git config --global user.email "tu-email@example.com"
```

---

## 🆘 Troubleshooting

### Error: "fatal: could not read Username"

```bash
# Verifica el remote
git remote -v

# Debería ser:
# origin  https://github.com/Aguti1902/mindmetric.git (fetch)
# origin  https://github.com/Aguti1902/mindmetric.git (push)
```

### Error: "Permission denied (publickey)"

Si usas SSH y ves este error:

```bash
# Verifica que la key está en el agente
ssh-add -l

# Si no aparece, agrégala
ssh-add ~/.ssh/id_ed25519

# Prueba la conexión
ssh -T git@github.com
```

### Error: "remote: Support for password authentication was removed"

GitHub ya no acepta passwords normales. Debes usar:
- ✅ Personal Access Token
- ✅ SSH Keys
- ✅ GitHub CLI

---

## 📝 Comandos Rápidos

```bash
# Ver estado
git status

# Ver remotes
git remote -v

# Ver configuración
git config --list

# Push (con token o SSH)
git push -u origin main

# Pull
git pull origin main

# Ver commits
git log --oneline
```

---

## ✅ Checklist

- [ ] Personal Access Token creado
- [ ] Token copiado y guardado en lugar seguro
- [ ] Remote configurado correctamente
- [ ] Credenciales guardadas (opcional)
- [ ] Push exitoso a GitHub
- [ ] Código visible en https://github.com/Aguti1902/mindmetric

---

## 🎯 Próximos Pasos

Una vez que el código esté en GitHub:

1. **Vercel**: Conectar repositorio y desplegar
2. **Railway**: Crear base de datos PostgreSQL
3. **Stripe**: Configurar productos y webhooks
4. **Dominio**: Configurar DNS (opcional)

Ver `DEPLOYMENT.md` para guía completa.

---

## 📞 Ayuda

- **GitHub Docs**: https://docs.github.com/en/authentication
- **Personal Access Tokens**: https://github.com/settings/tokens
- **SSH Keys**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

