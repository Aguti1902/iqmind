# Instrucciones - Ejemplo Sipay iframe (pago con tarjeta) en React

Este documento describe cómo **ejecutar el ejemplo en local** y cómo **integrar el iframe de pago con tarjeta en una web existente hecha con React**.

---

## 1. Ejecutar el ejemplo en local

### Requisitos

- **Node.js** 18.x o superior
- **npm** (o yarn / pnpm)

### Pasos

1. **Clonar o abrir el proyecto** y situarse en la raíz del repositorio:

   ```bash
   cd iframe_react
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Arrancar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**

   - [http://localhost:3000](http://localhost:3000) — Página de inicio
   - [http://localhost:3000/pago](http://localhost:3000/pago) — Página de pago con el iframe FastPay

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
| `npm run preview`| Servir la build de producción  |
| `npm run lint` | Ejecutar el linter             |

---

## 2. Integrar el iframe en una web React existente

Sigue estos pasos para añadir el pago con tarjeta (iframe FastPay) en tu proyecto React.

### 2.1. Incluir el script de FastPay

El iframe de Sipay requiere cargar un script JavaScript:

- **Sandbox (pruebas):**  
  `https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js`
- **Producción:**  
  `https://live.sipay.es/fpay/v1/static/bundle/fastpay.js`

En React, puedes incluir el script en el `index.html` o cargarlo dinámicamente con un `useEffect`:

**Opción A: En index.html (recomendado)**

```html
<!-- En public/index.html o index.html -->
<head>
  <script
    type="text/javascript"
    src="https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js"
  ></script>
</head>
```

**Opción B: Carga dinámica en componente**

```tsx
import { useEffect } from 'react'

useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js'
  script.async = true
  document.body.appendChild(script)
  
  return () => {
    document.body.removeChild(script)
  }
}, [])
```

### 2.2. Viewport en móviles

Añade la meta de viewport en el `index.html` para que el iframe se adapte bien en móviles:

```html
<!-- En index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### 2.3. Botón de pago con atributos data-*

El comportamiento del iframe se configura con atributos `data-*` en un **`<button>`**. Ese botón debe estar en el DOM cuando el script de FastPay se ejecute.

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

Ejemplo de botón (en un componente React):

```tsx
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
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function PagoComponent() {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Definir función global para el callback
    (window as any).miCallbackPago = (data: any) => {
      if (data.type === "success" && data.request_id) {
        // Enviar request_id a tu backend o redirigir a tu página de confirmación
        navigate(`/confirmacion?request_id=${encodeURIComponent(data.request_id)}`)
      }
    }
    
    return () => {
      // Limpiar función global al desmontar
      delete (window as any).miCallbackPago
    }
  }, [navigate])
  
  return (
    <button
      type="button"
      className="fastpay-btn"
      data-key="sipay-test-team"
      data-amount="10000"
      data-currency="EUR"
      data-template="v4"
      data-callback="miCallbackPago"
      data-lang="es"
    >
      Pagar
    </button>
  )
}
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

Tu página `/confirmacion` debe leer `request_id` de la query (por ejemplo con `useSearchParams` de React Router) y enviarlo a tu backend para completar el pago con el API de Sipay.

```tsx
import { useSearchParams } from 'react-router-dom'

function ConfirmacionPage() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('request_id')
  
  // Enviar request_id a tu backend...
  
  return <div>request_id: {requestId}</div>
}
```

### 2.5. Resumen de integración en tu proyecto

1. Añadir el script de FastPay en `index.html` o cargarlo dinámicamente (sandbox o live).
2. Añadir `<meta name="viewport" ... />` en el `index.html`.
3. Crear un componente con un `<button>` que tenga los `data-*` necesarios (`data-key`, `data-amount`, `data-currency`, `data-template`, y `data-callback` **o** `data-redirect`).
4. Si usas callback: definir en `window` la función con el nombre indicado en `data-callback` y, al recibir `request_id`, redirigir o llamar a tu backend.
5. Si usas redirect: crear la ruta de destino y leer `request_id` de la URL para pasarlo a tu backend.
6. En el backend: usar el `request_id` con el API de Sipay (fastpay) para ejecutar la transacción.

Puedes reutilizar el componente `FastPayForm` y las páginas de este ejemplo (`/pago`, `/pago/resultado`) como referencia y adaptarlos a tu estructura de rutas y diseño.

### 2.6. Nota sobre el iframe embebido

Este ejemplo utiliza un iframe que carga una página HTML estática (`fastpay-standalone.html`) que contiene el botón con los atributos `data-*` y el script de FastPay. Esta solución evita problemas de timing cuando el script de FastPay intenta enlazar el botón antes de que React haya renderizado el DOM.

Si prefieres usar el botón directamente en tu componente React, asegúrate de que:
- El script de FastPay se carga antes de que el botón se renderice, o
- Usas un `useEffect` para disparar el click del botón después de que FastPay haya inicializado (ver el ejemplo en `fastpay-standalone.html`).
