# 🎯 Resumen Simple: Pago de 0,50€ → Suscripción Automática

## ✅ Lo Que Ya Está Hecho

El código **YA ESTÁ LISTO** y hace esto automáticamente:

```
Usuario paga 0,50€
        ↓
   AUTOMÁTICAMENTE
        ↓
Se crea suscripción de 19,99€/mes
        ↓
Trial de 2 días GRATIS
        ↓
Día 3: Stripe cobra 19,99€
        ↓
Cada mes: Cobra 19,99€
```

## 🔧 Solo Necesitas UNA Variable

En **Railway** (o donde tengas desplegado), añade esta variable:

```
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
```

### ¿Dónde Conseguir Este ID?

1. **Stripe Dashboard** → **Products** → Tu producto de 19,99€
2. Copia el **Price ID** que aparece ahí
3. Pégalo en Railway

## 🧪 Cómo Verificar que Funciona

### Método 1: Hacer una Compra de Prueba

1. Ve a tu sitio web
2. Haz el test de IQ
3. Paga 0,50€
4. Ve a **Stripe Dashboard** → **Subscriptions**
5. Deberías ver:
   - ✅ Nueva suscripción
   - ✅ Status: "Trialing"
   - ✅ Trial ends: En 2 días
   - ✅ Amount: 19,99€/mes

### Método 2: Ver Logs

En **Railway** → **Logs**, busca:

```
✅ Suscripción creada exitosamente: sub_...
Estado: trialing
Trial end: [fecha en 2 días]
```

## ❗ Si No Funciona

**Problema**: La suscripción no se crea después del pago

**Solución**:
1. Verifica que `STRIPE_PRICE_ID` esté en Railway
2. Verifica que el ID sea correcto (cópialo de nuevo de Stripe)
3. Redeploy en Railway
4. Revisa los logs para ver el error

## 📊 Qué Verá el Usuario

### Día 0 (Hoy):
- Paga **0,50€**
- Ve sus resultados
- Recibe email de confirmación
- **Trial activo** (no paga nada más)

### Día 1-2:
- **Trial activo** (no paga nada)
- Puede cancelar en cualquier momento

### Día 3:
- Si NO canceló → Stripe cobra **19,99€** automáticamente
- Si canceló → No se cobra nada

### Cada Mes:
- Stripe cobra **19,99€** automáticamente

## 🎉 Eso es Todo

No necesitas hacer nada más. El código ya está implementado y funcionando. Solo asegúrate de que `STRIPE_PRICE_ID` esté configurado en Railway.

---

## 📝 Checklist Rápido

- [ ] Ir a Stripe Dashboard
- [ ] Copiar el Price ID del producto de 19,99€
- [ ] Añadir `STRIPE_PRICE_ID` en Railway
- [ ] Hacer una compra de prueba
- [ ] Verificar en Stripe que la suscripción se creó

**Tiempo estimado**: 5 minutos ⏱️

