'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import Footer from '@/components/Footer'
import { FaLock, FaCheckCircle, FaBrain, FaCertificate, FaChartLine, FaUsers } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

// Declarar tipos globales para FastSpring
declare global {
  interface Window {
    fastspring?: {
      builder: {
        push: (data: any) => void
        checkout: (config?: any) => void
        recognize: (callbacks: any) => void
        reset: () => void
        secure: (payloadRequest: any, payloadResponse: any) => void
      }
    }
  }
}

export default function FastSpringCheckout() {
  const router = useRouter()
  const { t, loading: tLoading, lang } = useTranslations()
  const [email, setEmail] = useState('')
  const [userIQ, setUserIQ] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [emailError, setEmailError] = useState('')

  // Cargar script de FastSpring
  useEffect(() => {
    const existingScript = document.querySelector('[data-fsc-api-key]')
    if (existingScript) {
      setIsReady(true)
      return
    }

    console.log('🔄 Cargando FastSpring SDK...')
    const script = document.createElement('script')
    script.src = 'https://d1f8f9xcsvx3ha.cloudfront.net/sbl/0.8.7/fastspring-builder.min.js'
    script.type = 'text/javascript'
    script.id = 'fsc-api'
    script.dataset.storefront = process.env.NEXT_PUBLIC_FASTSPRING_STOREFRONT || ''
    script.dataset.continuous = 'true'
    script.dataset.debug = 'true' // Remover en producción
    
    script.onload = () => {
      console.log('✅ FastSpring SDK loaded')
      setIsReady(true)
    }
    
    script.onerror = () => {
      console.error('❌ Error cargando FastSpring SDK')
      setErrorMessage('Error cargando sistema de pago. Intenta recargar la página.')
    }
    
    document.body.appendChild(script)
    
    return () => {
      const scriptToRemove = document.getElementById('fsc-api')
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove)
      }
    }
  }, [])

  // Cargar datos del usuario desde localStorage
  useEffect(() => {
    const iq = localStorage.getItem('userIQ')
    const savedEmail = localStorage.getItem('userEmail')
    const name = localStorage.getItem('userName')
    
    if (!iq) {
      router.push(`/${lang}/test`)
    } else {
      setUserIQ(parseInt(iq))
      if (savedEmail) setEmail(savedEmail)
      if (name) setUserName(name)
    }
  }, [router, lang])

  // Configurar callbacks de FastSpring
  useEffect(() => {
    if (!isReady || !window.fastspring) return

    console.log('🔧 Configurando callbacks de FastSpring...')

    const onPopupClosed = (data: any) => {
      console.log('🚪 Popup de FastSpring cerrado', data)
      setIsProcessing(false)
      
      // Si hay orden completada
      if (data && data.id) {
        console.log('✅ Orden completada:', data.id)
        handleOrderCompleted(data)
      } else {
        console.log('❌ Popup cerrado sin completar orden')
      }
    }

    const onDataReceived = (data: any) => {
      console.log('📦 Datos recibidos de FastSpring:', data)
      
      // Cuando se completa una orden
      if (data && data.id && data.reference) {
        console.log('✅ Orden confirmada:', data.reference)
        handleOrderCompleted(data)
      }
    }

    const onErrorOccurred = (code: number, message: string) => {
      console.error('❌ Error de FastSpring:', code, message)
      setErrorMessage(`Error en el pago: ${message}`)
      setIsProcessing(false)
    }

    // Registrar callbacks
    window.fastspring.builder.recognize({
      onPopupClosed: onPopupClosed,
      onData: onDataReceived,
      onError: onErrorOccurred
    })

  }, [isReady])

  const handleOrderCompleted = async (orderData: any) => {
    console.log('💾 Procesando orden completada...', orderData)
    setIsProcessing(true)

    try {
      // Obtener datos del test desde localStorage
      const testResultsStr = localStorage.getItem('testResults')
      let testData = {}
      
      if (testResultsStr) {
        try {
          const testResults = JSON.parse(testResultsStr)
          testData = {
            answers: testResults.answers || [],
            timeElapsed: testResults.timeElapsed || 0,
            correctAnswers: testResults.correctAnswers || 0,
            categoryScores: testResults.categoryScores || {}
          }
        } catch (error) {
          console.error('❌ Error parseando testResults:', error)
        }
      }

      // Llamar a tu backend para procesar la orden
      const response = await fetch('/api/fastspring-process-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.id,
          reference: orderData.reference,
          email: email,
          userName: userName,
          userIQ: userIQ,
          lang: lang,
          testData: testData
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Orden procesada correctamente')
        localStorage.setItem('fastspringOrderId', orderData.id)
        localStorage.setItem('paymentCompleted', 'true')
        
        // Redirigir a resultados
        router.push(`/${lang}/resultado`)
      } else {
        console.error('❌ Error procesando orden:', result.error)
        setErrorMessage(result.error || 'Error procesando el pago')
        setIsProcessing(false)
      }

    } catch (error: any) {
      console.error('❌ Error crítico procesando orden:', error)
      setErrorMessage('Error procesando el pago. Contacta con soporte.')
      setIsProcessing(false)
    }
  }

  const handleCheckout = () => {
    if (!isReady || !window.fastspring) {
      setErrorMessage('Sistema de pago no disponible. Recarga la página.')
      return
    }

    if (!email || !email.includes('@')) {
      setEmailError('Por favor ingresa un email válido')
      return
    }

    if (!agreedToTerms) {
      setErrorMessage(t?.checkout?.termsRequired || 'Debes aceptar los términos y condiciones')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')
    setEmailError('')

    console.log('🚀 Abriendo checkout de FastSpring...')
    console.log('📧 Email:', email)
    console.log('👤 User:', userName)
    console.log('🧠 IQ:', userIQ)

    try {
      // Configurar datos del usuario
      window.fastspring.builder.reset()
      
      window.fastspring.builder.push({
        'contact': {
          'email': email,
          'firstName': userName || 'Usuario'
        },
        'tags': {
          'lang': lang,
          'userIQ': userIQ?.toString() || '',
          'userName': userName,
          'email': email
        },
        'products': [
          {
            'path': 'iqmind-premium-access', // Tu producto en FastSpring
            'quantity': 1
          }
        ]
      })

      // Abrir popup del checkout
      window.fastspring.builder.checkout()
      
      console.log('✅ Popup de FastSpring abierto')

    } catch (error: any) {
      console.error('❌ Error abriendo checkout:', error)
      setErrorMessage('Error abriendo el checkout. Intenta de nuevo.')
      setIsProcessing(false)
    }
  }

  if (tLoading || !t) {
    return (
      <>
        <MinimalHeader email={email} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MinimalHeader email={email} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
              <FaLock className="text-4xl text-yellow-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.checkout.almostReady}
            </h1>
            <p className="text-xl text-gray-600">
              {t.checkout.unlockScore}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Columna Izquierda - Información */}
            <div className="space-y-6 order-2 lg:order-1">
              
              {/* Precio Destacado */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-[#218B8E]">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t.checkout.unlockComplete}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-gray-500 line-through text-2xl">{t.checkout.originalPrice}</span>
                    <span className="text-6xl font-bold text-[#218B8E]">{t.checkout.currentPrice}</span>
                  </div>
                  <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-4">
                    {t.checkout.save97}
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600" />
                    {t.checkout.premiumTrialTitle}
                  </h4>
                  <p className="text-blue-800 text-sm mb-2">
                    {t.checkout.premiumFeature1}<br/>
                    {t.checkout.premiumFeature2}<br/>
                    {t.checkout.premiumFeature3}<br/>
                    {t.checkout.premiumFeature4} <strong>{t.checkout.premiumFeature4Price}</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-3">
                    {t.checkout.cancelAnytimeNote}
                  </p>
                </div>
              </div>

              {/* Qué Obtendrás */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t.checkout.whatYouGetTitle}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaBrain className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{t.checkout.feature1Title}</h4>
                      <p className="text-sm text-gray-600">{t.checkout.feature1Desc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaChartLine className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{t.checkout.feature2Title}</h4>
                      <p className="text-sm text-gray-600">{t.checkout.feature2Desc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCertificate className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{t.checkout.feature3Title}</h4>
                      <p className="text-sm text-gray-600">{t.checkout.feature3Desc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUsers className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{t.checkout.feature4Title}</h4>
                      <p className="text-sm text-gray-600">{t.checkout.feature4Desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confianza */}
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                  <h4 className="font-bold text-green-900">{t.checkout.trustTitle}</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>{t.checkout.trustPoint1}</li>
                  <li>{t.checkout.trustPoint2}</li>
                  <li>{t.checkout.trustPoint3}</li>
                  <li>{t.checkout.trustPoint4}</li>
                  <li>{t.checkout.trustPoint5}</li>
                </ul>
              </div>
            </div>

            {/* Columna Derecha - Formulario */}
            <div className="lg:sticky lg:top-8 h-fit order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {t.checkout.title}
                </h3>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    {t.contact.email}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailError('')
                      }}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#218B8E] focus:border-transparent"
                      required
                    />
                    <FaLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  {emailError && (
                    <p className="text-red-600 text-sm mt-2">{emailError}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t.checkout.emailHelper}
                  </p>
                </div>

                {/* Resumen */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4">{t.checkout.orderSummary}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">{t.checkout.item}</span>
                      <span className="font-semibold">0,50€</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <span className="text-gray-700 block">{t.checkout.trialTitle}</span>
                        <span className="text-xs text-gray-500">{t.checkout.afterTrial}</span>
                      </div>
                      <span className="font-semibold text-green-600">{t.checkout.free}</span>
                    </div>
                    <div className="border-t-2 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t.checkout.total}</span>
                      <span className="text-3xl font-bold text-[#218B8E]">0,50€</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-6">
                    {errorMessage}
                  </div>
                )}

                {/* Términos */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-[#218B8E] border-gray-300 rounded focus:ring-[#218B8E]"
                    />
                    <span className="text-sm text-gray-700">
                      {t.checkout.acceptTerms} <a href={`/${lang}/terminos`} target="_blank" className="text-[#218B8E] underline font-semibold">{t.checkout.termsAndConditions}</a>. 
                      {t.checkout.trialNote}
                    </span>
                  </label>
                </div>

                {/* Botón de Pago */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !isReady || !agreedToTerms || !email}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                    isProcessing || !isReady || !agreedToTerms || !email
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#031C43] text-white hover:bg-[#052547] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : !isReady ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Cargando...
                    </>
                  ) : (
                    <>
                      <FaLock />
                      {t.checkout.paySecure}
                    </>
                  )}
                </button>

                {/* Badges de Seguridad */}
                <div className="text-center mt-6">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <FaLock className="text-green-500" />
                      <span>SSL Seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCheckCircle className="text-green-500" />
                      <span>FastSpring Secure</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Pago procesado por FastSpring - Merchant of Record
                  </p>
                </div>
              </div>

              {/* Garantía */}
              <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">🛡️</div>
                <h4 className="font-bold text-yellow-900 mb-2">{t.notices.guaranteeTitle}</h4>
                <p className="text-sm text-yellow-800">
                  {t.notices.guaranteeMessage}{' '}
                  <a href={`/${lang}/reembolso`} className="underline font-semibold ml-1">{t.notices.viewPolicy}</a>
                </p>
              </div>
            </div>
          </div>

          {/* Testimonios Rápidos */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                  {t.checkout.testimonial1Name?.split(' ').map((n: string) => n[0]).join('') || 'AB'}
                </div>
                <div>
                  <h5 className="font-semibold">{t.checkout.testimonial1Name}</h5>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {t.checkout.testimonial1Text}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                  {t.checkout.testimonial2Name?.split(' ').map((n: string) => n[0]).join('') || 'CD'}
                </div>
                <div>
                  <h5 className="font-semibold">{t.checkout.testimonial2Name}</h5>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {t.checkout.testimonial2Text}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                  {t.checkout.testimonial3Name?.split(' ').map((n: string) => n[0]).join('') || 'EF'}
                </div>
                <div>
                  <h5 className="font-semibold">{t.checkout.testimonial3Name}</h5>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {t.checkout.testimonial3Text}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

