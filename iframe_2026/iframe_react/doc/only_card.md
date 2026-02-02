---
title: Solo tarjeta (iframe)
sidebar_position: 3
pagination_next: api/mdwr/allinone
pagination_prev: null
---

## ℹ️ Introducción

Este componente visual te permitirá realizar una transacción en dos partes. Primero capturamos la tarjeta generando un token temporal llamado **request_id**.

El segundo paso consisitirá en utilizar el [API en modo server-to-server](../../../api/mdwr/allinone) para ejecutar una transacción de todas las disponibles. En esta documentación deberás utilizar el parámetro **fastpay** para recuperar la información original del token además de indicar la operación a realizar.

<img 
  src="/img/fastpay_template_v4.png" 
  style={{
    padding: "20px",
    
  }}
/>

_Las dimensiones en pantalla completa son de 430x600 px_

## 💳 Captura de tarjeta

Con este método de integración podrás capturar de manera segura la tarjeta y posteriormente realizar cualquier tipo de operación soportada por el API. **En ningún momento los datos de tarjeta pasarán por tu servidor**, de esta forma se asegura el correcto cumplimiento de **PCI DSS**.

El comercio deberá incluir un archivo JavaScript en la web para el entorno de **sandbox**:

```html title="sandbox"
<script
  type="text/javascript"
  src="https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js"
></script>
```

Y sustituirlo por este para el entorno de **producción**:

```html title="live"
<script
  type="text/javascript"
  src="https://live.sipay.es/fpay/v1/static/bundle/fastpay.js"
></script>
```

:::tip

Se recomienda incluir el fichero javascript en la etiqueta `<head>`.

Adicionalmente no olvides incluir la siguiente sentencia en la sección `<head>` de la página, para escalar el contenido y hacerlo adaptable a diferentes dispositivos.

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

:::

## ⚙️ Configuración de parámetros

A continuación se detallan los atributos configurables del Iframe. Estos parámetros deben incluirse en el elemento **&lt;button&gt;** para personalizar el comportamiento del iframe, incluyendo su aspecto visual, idioma, redirecciones y funcionalidades adicionales como el botón "Recuérdame" o la inclusión del nombre del titular.
Cada atributo acepta un valor específico y puede ser obligatorio u opcional según la configuración deseada.

| **Atributo**        | **Tipo** | **Descripcion**                                                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| data-key            | string   | Clave pública de identificación del comercio. En este caso, sipay-test-team (entorno de pruebas).               |
| data-amount         | string   | Importe a cobrar expresado en céntimos. Ej: 10000 → 100,00 €.                                                   |
| data-currency       | string   | Moneda en formato [ISO 4217](https://es.wikipedia.org/wiki/ISO_4217) (ej. EUR, USD).                            |
| data-template       | string   | v4|
| data-callback       | string   | Nombre de la función JS que se ejecuta al finalizar la operación. Exclusiva con data-redirect.                  |
| data-redirect       | string   | URL de redirección automática tras la captura. Se añade el request_id como query param. Ej: ...?request_id=XYZ. |
| data-remember       | string   | Tipo de botón “Recuérdame” mostrado: puede ser checkbox o slide.                                                |
| data-remembertext   | string   | OPCIONAL. Texto junto al botón de "Recuérdame".|
| data-lang           | string   | Idioma de los textos del componente. Soportados: "es" (español), "en" (inglés) o "ca" (catalán).                                |
| data-autosave       | string  | OPCIONAL. Muestra u oculta el botón de "Recuérdame". Valor por defecto: false. Si ponemos "true" y quitamos cualquier parámetro de data-remember*, se ocultará el botón de "Recuérdame".                                    |
| data-cardholdername | boolean  | Muestra u oculta el campo “Nombre del titular”. Valor por defecto: false.                                       |
| data-paymentbutton  | string | OPCIONAL. Texto que irá dentro del bóton de pagar|
| data-hiddenprice  | boolean | OPCIONAL. Mostrará el importe a pagar dentro del botón.|

Los atributos `data-callback` y `data-redirect` **no deben usarse simultáneamente**, ya que son **mutuamente excluyentes**. Ambos permiten gestionar la respuesta del iframe tras completar la captura de tarjeta:

- **data-callback (string)**: Función de JavaScript que se ejecutará al terminar la captura de tarjeta ([Ver respuestas](#respuestas-callback-y-redirect)). Es un token generado por Sipay para continuar el flujo de pago.
- **data-redirect(string)**: URL a la cual se redirigirá la operación después de recibir realizar la captura de tarjeta. Se le agregará el token recibido por el servicio de Sipay como query string `https://example.es/commerce/fpay?request_id=1234567890` ([Ver respuestas](#respuestas-callback-y-redirect)).

**iframe**

## 📝 Respuestas

### Callback - atributo: data-callback

La respuesta del iframe o ventana de captura de tarjeta consiste un mensaje en formato JSON que contiene un identificador de la transacción identificado como **request_id**. Deberá utilizarse para finalizar el proceso de cobro.

Este JSON tiene la siguiente estructura:

```json
{
  "type": "success",
  "code": "0",
  "detail": "tokenization done successfully",
  "description": "Information saved and tokenized",
  "request_id": "ae8893641c7b4d5486f99279f16bb31b",
  "uuid": "04ebf843-6ac4-4fdc-aa1a-bc876c140dde",
  "payload": {
    "consent": false,
    "cadholder_name": null,
    "expiration": "**/**",
    "pan": "**** **** **** ****"
  }
}
```

Donde:

- **type (string)** : tipo de respuesta
- **uuid (string)** : id unico de petición
- **detail (string)** : detalle de respuesta
- **description (string)** : descripción de respuesta
- **code (string)** : código de resultado de operación
- **payload (json)** : respuesta en json
  - **consent (string)**: respuesta botón "Recúerdame". Valor **true** cuando el usuario activa el botón
  - **cardholder_name(string)**: nombre del propietario de la tarjeta introducido en el formulario
  - **expiration(string)**: fecha de caducidad de la tarjeta (mes/año)
  - **pan(string)**: número de la tarjeta enmascarado
- **request_id** : token temporal de captura de tarjeta. Es necesario para poder realizar cualquier tipo de operación adicional (venta, tokenización, ...). Tiene una duración de cinco minutos.

```javascript title="ejemplo de función JavaScript para callback"
function callbackFunction(data) {
  alert(data);
}
```

### Redirect - atributo: data-redirect

En este caso el **request_id** se concatenará a la URL indicada en el atributo **data-redirect** en formato QueryString y con la clave **request_id**. Si utilizáramos de ejemplo https://httpbin.org/get como URL, una vez capturada la tarjeta nos llevaría a:

`https://httpbin.org/get?request_id=12345677890`

Tu código debería capturar este valor y terminar la operación server-to-server con nuestro API.

## 💻 Ejemplo completo

<iframe 
  height={800}
  style={{width: '100%'}}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/sipay/embed/gbpjgMb?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen <a href="https://codepen.io/sipay/pen/gbpjgMb">
  Untitled</a> by Sipay (<a href="https://codepen.io/sipay">@sipay</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## 💡 Recomendaciones UI/UX

Si quieres que el botón de pago que renderiza automáticamente la librería de JavaScript de Sipay se oculte y además se renderize automáticamente el iframe, no olvides añadir este CSS:

```html
<style>
  .fastpay-btn {
    display: none;
  }
</style>
```

y este JavaScript:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".fastpay-btn").click();
});
```

De esta forma, se ocultará el botón de pago y se renderizará automáticamente el iframe.