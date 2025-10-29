// app/[lang]/checkout/page.tsx
'use client'

import dynamic from 'next/dynamic'

// Solo cargar FastSpring Checkout (único proveedor ahora)
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
  return <FastSpringCheckout />
}
