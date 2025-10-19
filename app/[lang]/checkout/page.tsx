// app/[lang]/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import CheckoutRouter from './checkout-router'
// Importar el checkout de Stripe dinámicamente
import dynamic from 'next/dynamic'

const StripeCheckout = dynamic(() => import('./checkout-stripe').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando checkout...</p>
      </div>
    </div>
  )
})

export default function CheckoutPage() {
  const [provider, setProvider] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Detectar proveedor
    fetch('/api/site-config')
      .then(r => r.json())
      .then(data => {
        const prov = data.config?.payment_provider || 'lemonsqueezy'
        setProvider(prov)
        setLoading(false)
      })
      .catch(() => {
        setProvider('stripe') // Default a Stripe si falla
        setLoading(false)
      })
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }
  
  // Si es Stripe, mostrar el checkout de Stripe directamente
  if (provider === 'stripe') {
    return <StripeCheckout />
  }
  
  // Si es Lemon Squeezy, usar el router
  return <CheckoutRouter />
}
