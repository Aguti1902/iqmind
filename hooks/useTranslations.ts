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
        // First try to get from SSR injected script
        const scriptElement = document.getElementById('translations')
        if (scriptElement && scriptElement.textContent) {
          const translations = JSON.parse(scriptElement.textContent)
          setT(translations)
          setLoading(false)
          return
        }
        
        // Fallback to fetch
        const response = await fetch(`/messages/${lang}.json?t=${Date.now()}`)
        if (!response.ok) throw new Error('Failed to load')
        const translations = await response.json()
        setT(translations)
      } catch (error) {
        console.warn(`Failed to load ${lang}, falling back to Spanish`)
        // Fallback to Spanish
        try {
          const response = await fetch(`/messages/es.json?t=${Date.now()}`)
          const translations = await response.json()
          setT(translations)
        } catch (fallbackError) {
          console.error('Failed to load translations:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [lang])

  return { t, loading, lang }
}
