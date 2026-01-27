'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'

function SipayResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Procesando tu pago...')

  useEffect(() => {
    const requestId = searchParams.get('request_id')
    const orderId = searchParams.get('order_id')

    console.log('📨 Sipay Result - Params:', { requestId, orderId })

    if (!requestId || !orderId) {
      setStatus('error')
      setMessage('Faltan parámetros del pago')
      return
    }

    // Procesar el pago con el request_id
    processPayment(orderId, requestId)
  }, [searchParams])

  const processPayment = async (orderId: string, requestId: string) => {
    try {
      console.log('💳 Procesando pago con request_id:', requestId)

      // Obtener datos del localStorage
      const email = localStorage.getItem('userEmail') || ''
      const lang = localStorage.getItem('userLang') || 'es'

      const response = await fetch('/api/sipay/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          requestId,
          email,
          amount: 0.50, // Monto fijo del pago inicial
          lang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando el pago')
      }

      console.log('✅ Pago procesado exitosamente:', data)

      setStatus('success')
      setMessage('¡Pago completado exitosamente!')

      // Redirigir a la página de resultado después de 2 segundos
      setTimeout(() => {
        // Obtener lang de localStorage o URL
        const lang = localStorage.getItem('userLang') || 'es'
        router.push(`/${lang}/resultado?order_id=${orderId}`)
      }, 2000)

    } catch (error: any) {
      console.error('❌ Error:', error)
      setStatus('error')
      setMessage(error.message || 'Error procesando el pago')
    }
  }

  return (
    <>
      <MinimalHeader email="" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="w-20 h-20 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando Pago</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirigiendo a tus resultados...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error en el Pago</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.back()}
                className="w-full px-6 py-3 bg-[#07C59A] hover:bg-[#06b089] text-white font-semibold rounded-lg transition-colors"
              >
                Volver a Intentar
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function SipayResult() {
  return (
    <Suspense fallback={
      <>
        <MinimalHeader email="" />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando...</h2>
            <p className="text-gray-600">Procesando información del pago</p>
          </div>
        </div>
      </>
    }>
      <SipayResultContent />
    </Suspense>
  )
}

