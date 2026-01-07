'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import Footer from '@/components/Footer'
import { FaLock, FaCheckCircle, FaBrain, FaCertificate, FaChartLine, FaUsers, FaSpinner } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function CheckoutWhop() {
  const router = useRouter()
  const { t, loading: tLoading, lang } = useTranslations()
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userIQ, setUserIQ] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [testType, setTestType] = useState<string>('iq')
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  // Configuración de mensajes según el tipo de test
  const testConfig: any = {
    'iq': {
      title: 'Test de CI',
      subtitle: 'Coeficiente Intelectual',
      icon: '🧠',
      description: 'Acceso completo a tu análisis de CI'
    },
    'personality': {
      title: 'Test de Personalidad',
      subtitle: 'Análisis Big Five (OCEAN)',
      icon: '🎯',
      description: 'Descubre los 5 rasgos de tu personalidad'
    },
    'adhd': {
      title: 'Test de TDAH',
      subtitle: 'Evaluación de Atención',
      icon: '🎯',
      description: 'Análisis completo de síntomas de TDAH'
    },
    'anxiety': {
      title: 'Test de Ansiedad',
      subtitle: 'Análisis GAD-7',
      icon: '💙',
      description: 'Evaluación de niveles de ansiedad'
    },
    'depression': {
      title: 'Test de Depresión',
      subtitle: 'Análisis PHQ-9',
      icon: '🌟',
      description: 'Evaluación de síntomas depresivos'
    },
    'eq': {
      title: 'Test de Inteligencia Emocional',
      subtitle: 'Análisis EQ',
      icon: '❤️',
      description: 'Descubre tu inteligencia emocional'
    }
  }

  useEffect(() => {
    const initCheckout = async () => {
      try {
        // Cargar datos del usuario
        const storedEmail = localStorage.getItem('userEmail')
        const storedUserName = localStorage.getItem('userName')
        const storedIQ = localStorage.getItem('userIQ')
        const savedTestType = localStorage.getItem('testType') || 'iq'

        console.log('📊 Tipo de test en checkout:', savedTestType)
        setTestType(savedTestType)

        if (!storedEmail || !storedIQ) {
          router.push(`/${lang}/test`)
          return
        }

        setEmail(storedEmail)
        setUserName(storedUserName || 'Usuario')
        setUserIQ(parseInt(storedIQ))

        // Crear checkout en Whop
        console.log('🛒 Creando checkout en Whop...')
        const response = await fetch('/api/whop/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: storedEmail,
            userName: storedUserName,
            testType: savedTestType,
          }),
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        console.log('✅ Checkout creado:', data.checkoutUrl)
        setCheckoutUrl(data.checkoutUrl)
        setIsLoading(false)

        // Redirigir automáticamente después de 2 segundos
        setTimeout(() => {
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl
          }
        }, 2000)

      } catch (error: any) {
        console.error('❌ Error en checkout:', error)
        setError(error.message || 'Error al inicializar el checkout')
        setIsLoading(false)
      }
    }

    initCheckout()
  }, [router, lang])

  if (tLoading || !t) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#07C59A]"></div>
      </div>
    )
  }

  return (
    <>
      <MinimalHeader email={email} />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12">
        <div className="container-custom max-w-4xl">
          
          {/* Header con icono del test */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">
                {testConfig[testType]?.icon || '🧠'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {testType === 'iq' ? 'Desbloquea tu Resultado de CI' :
               testType === 'personality' ? 'Desbloquea tu Perfil de Personalidad' :
               testType === 'adhd' ? 'Desbloquea tu Evaluación de TDAH' :
               testType === 'anxiety' ? 'Desbloquea tu Evaluación de Ansiedad' :
               testType === 'depression' ? 'Desbloquea tu Evaluación de Depresión' :
               testType === 'eq' ? 'Desbloquea tu Inteligencia Emocional' :
               'Desbloquea tu Resultado'}
            </h1>
            <p className="text-xl text-gray-600">
              {testConfig[testType]?.description || 'Acceso completo a tu análisis'}
            </p>
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            
            {error ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❌</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => router.push(`/${lang}/resultado-estimado`)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Volver a intentar
                </button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Preparando tu checkout...
                </h2>
                <p className="text-gray-600 mb-2">Conectando con Whop</p>
                <p className="text-sm text-gray-500">Por favor, espera un momento</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-green-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ¡Checkout listo!
                </h2>
                <p className="text-gray-600 mb-6">
                  Serás redirigido a la página de pago seguro de Whop
                </p>
                {checkoutUrl && (
                  <a
                    href={checkoutUrl}
                    className="inline-block px-8 py-4 bg-gradient-to-r from-[#07C59A] to-[#059c7e] text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Ir al Pago →
                  </a>
                )}
              </div>
            )}

            {/* Características */}
            {!error && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  ✨ Lo que obtienes:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Prueba gratis 2 días</h4>
                      <p className="text-sm text-gray-600">Solo €0.50 para comenzar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaBrain className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Acceso completo</h4>
                      <p className="text-sm text-gray-600">Todos los tests y resultados</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaChartLine className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Análisis detallado</h4>
                      <p className="text-sm text-gray-600">Gráficos y comparativas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCertificate className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Certificado oficial</h4>
                      <p className="text-sm text-gray-600">Descargable y compartible</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Seguridad */}
          <div className="text-center text-sm text-gray-600 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaLock className="text-gray-400" />
              <span>Pago seguro procesado por Whop</span>
            </div>
            <p>Cancela en cualquier momento durante el trial</p>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

