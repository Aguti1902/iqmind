# Instrucciones - Ejemplo Sipay iframe (pago con tarjeta) en Next.js

Este documento describe cómo **ejecutar el ejemplo en local** y cómo **integrar el iframe de pago con tarjeta en una web existente hecha con Next.js**.

---

## 1. Ejecutar el ejemplo en local

### Requisitos

- **Node.js** 18.x o superior
- **npm** (o yarn / pnpm)

### Pasos

1. **Clonar o abrir el proyecto** y situarse en la raíz del repositorio:

   ```bash
   cd iframe_nextjs
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Arrancar el servidor de desarrollo (HTTPS):**

   ```bash
   npm run dev
   ```

   El servidor arranca por **HTTPS** con un certificado autofirmado. La primera vez, el navegador mostrará una advertencia de seguridad; acepta la excepción para continuar en local.

4. **Abrir en el navegador:**

   - [https://localhost:3000](https://localhost:3000) — Página de inicio
   - [https://localhost:3000/pago](https://localhost:3000/pago) — Página de pago con el iframe FastPay

5. **Probar el flujo:**

   - En la página de pago, haz clic en el botón de pago.
   - Se abrirá el formulario seguro (iframe) de Sipay.
   - Usa tarjetas de prueba de Sipay en sandbox para completar la captura.
   - Al finalizar, se redirigirá a la página de resultado con el `request_id`.

### Scripts disponibles

| Comando        | Descripción                    |
|----------------|--------------------------------|
| `npm run dev`  | Servidor de desarrollo         |
| `npm run build`| Compilar para producción       |
| `npm run start`| Servir la build de producción  |
| `npm run lint` | Ejecutar el linter             |

---

## 2. Integrar el iframe en una web Next.js existente

Sigue estos pasos para añadir el pago con tarjeta (iframe FastPay) en tu proyecto Next.js.

### 2.1. Incluir el script de FastPay

El iframe de Sipay requiere cargar un script JavaScript:

- **Sandbox (pruebas):**  
  `https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js`
- **Producción:**  
  `https://live.sipay.es/fpay/v1/static/bundle/fastpay.js`

En Next.js, usa el componente `Script` de `next/script` en la página o layout donde vayas a mostrar el pago:

```tsx
import Script from "next/script";

// En tu página o layout:
<Script
  src="https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js"
  strategy="afterInteractive"
/>
```

Recomendación: incluir el script en el `<head>` o al inicio del layout/página. En App Router, puede ir en el layout o en un Client Component que contenga el formulario de pago.

### 2.2. Viewport en móviles

Añade la meta de viewport en el layout para que el iframe se adapte bien en móviles:

```tsx
// En app/layout.tsx (o en el <head> correspondiente)
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### 2.3. Botón de pago con atributos data-*

El comportamiento del iframe se configura con atributos `data-*` en un **`<button>`**. Ese botón debe estar en el DOM cuando el script de FastPay se ejecute (por ejemplo en una página cliente).

Atributos principales:

| Atributo         | Tipo    | Descripción |
|------------------|--------|-------------|
| `data-key`       | string | Clave pública del comercio (en sandbox: `sipay-test-team`) |
| `data-amount`    | string | Importe en **céntimos** (ej. `10000` = 100,00 €) |
| `data-currency`  | string | Moneda ISO 4217 (ej. `EUR`) |
| `data-template`  | string | Valor fijo: `v4` |
| `data-callback`  | string | **Nombre** de una función global que Sipay llamará al terminar (no usar junto con `data-redirect`) |
| `data-redirect`  | string | URL a la que redirigir tras la captura; Sipay añadirá `?request_id=...` (no usar junto con `data-callback`) |
| `data-lang`      | string | Idioma: `es`, `en`, `ca` |
| `data-paymentbutton` | string | Texto del botón de pagar |
| `data-cardholdername` | boolean | Mostrar u ocultar el campo "Nombre del titular" |

Solo uno de los dos: **`data-callback`** o **`data-redirect`**.

Ejemplo de botón (en un Client Component):

```tsx
"use client";

<button
  type="button"
  className="fastpay-btn"
  data-key="sipay-test-team"
  data-amount="10000"
  data-currency="EUR"
  data-template="v4"
  data-callback="miCallbackPago"
  data-lang="es"
  data-paymentbutton="Pagar 100,00 €"
>
  Pagar
</button>
```

### 2.4. Gestionar la respuesta

#### Opción A: Callback (función global)

Si usas `data-callback="miCallbackPago"`, define en el cliente una función global con ese nombre. Sipay la invocará con un objeto JSON que incluye `request_id`:

```tsx
// En un Client Component, por ejemplo con useEffect:
useEffect(() => {
  (window as unknown as { miCallbackPago?: (data: unknown) => void }).miCallbackPago = (data: unknown) => {
    const d = data as { type?: string; request_id?: string };
    if (d.type === "success" && d.request_id) {
      // Enviar request_id a tu backend o redirigir a tu página de confirmación
      router.push(`/confirmacion?request_id=${encodeURIComponent(d.request_id)}`);
    }
  };
  return () => {
    delete (window as unknown as { miCallbackPago?: (data: unknown) => void }).miCallbackPago;
  };
}, [router]);
```

El objeto que recibe la callback tiene esta forma (entre otros campos):

```json
{
  "type": "success",
  "code": "0",
  "request_id": "ae8893641c7b4d5486f99279f16bb31b",
  "detail": "tokenization done successfully",
  "description": "Information saved and tokenized",
  "uuid": "...",
  "payload": { "consent": false, "cardholder_name": null, "expiration": "**/**", "pan": "**** **** **** ****" }
}
```

El **`request_id`** es un token temporal (válido unos 5 minutos) que tu backend debe usar con el **API de Sipay en modo server-to-server** (parámetro **fastpay**, https://developer.sipay.es/docs/api/mdwr/allinone) para ejecutar la venta, tokenización u otra operación. Los datos de tarjeta no pasan por tu servidor (cumplimiento PCI DSS).

#### Opción B: Redirect

Si usas `data-redirect="https://tudominio.com/confirmacion"`, tras la captura el usuario será redirigido a:

`https://tudominio.com/confirmacion?request_id=XXXXXXXX`

Tu página `/confirmacion` debe leer `request_id` de la query (por ejemplo con `searchParams` en App Router) y enviarlo a tu backend para completar el pago con el API de Sipay.

### 2.5. Resumen de integración en tu proyecto

1. Añadir `<Script src="...fastpay.js" strategy="afterInteractive" />` (sandbox o live).
2. Añadir `<meta name="viewport" ... />` en el layout.
3. Crear una página o Client Component con un `<button>` que tenga los `data-*` necesarios (`data-key`, `data-amount`, `data-currency`, `data-template`, y `data-callback` **o** `data-redirect`).
4. Si usas callback: definir en `window` la función con el nombre indicado en `data-callback` y, al recibir `request_id`, redirigir o llamar a tu backend.
5. Si usas redirect: crear la ruta de destino y leer `request_id` de la URL para pasarlo a tu backend.
6. En el backend: usar el `request_id` con el API de Sipay (fastpay) para ejecutar la transacción.

Puedes reutilizar el componente `FastPayForm` y las páginas de este ejemplo (`/pago`, `/pago/resultado`) como referencia y adaptarlos a tu estructura de rutas y diseño.
