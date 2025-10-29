// app/[lang]/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import CheckoutRouter from './checkout-router'
// Importar checkouts dinámicamente
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

const FastSpringCheckout = dynamic(() => import('./checkout-fastspring').then(mod => ({ default: mod.default })), {
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
        const prov = data.config?.payment_provider || 'fastspring' // Default a FastSpring
        setProvider(prov)
        setLoading(false)
        console.log('💳 Payment provider:', prov)
      })
      .catch(() => {
        setProvider('fastspring') // Default a FastSpring si falla
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
  
  // Seleccionar checkout según el proveedor configurado
  if (provider === 'stripe') {
    return <StripeCheckout />
  }
  
  if (provider === 'fastspring') {
    return <FastSpringCheckout />
  }
  
  // Si es Lemon Squeezy, usar el router
  return <CheckoutRouter />
}
