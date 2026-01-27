'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

// Configuración del entorno (cambiar a 'live' en producción)
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

export default function SipayCheckout({
  email,
  amount,
  currency = 'EUR',
  merchantKey,
  lang = 'es',
  onPaymentSuccess,
  onPaymentError
}: SipayCheckoutProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [iframeRendered, setIframeRendered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const clickedRef = useRef(false)
  const callbackSetRef = useRef(false)

  // Configurar callback global ANTES de que FastPay se cargue
  useEffect(() => {
    if (callbackSetRef.current) return
    callbackSetRef.current = true

    window.processSipayPayment = (response: any) => {
      console.log('💳 Sipay callback recibido:', response)
      
      if (response.type === 'success' && response.request_id) {
        onPaymentSuccess(response)
      } else {
        const error = response.description || 'Error en el pago'
        console.error('❌ Error Sipay:', error)
        onPaymentError?.(response)
      }
    }

    return () => {
      delete window.processSipayPayment
    }
  }, [onPaymentSuccess, onPaymentError])

  // Detectar y auto-clickear el botón FastPay
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || clickedRef.current) return

    console.log('🔍 Buscando botón FastPay...')

    // Usar MutationObserver para detectar cuando FastPay crea el botón
    observerRef.current = new MutationObserver((mutations) => {
      const button = containerRef.current?.querySelector('.fastpay-btn') as HTMLElement
      
      if (button && !clickedRef.current) {
        clickedRef.current = true
        console.log('✅ Botón FastPay detectado, auto-clicking...')
        
        // Esperar un tick para asegurar que FastPay terminó de inicializar
        setTimeout(() => {
          button.click()
          console.log('🎯 Click ejecutado')
          
          // Verificar si el iframe se renderizó
          setTimeout(() => {
            const iframe = document.querySelector('iframe[src*="sipay"]')
            if (iframe) {
              console.log('✅ Iframe de Sipay renderizado')
              setIframeRendered(true)
            } else {
              console.warn('⚠️ Iframe no detectado después del click')
            }
          }, 1500)
        }, 100)
      }
    })

    // Observar cambios en el contenedor
    observerRef.current.observe(containerRef.current, {
      childList: true,
      subtree: true
    })

    // Cleanup
    return () => {
      observerRef.current?.disconnect()
    }
  }, [scriptLoaded])

  return (
    <>
      {/* Script de Sipay FastPay */}
      <Script
        src={SIPAY_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Sipay FastPay script cargado')
          setScriptLoaded(true)
        }}
        onError={(e) => {
          console.error('❌ Error cargando Sipay script:', e)
        }}
      />

      <style jsx global>{`
        /* Ocultar el botón FastPay - solo queremos el iframe */
        .fastpay-btn {
          display: none !important;
        }
        
        /* Estilos del contenedor del iframe */
        .sipay-iframe-container {
          min-height: 600px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        
        /* Asegurar que el iframe de Sipay se vea correctamente */
        iframe[src*="sipay"] {
          border: none;
          width: 100%;
          min-width: 430px;
          min-height: 600px;
        }
      `}</style>

      <div className="sipay-checkout-wrapper">
        {/* Loading indicator */}
        {!iframeRendered && (
          <div className="sipay-loading" style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #07C59A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Cargando pasarela de pago segura...</p>
            <p style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.5rem' }}>
              Powered by Sipay
            </p>
          </div>
        )}

        {/* Contenedor donde FastPay insertará el iframe */}
        <div 
          ref={containerRef}
          className="sipay-iframe-container"
          style={{ display: iframeRendered ? 'block' : 'none' }}
        >
          {/* Botón FastPay - FastPay lo busca por clase .fastpay-btn */}
          <button
            className="fastpay-btn"
            data-key={merchantKey}
            data-amount={amount.toString()}
            data-currency={currency}
            data-template="v4"
            data-callback="processSipayPayment"
            data-lang={lang}
            data-cardholdername="true"
            data-paymentbutton="Pagar"
            data-hiddenprice="false"
          >
            Pagar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

// Declaración global para TypeScript
declare global {
  interface Window {
    processSipayPayment?: (response: any) => void
  }
}

