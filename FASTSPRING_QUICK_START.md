# ⚡ FastSpring - Quick Start (5 minutos)

## 🚀 Pasos Rápidos

### 1. Variables de Entorno (2 min)

```bash
# .env.local Y Vercel
NEXT_PUBLIC_FASTSPRING_STOREFRONT=tu-store.onfastspring.com/popup-storefront
FASTSPRING_API_USERNAME=tu_username
FASTSPRING_API_PASSWORD=tu_password
PAYMENT_PROVIDER=fastspring
```

### 2. Base de Datos (1 min)

```sql
UPDATE site_config SET value = 'fastspring' WHERE key = 'payment_provider';

INSERT INTO site_config (key, value) VALUES 
  ('fastspring_storefront', 'tu-store.onfastspring.com/popup-storefront'),
  ('fastspring_product_path', 'iqmind-premium-access')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### 3. FastSpring Dashboard (2 min)

1. **Producto**:
   - Path: `iqmind-premium-access`
   - Setup fee: €0.50
   - Trial: 2 días
   - Recurring: €9.99/mes

2. **Webhook**:
   - URL: `https://iqmind.mobi/api/fastspring-webhook`
   - Events: order.completed, subscription.*

### 4. Deploy

```bash
git add .
git commit -m "feat: FastSpring integration"
git push
```

### 5. Test

1. Ir a tu web → `/test`
2. Completar test (mínimo 3 minutos)
3. Checkout → usar tarjeta test: `4111 1111 1111 1111`
4. Verificar acceso y email

---

## ⚠️ Importante

- **Sistema anti-fraude activo**: bloquea tests < 3 min
- **Monitorear disputas**: FastSpring puede cerrar cuenta
- **Responder soporte rápido**: < 24h

---

## 🆘 Problemas?

```bash
# Ver logs
vercel logs --follow

# Ver configuración
curl https://tu-dominio.com/api/site-config
```

**Ver FASTSPRING_SETUP.md para guía completa**

