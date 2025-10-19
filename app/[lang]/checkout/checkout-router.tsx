// app/[lang]/checkout/checkout-router.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import { FaSpinner } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function CheckoutRouter() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userIQ, setUserIQ] = useState<number | null>(null)
  const [status, setStatus] = useState('Inicializando...')
  const [error, setError] = useState('')

  useEffect(() => {
    const initCheckout = async () => {
      try {
        // Cargar datos del usuario
        const storedEmail = localStorage.getItem('userEmail')
        const storedUserName = localStorage.getItem('userName')
        const storedIQ = localStorage.getItem('userIQ')

        if (!storedEmail || !storedIQ) {
          router.push(`/${lang}/test`)
          return
        }

        setEmail(storedEmail)
        setUserName(storedUserName || 'Usuario')
        setUserIQ(parseInt(storedIQ))

        setStatus('Detectando proveedor de pago...')

        // Detectar proveedor de pago
        const configResponse = await fetch('/api/site-config')
        const configData = await configResponse.json()
        
        const provider = configData.config?.payment_provider || 'lemonsqueezy'
        console.log('💳 Proveedor detectado:', provider)

        if (provider === 'lemonsqueezy') {
          setStatus('Preparando checkout con Lemon Squeezy...')
          
          // Crear user temporal
          const userResponse = await fetch('/api/create-user-simple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: storedEmail,
              userName: storedUserName || 'Usuario',
              iq: parseInt(storedIQ)
            })
          })

          if (!userResponse.ok) {
            throw new Error('Error creando usuario')
          }

          const userData = await userResponse.json()
          const userId = userData.userId

          setStatus('Creando checkout seguro...')

          // Crear checkout en Lemon Squeezy
          const checkoutResponse = await fetch('/api/create-lemon-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: storedEmail,
              userId
            })
          })

          if (!checkoutResponse.ok) {
            throw new Error('Error creando checkout')
          }

          const checkoutData = await checkoutResponse.json()

          if (checkoutData.error) {
            throw new Error(checkoutData.error)
          }

          console.log('✅ Checkout creado, redirigiendo:', checkoutData.checkoutUrl)
          setStatus('Redirigiendo a página de pago...')
          
          // Guardar para tracking
          localStorage.setItem('lemonCheckoutId', checkoutData.checkoutId)
          
          // Redirigir al checkout de Lemon Squeezy
          setTimeout(() => {
            window.location.href = checkoutData.checkoutUrl
          }, 500)

        } else {
          // Si es Stripe, redirigir a la página de checkout de Stripe
          setStatus('Redirigiendo a checkout de Stripe...')
          router.push(`/${lang}/checkout-stripe`)
        }

      } catch (error: any) {
        console.error('❌ Error en checkout:', error)
        setError(error.message || 'Error al inicializar el checkout')
        setStatus('Error')
      }
    }

    initCheckout()
  }, [router, lang])

  return (
    <>
      <MinimalHeader email={email} />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t?.checkout?.error || 'Error'}
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push(`/${lang}/resultado-estimado`)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t?.checkout?.tryAgain || 'Volver a intentar'}
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t?.checkout?.preparing || 'Preparando pago...'}
              </h2>
              <p className="text-gray-600 mb-2">{status}</p>
              <p className="text-sm text-gray-500">
                {t?.checkout?.pleaseWait || 'Por favor, espera un momento'}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

