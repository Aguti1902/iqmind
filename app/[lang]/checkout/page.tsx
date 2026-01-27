// app/[lang]/checkout/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function CheckoutPage() {
  const params = useParams()
  const lang = params.lang as string

  useEffect(() => {
    // Obtener datos del localStorage
    const email = localStorage.getItem('userEmail') || ''
    const testType = localStorage.getItem('testType') || 'iq'
    const testResultsStr = localStorage.getItem('testResults') || '{}'
    const userIQ = localStorage.getItem('userIQ') || ''
    const userName = localStorage.getItem('userName') || ''
    
    // Construir objeto de datos del test
    const testData = {
      type: testType,
      results: JSON.parse(testResultsStr),
      iq: userIQ,
      name: userName
    }
    
    // Construir URL del checkout HTML
    const checkoutUrl = `/checkout-full.html?` + new URLSearchParams({
      lang: lang || 'es',
      email: email,
      testType: testType,
      testData: JSON.stringify(testData)
    }).toString()
    
    console.log('🔄 Redirigiendo desde /checkout a checkout HTML:', checkoutUrl)
    
    // Redirigir inmediatamente
    window.location.href = checkoutUrl
  }, [lang])

  // Mostrar loading mientras redirige
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al checkout...</p>
      </div>
    </div>
  )
}
