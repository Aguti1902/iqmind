/**
 * Custom Element (Web Component) para FastPay
 * Este componente encapsula el botón de FastPay aislándolo del Virtual DOM de React
 */

class SipayFastPayElement extends HTMLElement {
  constructor() {
    super()
    console.log('🔧 [WebComponent] Constructor llamado')
  }

  connectedCallback() {
    console.log('🔧 [WebComponent] connectedCallback - Elemento conectado al DOM')
    
    // Obtener atributos
    const key = this.getAttribute('data-key')
    const amount = this.getAttribute('data-amount')
    const currency = this.getAttribute('data-currency') || 'EUR'
    const template = this.getAttribute('data-template') || 'v4'
    const callback = this.getAttribute('data-callback')
    const lang = this.getAttribute('data-lang') || 'es'
    const paymentButton = this.getAttribute('data-paymentbutton') || 'Pagar'
    const cardholderName = this.getAttribute('data-cardholdername') === 'true'
    const remember = this.getAttribute('data-remember') || 'checkbox'
    const rememberText = this.getAttribute('data-remembertext') || 'Recordar tarjeta'
    const hiddenPrice = this.getAttribute('data-hiddenprice') === 'true'

    console.log('📊 [WebComponent] Atributos:', {
      key,
      amount,
      currency,
      template,
      callback,
      lang
    })

    // Crear el HTML interno con el botón FastPay
    this.innerHTML = `
      <div style="min-width: 430px; display: flex; justify-content: center;">
        <button
          class="fastpay-btn"
          data-key="${key}"
          data-amount="${amount}"
          data-currency="${currency}"
          data-template="${template}"
          data-callback="${callback}"
          data-paymentbutton="${paymentButton}"
          data-cardholdername="${cardholderName}"
          data-remember="${remember}"
          data-remembertext="${rememberText}"
          data-hiddenprice="${hiddenPrice}"
          data-lang="${lang}">
        </button>
      </div>
    `

    console.log('✅ [WebComponent] HTML interno creado')
    console.log('🔍 [WebComponent] Botón FastPay:', this.querySelector('.fastpay-btn'))

    // Verificar si FastPay procesa el botón
    setTimeout(() => {
      const iframe = this.querySelector('iframe[src*="sipay"]')
      if (iframe) {
        console.log('✅ [WebComponent] ¡Iframe detectado dentro del Web Component!')
      } else {
        console.error('❌ [WebComponent] Iframe NO detectado después de 2 segundos')
        console.error('📋 [WebComponent] Contenido actual:', this.innerHTML)
      }
    }, 2000)
  }

  disconnectedCallback() {
    console.log('🔧 [WebComponent] disconnectedCallback - Elemento desconectado')
  }
}

// Registrar el Custom Element
if (!customElements.get('sipay-fastpay')) {
  customElements.define('sipay-fastpay', SipayFastPayElement)
  console.log('✅ [WebComponent] Custom Element registrado: <sipay-fastpay>')
} else {
  console.log('⚠️ [WebComponent] Custom Element ya estaba registrado')
}

