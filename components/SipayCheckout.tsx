'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

// Configuración del entorno
const SIPAY_ENV = 'sandbox' // 'sandbox' | 'live'
const SIPAY_SCRIPT_URL = `https://${SIPAY_ENV}.sipay.es/fpay/v1/static/bundle/fastpay.js`

interface SipayCheckoutProps {
  email: string
  amount: number // En céntimos (ej: 50 = 0.50€)
  currency?: string
  merchantKey: string
  lang?: string
  onPaymentSuccess: (response: any) => void
  onPaymentError?: (error: any) => void
}

declare global {
  interface Window {
    processSipayPayment?: (data: any) => void
  }
}

export default function SipayCheckout({
  email,
  amount,
  currency = 'EUR',
  merchantKey,
  lang = 'es',
  onPaymentSuccess,
  onPaymentError
}: SipayCheckoutProps) {
  const startedRef = useRef(false)
  const [scriptReady, setScriptReady] = useState(false)

  // Configurar callback global
  useEffect(() => {
    window.processSipayPayment = (data: any) => {
      console.log('💳 Sipay callback:', data)
      
      if (data.type === 'success' && data.request_id) {
        onPaymentSuccess(data)
      } else {
        const error = data.description || 'Error en el pago'
        console.error('❌ Error Sipay:', error)
        onPaymentError?.(data)
      }
    }

    return () => {
      delete window.processSipayPayment
    }
  }, [onPaymentSuccess, onPaymentError])

  // Auto-click cuando el script esté listo
  useEffect(() => {
    if (!scriptReady) return
    if (startedRef.current) return

    console.log('✅ Script listo, preparando checkout...')

    // Ocultar el botón (Sipay genera UI sobre .fastpay-btn)
    const style = document.createElement('style')
    style.innerHTML = `.fastpay-btn{display:none !important;}`
    document.head.appendChild(style)

    const start = () => {
      if (startedRef.current) return true
      const btn = document.querySelector<HTMLButtonElement>('button.fastpay-btn')
      if (!btn) return false

      startedRef.current = true
      console.log('🎯 Ejecutando click en botón FastPay...')
      btn.click() // dispara el render del iframe interno
      console.log('✅ Click ejecutado - Sipay renderizará el iframe automáticamente')
      return true
    }

    if (start()) return

    console.log('📡 Esperando botón FastPay...')
    const obs = new MutationObserver(() => start())
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      obs.disconnect()
      if (style.parentNode) {
        document.head.removeChild(style)
      }
    }
  }, [scriptReady])

  return (
    <>
      <Script
        src={SIPAY_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Sipay FastPay script cargado')
          setScriptReady(true)
        }}
        onError={(e) => {
          console.error('❌ Error cargando Sipay script:', e)
        }}
      />

      <button
        type="button"
        className="fastpay-btn"
        data-key={merchantKey}
        data-amount={amount.toString()}
        data-currency={currency}
        data-template="v4"
        data-callback="processSipayPayment"
        data-paymentbutton="Pagar"
        data-cardholdername="true"
        data-lang={lang}
        data-hiddenprice="false"
        data-notab="1"
      >
        Pagar
      </button>

      {/* Espacio para el iframe - evita colapso del layout */}
      <div style={{ minHeight: 650 }} />
    </>
  )
}
