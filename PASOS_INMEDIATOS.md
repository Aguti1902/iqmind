# ⚡ PASOS INMEDIATOS - Arreglar Suscripción

## 🎯 Tu Situación Actual

✅ Pago de 0,50€ funciona  
❌ Suscripción NO se crea  
❌ No aparece trial en Stripe

---

## 🚀 HACER ESTO AHORA (3 minutos)

### 1️⃣ Verificar Configuración (30 segundos)

Abre en tu navegador:

```
https://iqlevel.mindmetric.es/api/check-config
```

**¿Qué buscar?**
- Si dice `"hasPriceId": false` → **PROBLEMA ENCONTRADO**
- Si dice `"errors": ["STRIPE_PRICE_ID no está configurado"]` → **PROBLEMA ENCONTRADO**

### 2️⃣ Obtener Price ID de Stripe (1 minuto)

1. Ve a: https://dashboard.stripe.com/products
2. Busca tu producto de **19,99€/mes**
3. Clic en el producto
4. Busca el **Price ID** (algo como `price_1Abc123Def456`)
5. **CÓPIALO** completo

### 3️⃣ Añadir a Railway (1 minuto)

1. Railway Dashboard → Tu proyecto IQLevel
2. Tab **"Variables"**
3. Clic **"New Variable"**
4. **Key**: `STRIPE_PRICE_ID`
5. **Value**: Pega el ID que copiaste
6. Clic **"Add"**
7. ⏳ Espera el redeploy (1-2 minutos)

### 4️⃣ Verificar de Nuevo (30 segundos)

Recarga:
```
https://iqlevel.mindmetric.es/api/check-config
```

**Ahora debería mostrar:**
```json
{
  "config": {
    "hasPriceId": true,  ← ✅
    "priceId": "price_xxxxx"
  },
  "priceDetails": {
    "active": true,
    "amount": 1999,
    "amountFormatted": "19.99 EUR"
  },
  "errors": []  ← ✅ VACÍO
}
```

### 5️⃣ Probar Compra (1 minuto)

1. Ve a tu sitio web
2. Haz el test de IQ
3. Paga 0,50€ (con tarjeta test si estás en modo test)
4. **Verás una ALERTA** que dice si funcionó o falló
5. Revisa **Stripe Dashboard** → **Subscriptions**

---

## 🎯 Resultado Esperado

Si todo salió bien:

✅ Alerta dice: "SUSCRIPCIÓN CREADA EXITOSAMENTE"  
✅ En Stripe ves la nueva suscripción  
✅ Status: "trialing"  
✅ Trial de 2 días  
✅ Próximo cobro: 19,99€

---

## ❌ Si Aún No Funciona

Haz esto:

1. **Consola del navegador** (F12):
   - Busca mensajes de error en rojo
   - Captura screenshot

2. **Railway Logs**:
   - Railway → Deployments → View logs
   - Busca después de hacer el pago
   - Captura screenshot

3. **Stripe Dashboard**:
   - Verifica que el producto existe
   - Verifica que estás en el mismo modo (test/live)
   - Captura screenshot del Price ID

---

## 📸 Qué Capturar Si Necesitas Ayuda

1. Screenshot de `/api/check-config`
2. Screenshot de la consola del navegador (F12) después del pago
3. Screenshot de los logs de Railway
4. Screenshot del Price ID en Stripe Dashboard

---

## 💡 Causa Más Probable

**99% de probabilidad**: Falta `STRIPE_PRICE_ID` en Railway

**Verifica:**
- ¿La variable existe en Railway?
- ¿El ID es correcto?
- ¿Copiaste el ID completo sin espacios?
- ¿Estás en el mismo modo (test/live)?

---

## ⏱️ Timeline

- **0:00** - Abrir `/api/check-config`
- **0:30** - Copiar Price ID de Stripe
- **1:30** - Añadir a Railway
- **2:30** - Esperar redeploy
- **3:00** - Verificar de nuevo
- **4:00** - Hacer compra de prueba
- **5:00** - ✅ ¡FUNCIONANDO!

---

## 🆘 Soporte Rápido

Si después de estos pasos sigue sin funcionar, comparte:

1. URL de `/api/check-config`
2. Logs de la consola
3. Logs de Railway
4. Screenshot del Price ID en Stripe

**¡Empezando ahora, tendrás esto funcionando en 5 minutos!** 🚀

