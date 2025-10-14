'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useTranslations() {
  // Get lang from pathname
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] || 'es'
  
  const [t, setT] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true)
      
      try {
        console.log(`🌐 Loading translations for: ${lang}`)
        
        // First try to get from SSR injected script
        const scriptElement = document.getElementById('translations')
        if (scriptElement && scriptElement.textContent) {
          console.log('✅ Found translations in SSR script')
          const translations = JSON.parse(scriptElement.textContent)
          setT(translations)
          setLoading(false)
          return
        }
        
        // Fallback to fetch
        console.log(`📡 Fetching translations from: /messages/${lang}.json`)
        const response = await fetch(`/messages/${lang}.json?t=${Date.now()}`)
        if (!response.ok) {
          console.error(`❌ Failed to fetch ${lang}.json:`, response.status)
          throw new Error('Failed to load')
        }
        const translations = await response.json()
        console.log('✅ Translations loaded successfully:', Object.keys(translations).length, 'keys')
        setT(translations)
      } catch (error) {
        console.warn(`⚠️ Failed to load ${lang}, falling back to Spanish`, error)
        // Fallback to Spanish
        try {
          const response = await fetch(`/messages/es.json?t=${Date.now()}`)
          if (!response.ok) {
            console.error('❌ Failed to fetch Spanish fallback:', response.status)
            throw new Error('Failed to load Spanish fallback')
          }
          const translations = await response.json()
          console.log('✅ Spanish fallback loaded successfully')
          setT(translations)
        } catch (fallbackError) {
          console.error('❌ Failed to load translations:', fallbackError)
          // Set empty object to prevent crashes
          setT({})
        }
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [lang])

  return { t, loading, lang }
}
