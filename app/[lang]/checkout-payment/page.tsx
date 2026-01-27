'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Script from 'next/script'

export default function CheckoutPayment() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [testType, setTestType] = useState('iq')
  const [lang, setLang] = useState('es')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [fastpayLoaded, setFastpayLoaded] = useState(false)

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

  const handleFastpayLoad = () => {
    console.log('✅ FastPay script cargado')
    setFastpayLoaded(true)
  }

  useEffect(() => {
    if (paymentData && fastpayLoaded) {
      console.log('🎨 Creando botón de FastPay')
      createFastPayButton()
    }
  }, [paymentData, fastpayLoaded])

  const createFastPayButton = () => {
    const container = document.getElementById('sipay-payment-form')
    if (!container || !paymentData) return

    container.innerHTML = `
      <button 
        class="fastpay-btn" 
        data-key="${paymentData.sipayConfig.key}" 
        data-amount="50" 
        data-currency="EUR" 
        data-template="v4" 
        data-callback="processSipayPayment" 
        data-paymentbutton="Pagar" 
        data-cardholdername="true" 
        data-remember="checkbox" 
        data-remembertext="Recordar tarjeta" 
        data-hiddenprice="false" 
        data-lang="${lang}">
      </button>
    `

    console.log('✅ Botón de FastPay creado')

    // Verificar si FastPay transforma el botón
    setTimeout(() => {
      const iframe = document.querySelector('iframe[src*="sipay"]')
      if (iframe) {
        console.log('✅ Iframe de FastPay detectado')
      } else {
        console.error('❌ Iframe de FastPay NO detectado')
        console.log('Button HTML:', container.innerHTML)
      }
    }, 3000)
  }

  // Callback global para Sipay
  useEffect(() => {
    (window as any).processSipayPayment = async (response: any) => {
      console.log('📨 Callback de FastPay recibido:', response)

      if (response.type === 'success' && response.request_id) {
        console.log('✅ Pago exitoso, procesando...')
        await processPaymentWithRequestId(response.request_id, response)
      } else {
        console.error('❌ Error en el pago:', response)
        setError(response.description || 'Error procesando el pago. Por favor, intenta de nuevo.')
      }
    }
  }, [paymentData])

  const processPaymentWithRequestId = async (requestId: string, sipayResponse: any) => {
    try {
      console.log('💳 Procesando pago con request_id...')

      const testData: any = {}
      const testResultsStr = localStorage.getItem('testResults')
      if (testResultsStr) {
        const testResults = JSON.parse(testResultsStr)
        testData.answers = testResults.answers || []
        testData.timeElapsed = testResults.timeElapsed || 0
        testData.correctAnswers = testResults.correctAnswers || 0
        testData.categoryScores = testResults.categoryScores || {}
      }

      const response = await fetch('/api/sipay/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          requestId: requestId,
          email: email,
          amount: 0.50,
          description: 'Resultado Test MindMetric - ' + email,
          lang: lang,
          sipayData: sipayResponse,
          testData: testData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error procesando el pago')
      }

      console.log('✅ Pago procesado exitosamente:', result)

      // Redirigir a página de resultados
      window.location.href = '/' + lang + '/resultado?order_id=' + paymentData.orderId

    } catch (error: any) {
      console.error('❌ Error:', error)
      setError(error.message || 'Error procesando el pago')
    }
  }

  const config = testConfig[testType] || testConfig['iq']

  return (
    <>
      <Script
        src="https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js"
        onLoad={handleFastpayLoad}
        strategy="afterInteractive"
      />

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
                      <p className="text-gray-600 mb-2">Cargando formulario de pago...</p>
                      <p className="text-xs text-gray-500">Powered by Sipay</p>
                    </div>
                  ) : (
                    <>
                      {/* Email Display */}
                      <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          readOnly
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Resumen del Pedido</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Resultado del Test</span>
                            <span className="font-semibold">0,50€</span>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <span className="text-gray-700 block">Trial Premium (2 días)</span>
                              <span className="text-xs text-gray-500">Después 9,99€/mes</span>
                            </div>
                            <span className="font-semibold text-green-600">GRATIS</span>
                          </div>
                          <div className="border-t-2 pt-3 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total Hoy</span>
                            <span className="text-3xl font-bold text-[#07C59A]">0,50€</span>
                          </div>
                        </div>
                      </div>

                      {/* Sipay Payment Form */}
                      <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 min-h-[400px]">
                        <h4 className="font-bold text-gray-900 mb-4">Datos de la Tarjeta</h4>

                        <div id="sipay-payment-container" className="flex justify-center">
                          <div id="sipay-payment-form" className="w-full min-w-[400px]">
                            {!fastpayLoaded && (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 mb-2">Cargando formulario de pago seguro...</p>
                                <p className="text-xs text-gray-500">Powered by Sipay</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="mt-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            id="terms-checkbox"
                            className="mt-1 w-5 h-5 text-[#07C59A] border-gray-300 rounded focus:ring-[#07C59A]"
                            required
                          />
                          <span className="text-sm text-gray-700">
                            Acepto los <a href={`/${lang}/terminos`} target="_blank" className="text-[#07C59A] underline font-semibold">términos y condiciones</a>.
                            Después del trial de 2 días, se cobrará automáticamente 9,99€/mes. Cancela cuando quieras.
                          </span>
                        </label>
                      </div>

                      {/* Security Badges */}
                      <div className="text-center mt-6">
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-lock text-green-500"></i>
                            <span>Pago 100% Seguro</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-check-circle text-green-500"></i>
                            <span>Protegido por Sipay</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Tus datos están encriptados y protegidos
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Guarantee */}
                <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🛡️</div>
                  <h4 className="font-bold text-yellow-900 mb-2">Garantía de Devolución</h4>
                  <p className="text-sm text-yellow-800">
                    Si no estás satisfecho, te devolvemos tu dinero.
                    <a href={`/${lang}/reembolso`} className="underline font-semibold ml-1">Ver política</a>
                  </p>
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
      </div>

      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </>
  )
}
