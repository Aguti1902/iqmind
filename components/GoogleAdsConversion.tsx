'use client'

import { useEffect } from 'react'

interface GoogleAdsConversionProps {
  conversionLabel?: string
  conversionValue?: number
}

export default function GoogleAdsConversion({ 
  conversionLabel = 'default',
  conversionValue = 0.50 
}: GoogleAdsConversionProps) {
  useEffect(() => {
    // Verificar si gtag está disponible
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('🎯 Disparando conversión de Google Ads')
      
      // Disparar evento de conversión
      window.gtag('event', 'conversion', {
        'send_to': `AW-17655739355/${conversionLabel}`,
        'value': conversionValue,
        'currency': 'EUR',
        'transaction_id': `txn_${Date.now()}`
      })
      
      console.log('✅ Conversión enviada a Google Ads')
    } else {
      console.warn('⚠️ gtag no disponible')
    }
  }, [conversionLabel, conversionValue])

  return null
}

// Declaración de tipos para gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

