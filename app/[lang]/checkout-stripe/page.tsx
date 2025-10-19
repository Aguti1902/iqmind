// app/[lang]/checkout-stripe/page.tsx
// Redirige al checkout original que maneja tanto Stripe como Lemon Squeezy

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'

export default function CheckoutStripePage() {
  const router = useRouter()
  const { lang } = useTranslations()
  
  useEffect(() => {
    // Redirigir al checkout principal
    router.replace(`/${lang}/checkout`)
  }, [router, lang])
  
  return null
}

