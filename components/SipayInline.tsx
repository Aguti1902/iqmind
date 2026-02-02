'use client'

import { useEffect, useRef, useCallback } from 'react'

/** Orígenes permitidos para postMessage del iframe (mismo sitio + Sipay si algún día enviaran desde su dominio) */
const ALLOWED_ORIGINS = [
  typeof window !== 'undefined' ? window.location.origin : '',
  'https://sandbox.sipay.es',
  'https://live.sipay.es',
]

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
  /** Opcional: ancho del iframe (px o string). Por defecto 430 */
  width?: number | string
  /** Opcional: alto del iframe (px o string). Por defecto 700 */
  height?: number | string
}

/**
 * Componente Next.js (client) que embebe el formulario Sipay FastPay vía iframe
 * apuntando al HTML estático en /public/fastpay-standalone.html.
 * Sin SSR para el pago; la key es la pública (no el Secret).
 */
export default function SipayInline({
  merchantKey,
  amount,
  currency = 'EUR',
  template = 'v4',
  lang = 'es',
  env = 'sandbox',
  onRequestId,
  width = 430,
  height = 700,
}: SipayInlineProps) {
  const onRequestIdRef = useRef(onRequestId)
  onRequestIdRef.current = onRequestId

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = event.data
    if (!data || typeof data !== 'object' || data.type !== 'sipay_fastpay_done') return
    if (typeof data.request_id !== 'string' || !data.request_id.trim()) return

    const origin = event.origin
    const allowed = ALLOWED_ORIGINS.some((o) => o && origin === o)
    if (!allowed && typeof window !== 'undefined' && origin !== window.location.origin) {
      return
    }

    onRequestIdRef.current(data.request_id, data.payload)
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const query = new URLSearchParams({
    key: merchantKey,
    amount: String(amount),
    currency,
    template,
    lang,
    env,
  }).toString()
  const iframeSrc = `/fastpay-standalone.html?${query}`

  return (
    <div
      style={{
        width: '100%',
        maxWidth: typeof width === 'number' ? width : width,
        margin: '0 auto',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <iframe
        src={iframeSrc}
        title="Formulario de pago Sipay"
        style={{
          display: 'block',
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          border: 'none',
        }}
      />
    </div>
  )
}
