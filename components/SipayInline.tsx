'use client'

import { useEffect, useRef, useCallback } from 'react'

export type SipayInlineProps = {
  /** Clave pública del comercio (NEXT_PUBLIC_SIPAY_KEY). Nunca el Secret. */
  merchantKey: string
  /** Importe en céntimos (ej: 50 = 0,50€) */
  amount: number
  /** Moneda ISO 4217 (ej: EUR) */
  currency?: string
  /** Plantilla Sipay (v3, v4) */
  template?: string
  /** Idioma del formulario: es, en, ca */
  lang?: string
  /** Entorno: sandbox | live. Por defecto sandbox. */
  env?: 'sandbox' | 'live'
  /** Se llama cuando el usuario completa el pago en el iframe con request_id válido */
  onRequestId: (requestId: string, payload?: unknown) => void
  /** Opcional: alto del iframe (px). Por defecto 520 */
  height?: number
}

/**
 * Componente Next.js (client) que embebe el formulario Sipay FastPay vía iframe
 * apuntando al HTML estático en /public/fastpay-standalone.html.
 * Sin SSR para el pago; la key es la pública (no el Secret).
 * 
 * RESPONSIVE: El iframe ocupa 100% del ancho disponible
 */
export default function SipayInline({
  merchantKey,
  amount,
  currency = 'EUR',
  template = 'v4',
  lang = 'es',
  env = 'sandbox',
  onRequestId,
  height = 520,
}: SipayInlineProps) {
  const onRequestIdRef = useRef(onRequestId)
  onRequestIdRef.current = onRequestId

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = event.data
    console.log('🔔 SipayInline received message:', event.origin, data)
    
    // Aceptar mensajes de nuestro dominio o de Sipay
    if (!data || typeof data !== 'object') return
    
    // Si es nuestro mensaje custom
    if (data.type === 'sipay_fastpay_done' && data.request_id) {
      console.log('✅ SipayInline: Payment completed!', data.request_id)
      onRequestIdRef.current(data.request_id, data.payload)
      return
    }
    
    // Si Sipay envía directamente el request_id
    if (data.request_id) {
      console.log('✅ SipayInline: Direct request_id received!', data.request_id)
      onRequestIdRef.current(data.request_id, data)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    console.log('🎧 SipayInline: Listening for messages...')
    return () => {
      window.removeEventListener('message', handleMessage)
      console.log('🔇 SipayInline: Stopped listening')
    }
  }, [handleMessage])

  const query = new URLSearchParams({
    key: merchantKey,
    amount: String(amount),
    currency,
    template,
    lang,
    env,
  }).toString()
  
  // Construir URL absoluta para evitar que Next.js la resuelva con el prefijo [lang]
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const iframeSrc = `${origin}/fastpay-standalone.html?${query}`

  return (
    <iframe
      src={iframeSrc}
      title="Formulario de pago"
      style={{
        display: 'block',
        width: '100%',
        height: `${height}px`,
        border: 'none',
        minHeight: '500px',
        background: 'transparent',
      }}
      allow="payment"
    />
  )
}
