'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SipayInline from '@/components/SipayInline'
import GooglePayButton from '@/components/GooglePayButton'
import ApplePayButton from '@/components/ApplePayButton'

// Reseñas de usuarios
const reviews = [
  { name: 'María G.', rating: 5, text: 'Muy profesional y detallado. Me ayudó a entenderme mejor.', country: '🇪🇸' },
  { name: 'Carlos R.', rating: 5, text: 'Resultados precisos y el certificado es muy útil.', country: '🇲🇽' },
  { name: 'Ana P.', rating: 5, text: 'Excelente experiencia, lo recomiendo totalmente.', country: '🇦🇷' },
  { name: 'David M.', rating: 5, text: 'El análisis por categorías es muy completo.', country: '🇨🇴' },
  { name: 'Laura S.', rating: 5, text: 'Rápido, fácil y muy informativo. ¡Gracias!', country: '🇨🇱' },
]

// Deshabilitar pre-rendering estático
export const dynamic = 'force-dynamic'

function CheckoutPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [testType, setTestType] = useState('iq')
  const [lang, setLang] = useState('es')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentReview, setCurrentReview] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'none' | 'card' | 'google' | 'apple'>('none')

  // Auto-rotar reseñas
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const testConfig: any = {
  'iq': {
    title: 'Desbloquea tu Resultado de CI',
    subtitle: 'Acceso completo a tu análisis de CI',
    icon: '🧠'
  },
  'personality': {
    title: 'Desbloquea tu Perfil de Personalidad',
    subtitle: 'Descubre los 5 rasgos de tu personalidad',
    icon: '🎯'
  },
  'adhd': {
    title: 'Desbloquea tu Evaluación de TDAH',
    subtitle: 'Análisis completo de síntomas de TDAH',
    icon: '🎯'
  },
  'anxiety': {
    title: 'Desbloquea tu Evaluación de Ansiedad',
    subtitle: 'Evaluación de niveles de ansiedad',
    icon: '💙'
  },
  'depression': {
    title: 'Desbloquea tu Evaluación de Depresión',
    subtitle: 'Evaluación de síntomas depresivos',
    icon: '🌟'
  },
  'eq': {
    title: 'Desbloquea tu Inteligencia Emocional',
    subtitle: 'Descubre tu inteligencia emocional',
    icon: '❤️'
  }
}

  useEffect(() => {
    const emailParam = searchParams.get('email') || ''
    const testTypeParam = searchParams.get('testType') || 'iq'
    const langParam = searchParams.get('lang') || 'es'

    setEmail(emailParam)
    setTestType(testTypeParam)
    setLang(langParam)

    if (!emailParam) {
      setError('Email no proporcionado')
      setIsLoading(false)
      return
    }

    createPaymentSession(emailParam, testTypeParam, langParam)
  }, [searchParams])

  const createPaymentSession = async (email: string, testType: string, lang: string) => {
    try {
      console.log('💳 Creando sesión de pago...')
  
  // Obtener datos del test desde localStorage
      let testData: any = {}
  const testResultsStr = localStorage.getItem('testResults')
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
      console.error('Error parseando testResults:', error)
    }
  }

    const response = await fetch('/api/sipay/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        userName: email.split('@')[0],
        amount: 0.50,
        userIQ: localStorage.getItem('userIQ') || 100,
        lang: lang,
        testData: testData,
      }),
    })

      const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Error creando el pago')
      }

      console.log('✅ Sesión de pago creada:', data)
      setPaymentData(data)
      setIsLoading(false)

    } catch (error: any) {
      console.error('❌ Error:', error)
      setError(error.message || 'Error cargando el formulario de pago')
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (response: any) => {
    console.log('💳 Pago completado! request_id:', response.request_id)
    
    try {
      // Procesar pago en backend
      const result = await fetch('/api/sipay/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          requestId: response.request_id,
          email: email,
          amount: 0.50,
          lang: lang,
          testType: testType, // Enviar tipo de test para email correcto
        }),
      })

      const data = await result.json()
      console.log('📡 Respuesta backend:', data)
      
    } catch (error: any) {
      console.error('⚠️ Error backend (ignorando):', error)
    }
    
    // Redirigir siempre a resultados
    console.log('🎉 Redirigiendo a resultados...')
    router.push('/' + lang + '/resultado?order_id=' + paymentData.orderId)
  }

  const handlePaymentError = (error: any) => {
    console.error('❌ Error en el pago:', error)
    setError(error.description || 'Error procesando el pago. Por favor, intenta de nuevo.')
  }

  // Handler para Google Pay
  const handleGooglePaySuccess = async (token: string) => {
    console.log('🔍 Google Pay token recibido')
    try {
      const response = await fetch('/api/sipay/google-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googlePayToken: token,
          email,
          userName: email.split('@')[0],
          amount: 0.50,
          userIQ: localStorage.getItem('userIQ') || 100,
          lang,
          testType,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en Google Pay')
      }

      console.log('✅ Google Pay exitoso:', data)
      router.push('/' + lang + '/resultado?order_id=' + data.orderId)
    } catch (error: any) {
      console.error('❌ Error Google Pay:', error)
      setError(error.message || 'Error con Google Pay')
    }
  }

  // Handler para Apple Pay
  const handleApplePaySuccess = async (token: string) => {
    console.log('🍎 Apple Pay token recibido')
    try {
      const response = await fetch('/api/sipay/apple-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applePayToken: token,
          email,
          userName: email.split('@')[0],
          amount: 0.50,
          userIQ: localStorage.getItem('userIQ') || 100,
          lang,
          testType,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en Apple Pay')
      }

      console.log('✅ Apple Pay exitoso:', data)
      router.push('/' + lang + '/resultado?order_id=' + data.orderId)
    } catch (error: any) {
      console.error('❌ Error Apple Pay:', error)
      setError(error.message || 'Error con Apple Pay')
    }
  }

  const config = testConfig[testType] || testConfig['iq']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/FAVICON2.png" alt="MindMetric" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-gray-900">MindMetric</h1>
          </div>
          <div className="text-sm text-gray-600">{email}</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4 text-5xl">
              {config.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {config.title}
            </h1>
            <p className="text-xl text-gray-600">
              {config.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Info */}
            <div className="space-y-6 order-2 lg:order-1">
              {/* Pricing */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-[#07C59A]">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Desbloquea tu Resultado Completo
                  </h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-gray-500 line-through text-2xl">19,99€</span>
                    <span className="text-6xl font-bold text-[#07C59A]">0,50€</span>
                  </div>
                  <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-4">
                    ¡Ahorra 97%!
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-check-circle text-blue-600"></i>
                    Incluye Trial Premium de 2 Días
                  </h4>
                  <p className="text-blue-800 text-sm mb-2">
                    ✅ Acceso completo a todos los tests<br />
                    ✅ Análisis detallado y comparativas<br />
                    ✅ Certificado descargable<br />
                    ✅ Después solo <strong>9,99€/mes</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-3">
                    Cancela en cualquier momento durante el trial
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ¿Qué Obtienes?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-brain text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Resultado Completo</h4>
                      <p className="text-sm text-gray-600">Tu puntuación exacta y análisis detallado</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-chart-line text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Análisis por Categorías</h4>
                      <p className="text-sm text-gray-600">Gráficos y comparativas detalladas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-certificate text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Certificado Oficial</h4>
                      <p className="text-sm text-gray-600">Descargable y compartible</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-users text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Comparación Mundial</h4>
                      <p className="text-sm text-gray-600">Ve cómo te comparas con otros usuarios</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Slider */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>⭐</span> Lo que dicen nuestros usuarios
                </h3>
                <div className="relative overflow-hidden">
                  <div 
                    className="transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentReview * 100}%)` }}
                  >
                    <div className="flex">
                      {reviews.map((review, index) => (
                        <div key={index} className="w-full flex-shrink-0 px-1">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(review.rating)].map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </div>
                              <span className="text-lg">{review.country}</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2 italic">"{review.text}"</p>
                            <p className="text-gray-500 text-xs font-semibold">— {review.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReview(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentReview ? 'bg-[#07C59A]' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="lg:sticky lg:top-8 h-fit order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Pago Seguro
                </h3>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-6">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 mb-2">Inicializando pago...</p>
                  </div>
                ) : paymentData ? (
                  <>
                    {/* Email Display */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-1 text-sm">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-sm"
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">Resumen del Pedido</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Resultado del Test</span>
                          <span className="font-semibold">0,50€</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="text-gray-700 block">Trial Premium (2 días)</span>
                            <span className="text-xs text-gray-500">Después 9,99€/mes</span>
                          </div>
                          <span className="font-semibold text-green-600">GRATIS</span>
                        </div>
                        <div className="border-t-2 pt-2 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Hoy</span>
                          <span className="text-2xl font-bold text-[#07C59A]">0,50€</span>
                        </div>
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-3 text-sm">
                        Selecciona tu método de pago
                      </label>
                      
                      <div className="space-y-2">
                        {/* Google Pay */}
                        <GooglePayButton
                          amount={0.50}
                          currency="EUR"
                          onSuccess={handleGooglePaySuccess}
                          onError={handlePaymentError}
                          env={paymentData.sipayConfig?.endpoint?.includes('live') ? 'live' : 'sandbox'}
                        />

                        {/* Apple Pay */}
                        <ApplePayButton
                          amount={0.50}
                          currency="EUR"
                          onSuccess={handleApplePaySuccess}
                          onError={handlePaymentError}
                        />

                        {/* Separador */}
                        <div className="flex items-center gap-3 py-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-500">o paga con tarjeta</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>

                        {/* Opción Tarjeta */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod(paymentMethod === 'card' ? 'none' : 'card')}
                          className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === 'card' 
                              ? 'border-[#07C59A] bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              paymentMethod === 'card' ? 'border-[#07C59A]' : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'card' && (
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#07C59A]" />
                              )}
                            </div>
                            <i className="fas fa-credit-card text-gray-600 text-sm sm:text-lg"></i>
                            <span className="font-medium text-gray-900 text-sm sm:text-base">Tarjeta</span>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 sm:h-5" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3 sm:h-5" />
                          </div>
                        </button>

                        {/* Formulario de tarjeta desplegable */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          paymentMethod === 'card' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="pt-2">
                            <SipayInline
                              merchantKey={paymentData.sipayConfig?.key || 'clicklabsdigital'}
                              amount={50}
                              currency="EUR"
                              template="v4"
                              lang={lang}
                              env={paymentData.sipayConfig?.endpoint?.includes('live') ? 'live' : 'sandbox'}
                              onRequestId={(requestId, payload) => {
                                console.log('🎉 Payment success! request_id:', requestId)
                                handlePaymentSuccess({ request_id: requestId, ...(typeof payload === 'object' && payload !== null ? payload : {}) })
                              }}
                              height={450}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Badges */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <i className="fas fa-lock text-green-500"></i>
                        <span>Pago 100% Seguro</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <i className="fas fa-shield-alt text-green-500"></i>
                        <span>SSL Encriptado</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <i className="fas fa-credit-card text-green-500"></i>
                        <span>PCI DSS</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Guarantee */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <span className="font-semibold text-yellow-900 text-sm">Garantía de Devolución</span>
                  <a href={`/${lang}/reembolso`} className="text-xs text-yellow-700 underline">Ver política</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© 2026 MindMetric. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  )
}

export default function CheckoutPayment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Cargando checkout...</p>
          <p className="text-xs text-gray-500">Por favor espera</p>
        </div>
      </div>
    }>
      <CheckoutPaymentContent />
    </Suspense>
  )
}
