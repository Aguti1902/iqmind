'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

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

      {/* Zona visible del checkout */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 560,
          border: '2px solid #e5e7eb',
          borderRadius: 12,
          background: 'white',
          overflow: 'hidden'
        }}
      >
        {/* UI visible para el usuario */}
        <div style={{ padding: 24 }}>
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
            lineHeight: 1.6
          }}>
            {scriptReady 
              ? '👆 Haz click en este recuadro para cargar el formulario de pago seguro con Sipay'
              : '⏳ Cargando pasarela de pago segura...'}
          </div>
          
          {scriptReady && (
            <div style={{ 
              marginTop: 16,
              padding: 12,
              background: '#f3f4f6',
              borderRadius: 8,
              fontSize: 13,
              color: '#4b5563'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔒</span>
                <span>Pago 100% seguro · Protegido por Sipay</span>
              </div>
            </div>
          )}
        </div>

        {/* ✅ BOTÓN REAL DE SIPAY - Invisible pero clicable */}
        {/* El usuario hace click REAL (trusted) sobre toda el área */}
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
          data-hiddenprice="false"
          data-notab="1"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,           // Invisible
            cursor: 'pointer',    // Clicable
            border: 'none',
            background: 'transparent',
            zIndex: 10
          }}
          aria-label="Pago seguro con Sipay"
        >
          Pagar {(amount / 100).toFixed(2)}€
        </button>
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
