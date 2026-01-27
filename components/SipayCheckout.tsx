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
  const [scriptReady, setScriptReady] = useState(false)
  const openedRef = useRef(false)

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

  // Función para abrir el formulario con click del usuario (trusted)
  const openCardForm = () => {
    if (!scriptReady || openedRef.current) return

    console.log('👆 Usuario hizo click, abriendo formulario Sipay...')
    
    // Click REAL al launcher (trusted porque viene de interacción del usuario)
    const launcher = document.querySelector<HTMLButtonElement>('.fastpay-btn')
    if (launcher) {
      launcher.click()
      openedRef.current = true
      console.log('✅ Formulario Sipay abierto')
    }
  }

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

      {/* CSS para ocultar el botón SIN display:none */}
      <style jsx global>{`
        .fastpay-btn {
          position: absolute !important;
          left: -99999px !important;
          top: -99999px !important;
          opacity: 0 !important;
          width: 1px !important;
          height: 1px !important;
          pointer-events: none !important;
        }
      `}</style>

      {/* Botón de Sipay - Intentar modo embebido con data-embedded y data-open */}
      <button
        type="button"
        className="fastpay-btn"
        data-key={merchantKey}
        data-amount={amount.toString()}
        data-currency={currency}
        data-template="v3"
        data-lang={lang}
        data-callback="processSipayPayment"
        data-paymentbutton="Pagar"
        data-cardholdername="true"
        data-hiddenprice="true"
        data-header="false"
        data-autosave="true"
        data-notab="1"
        data-embedded="1"
        data-open="1"
      >
        Pagar
      </button>

      {/* Bloque de checkout - Click abre el formulario */}
      <div
        onClick={openCardForm}
        style={{
          width: '100%',
          minHeight: 560,
          border: '2px solid #e5e7eb',
          borderRadius: 12,
          background: 'white',
          padding: 24,
          cursor: scriptReady ? 'pointer' : 'default',
          transition: 'border-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (scriptReady) e.currentTarget.style.borderColor = '#07C59A'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb'
        }}
      >
        <div style={{ 
          fontWeight: 700, 
          fontSize: 16,
          color: '#111827',
          marginBottom: 12 
        }}>
          Datos de la Tarjeta
        </div>
        
        <div style={{ 
          color: '#6b7280', 
          fontSize: 14,
          marginBottom: 16
        }}>
          {scriptReady 
            ? '👆 Haz click aquí para cargar el formulario de pago seguro'
            : '⏳ Cargando pasarela de pago...'}
        </div>

        {scriptReady && !openedRef.current && (
          <div style={{ 
            padding: 16,
            background: '#f3f4f6',
            borderRadius: 8,
            fontSize: 13,
            color: '#4b5563',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔒</span>
              <span>Pago 100% seguro · Protegido por Sipay</span>
            </div>
          </div>
        )}

        {/* Espacio para el iframe de Sipay */}
        <div style={{ minHeight: 420 }} id="sipay-form-container" />
      </div>

      {/* Mensaje de ayuda */}
      {scriptReady && (
        <p style={{ 
          marginTop: 12, 
          fontSize: 12, 
          color: '#9ca3af',
          textAlign: 'center' 
        }}>
          Tus datos de pago están encriptados y protegidos
        </p>
      )}
    </>
  )
}
