/**
 * Declaración de tipos para Custom Elements (Web Components)
 */

declare namespace JSX {
  interface IntrinsicElements {
    'sipay-fastpay': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'data-key'?: string
      'data-amount'?: string | number
      'data-currency'?: string
      'data-template'?: string
      'data-callback'?: string
      'data-paymentbutton'?: string
      'data-cardholdername'?: string | boolean
      'data-remember'?: string
      'data-remembertext'?: string
      'data-hiddenprice'?: string | boolean
      'data-lang'?: string
    }
  }
}

