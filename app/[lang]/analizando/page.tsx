'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'
import { FaCheckCircle } from 'react-icons/fa'

export default function AnalyzingPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [progress, setProgress] = useState(0)
  const [completedCategories, setCompletedCategories] = useState<number[]>([])
  
  // Categorías cognitivas
  const categories = [
    'visualPerception',
    'abstractReasoning',
    'patternRecognition',
    'logicalThinking',
    'spatialIntelligence',
  ]

  useEffect(() => {
    // Verificar que existan los resultados del test
    const testResults = localStorage.getItem('testResults')
    if (!testResults) {
      router.push(`/${lang}/test`)
      return
    }

    // Simular progreso de análisis
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    // Ir completando categorías progresivamente
    const categoryTimers = categories.map((_, index) => {
      return setTimeout(() => {
        setCompletedCategories((prev) => [...prev, index])
      }, 1000 + index * 800) // Cada 800ms después del primer segundo
    })

    // Redirigir después de 6 segundos
    const redirectTimer = setTimeout(() => {
      // Verificar si viene del test premium (usuario ya pagó)
      const isPremiumTest = localStorage.getItem('isPremiumTest')
      
      if (isPremiumTest === 'true') {
        // Usuario premium que hizo test desde dashboard
        localStorage.removeItem('isPremiumTest') // Limpiar flag
        router.push(`/${lang}/resultado`)
      } else {
        // Usuario nuevo que no ha pagado
        router.push(`/${lang}/resultado-estimado`)
      }
    }, 6000)

    return () => {
      clearInterval(progressInterval)
      categoryTimers.forEach(timer => clearTimeout(timer))
      clearTimeout(redirectTimer)
    }
  }, [router, lang])

  if (loading || !t) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Spinner principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center mb-8 animate-fadeIn">
          {/* Spinner grande */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
            <div 
              className="absolute inset-0 border-8 border-[#113240] rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t.analyzing.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {t.analyzing.subtitle}
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#07C59A] to-[#113240] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500">
            {progress < 30 && t.analyzing.analyzing}
            {progress >= 30 && progress < 70 && t.analyzing.calculating}
            {progress >= 70 && t.analyzing.evaluating}
          </p>
        </div>

        {/* Categorías cognitivas */}
        <div className="bg-[#1e293b] rounded-3xl shadow-2xl p-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold text-white text-center mb-6">
            {t.analyzing.categories}
          </h2>
          
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div 
                key={category}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  completedCategories.includes(index) 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-50 translate-x-2'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  completedCategories.includes(index)
                    ? 'bg-[#07C59A] scale-100'
                    : 'bg-gray-600 scale-75'
                }`}>
                  {completedCategories.includes(index) && (
                    <FaCheckCircle className="text-white text-lg animate-fadeIn" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className={`text-lg font-medium transition-colors duration-500 ${
                    completedCategories.includes(index)
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}>
                    {t.analyzing[category]}
                  </p>
                </div>

                {completedCategories.includes(index) && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-[#07C59A] rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje adicional */}
        <div className="text-center mt-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-500">
            {t.analyzing.subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}

