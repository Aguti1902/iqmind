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

  useEffect(() => {
    if (!scriptReady) return
    if (startedRef.current) return

    console.log('✅ Script listo, iniciando checkout...')

    // ⚠️ IMPORTANTE: NO display:none - Sipay necesita medir el DOM
    const style = document.createElement('style')
    style.innerHTML = `
      .fastpay-btn {
        position: absolute !important;
        left: -99999px !important;
        top: -99999px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 1px !important;
        height: 1px !important;
      }
    `
    document.head.appendChild(style)

    // Mover el iframe al contenedor visible
    const moveIframeIntoMount = () => {
      const mount = document.getElementById('sipay-mount')
      if (!mount) return false

      // Buscar iframe de Sipay
      const iframe = Array.from(document.querySelectorAll('iframe')).find((f) => {
        const src = f.getAttribute('src') || ''
        return src.includes('sipay.es') || src.includes('/fpay/')
      })

      if (!iframe) return false

      console.log('✅ Iframe de Sipay detectado, moviéndolo al contenedor visible...')
      
      // Moverlo al contenedor
      mount.innerHTML = ''
      mount.appendChild(iframe)

      // Asegurar tamaño visible
      iframe.style.width = '100%'
      iframe.style.minHeight = '520px'
      iframe.style.border = '0'
      
      console.log('✅ Iframe movido correctamente')
      return true
    }

    const start = () => {
      if (startedRef.current) return true

      const btn = document.querySelector<HTMLButtonElement>('button.fastpay-btn')
      if (!btn) return false

      startedRef.current = true
      console.log('🎯 Click en botón FastPay...')
      btn.click()

      // Después del click, intentar mover el iframe
      setTimeout(() => moveIframeIntoMount(), 200)
      return true
    }

    // Intentar arrancar
    if (!start()) {
      console.log('📡 Esperando botón FastPay...')
      const obsBtn = new MutationObserver(() => start())
      obsBtn.observe(document.body, { childList: true, subtree: true })

      return () => {
        obsBtn.disconnect()
        if (style.parentNode) {
          document.head.removeChild(style)
        }
      }
    }

    // Observar para capturar el iframe cuando aparezca
    const obsIframe = new MutationObserver(() => moveIframeIntoMount())
    obsIframe.observe(document.body, { childList: true, subtree: true })

    return () => {
      obsIframe.disconnect()
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

      {/* Botón-ancla que Sipay usa para inyectar el flujo */}
      <button
        type="button"
        className="fastpay-btn"
        data-key={merchantKey}
        data-amount={amount.toString()}
        data-currency={currency}
        data-template="v4"
        data-lang={lang}
        data-callback="processSipayPayment"
        data-paymentbutton="Pagar"
        data-cardholdername="true"
        data-hiddenprice="false"
        data-notab="1"
      >
        Pagar
      </button>

      {/* Contenedor donde queremos ver el iframe */}
      <div id="sipay-mount" style={{ width: '100%', minHeight: 560 }} />
    </>
  )
}
