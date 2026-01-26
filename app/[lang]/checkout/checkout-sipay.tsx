'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import Footer from '@/components/Footer'
import { FaLock, FaCheckCircle, FaBrain, FaCertificate, FaChartLine, FaUsers } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function CheckoutSipay() {
  const router = useRouter()
  const { t, loading: tLoading, lang } = useTranslations()
  const [email, setEmail] = useState('')
  const [userIQ, setUserIQ] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [testType, setTestType] = useState<string>('iq')

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
    const iq = localStorage.getItem('userIQ')
    const savedEmail = localStorage.getItem('userEmail')
    const name = localStorage.getItem('userName')
    const savedTestType = localStorage.getItem('testType') || 'iq'
    
    setTestType(savedTestType)
    
    if (!iq) {
      router.push(`/${lang}/test`)
    } else {
      setUserIQ(parseInt(iq))
      if (savedEmail) setEmail(savedEmail)
      if (name) setUserName(name)
    }
  }, [router, lang])

  // Cargar SDK de Sipay y crear formulario de pago
  useEffect(() => {
    if (!email || !userIQ) return

    const loadSipayPayment = async () => {
      try {
        console.log('💳 Cargando formulario de pago Sipay...')

        // Obtener datos del test
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
            console.error('Error parseando testResults:', error)
          }
        }

        // Crear sesión de pago en el backend
        const response = await fetch('/api/sipay/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userName,
            amount: 0.50,
            userIQ,
            lang,
            testData,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error creando el pago')
        }

        console.log('✅ Sesión de pago creada:', data)

        // Definir función callback global ANTES de crear el botón
        ;(window as any).processSipayPayment = async (response: any) => {
          console.log('📨 Respuesta de Sipay FastPay:', response)
          
          if (response.type === 'success' && response.request_id) {
            await processPaymentWithRequestId(data.orderId, response.request_id, data.amount, response)
          } else {
            setError(response.description || 'Error capturando los datos de la tarjeta')
            setIsProcessing(false)
          }
        }

        // Primero crear el botón en el DOM
        initializeSipayButton(data)

        // Luego cargar FastPay SDK (detectará el botón automáticamente)
        if (typeof window !== 'undefined') {
          const existingScript = document.querySelector('script[src*="fastpay.js"]')
          
          if (!existingScript) {
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.src = data.sipayConfig.endpoint.includes('sandbox')
              ? 'https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js'
              : 'https://live.sipay.es/fpay/v1/static/bundle/fastpay.js'
            script.async = false // Cambiar a síncrono para asegurar que se cargue
            script.onload = () => {
              console.log('✅ FastPay SDK cargado y botón inicializado')
            }
            script.onerror = () => {
              console.error('❌ Error cargando FastPay SDK')
              setError('Error cargando el sistema de pago. Por favor recarga la página.')
            }
            document.body.appendChild(script)
          } else {
            console.log('✅ FastPay SDK ya estaba cargado')
          }
        }
        
        
      } catch (error: any) {
        console.error('Error:', error)
        setError(error.message || 'Error cargando el formulario de pago')
      }
    }

    const initializeSipayButton = (data: any) => {
      // Crear botón de pago de Sipay con FastPay
      const container = document.getElementById('sipay-payment-form')
      if (!container) {
        console.error('❌ Contenedor sipay-payment-form no encontrado')
        return
      }

      // Limpiar contenedor
      container.innerHTML = ''

      // Crear botón con atributos data-* (FastPay lo detectará automáticamente)
      const button = document.createElement('button')
      button.type = 'button' // Importante: tipo button
      button.id = 'sipay-fastpay-button'
      button.setAttribute('data-key', data.sipayConfig.key)
      button.setAttribute('data-amount', Math.round(data.amount * 100).toString()) // En centavos
      button.setAttribute('data-currency', 'EUR')
      button.setAttribute('data-template', 'v4')
      button.setAttribute('data-callback', 'processSipayPayment')
      button.setAttribute('data-lang', lang || 'es')
      button.setAttribute('data-cardholdername', 'true')
      button.setAttribute('data-paymentbutton', 'Pagar Ahora')
      button.setAttribute('data-hiddenprice', 'false') // Mostrar precio
      button.className = 'w-full py-4 bg-[#07C59A] text-white rounded-xl font-bold text-lg hover:bg-[#06b489] transition-all duration-200 cursor-pointer'
      button.textContent = `Pagar ${data.amount.toFixed(2)}€`

      container.appendChild(button)
      
      console.log('✅ Botón FastPay creado:', {
        key: data.sipayConfig.key,
        amount: Math.round(data.amount * 100),
        currency: 'EUR',
        callback: 'processSipayPayment'
      })
    }

    const processPaymentWithRequestId = async (orderId: string, requestId: string, amount: number, sipayResponse: any) => {
      setIsProcessing(true)
      setError('')

      try {
        console.log('💳 Procesando pago con request_id...')

        const response = await fetch('/api/sipay/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            cardToken: requestId, // FastPay devuelve request_id que usamos como token
            email,
            amount,
            description: `Resultado Test MindMetric - ${email}`,
            lang,
            sipayData: sipayResponse
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Error procesando el pago')
        }

        console.log('✅ Pago procesado exitosamente:', result)
        
        // Guardar en localStorage
        localStorage.setItem('paymentCompleted', 'true')
        localStorage.setItem('transactionId', result.transactionId)

        // Redirigir a resultado
        router.push(`/${lang}/resultado?order_id=${orderId}`)

      } catch (error: any) {
        console.error('Error:', error)
        setError(error.message || 'Error procesando el pago')
        setIsProcessing(false)
      }
    }

    const initializeSipayForm_OLD = (data: any) => {
      try {
        const SipayClass = (window as any).Sipay
        
        if (!SipayClass) {
          throw new Error('SDK de Sipay no cargado')
        }

        // Configurar Sipay
        const sipayConfig = {
          key: data.sipayConfig.key,
          resource: data.sipayConfig.resource,
          amount: Math.round(data.amount * 100), // Convertir a centavos
          currency: data.currency || 'EUR',
          order_id: data.orderId,
          customer_email: email,
          language: lang === 'es' ? 'es' : lang === 'en' ? 'en' : 'es',
          environment: data.sipayConfig.endpoint.includes('sandbox') ? 'sandbox' : 'live'
        }

        console.log('🔧 Configurando Sipay:', sipayConfig)

        const sipay = new SipayClass(sipayConfig)

        // Renderizar formulario en el contenedor
        const container = document.getElementById('sipay-payment-form')
        if (container) {
          container.innerHTML = '' // Limpiar contenedor
          sipay.render('sipay-payment-form')
        }

        // Escuchar evento de token
        sipay.on('token', async (token: string) => {
          console.log('✅ Token recibido de Sipay')
          await processPaymentWithToken(data.orderId, token, data.amount)
        })

        // Escuchar errores
        sipay.on('error', (error: any) => {
          console.error('❌ Error de Sipay:', error)
          setError(error.message || 'Error procesando el pago')
          setIsProcessing(false)
        })

      } catch (error: any) {
        console.error('Error inicializando Sipay:', error)
        setError('Error cargando el formulario de pago. Por favor recarga la página.')
      }
    }

    const processPaymentWithToken = async (orderId: string, cardToken: string, amount: number) => {
      setIsProcessing(true)
      setError('')

      try {
        console.log('💳 Procesando pago con token...')

        const response = await fetch('/api/sipay/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            cardToken,
            email,
            amount,
            description: `Resultado Test MindMetric - ${email}`,
            lang,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Error procesando el pago')
        }

        console.log('✅ Pago procesado exitosamente:', result)
        
        // Guardar en localStorage
        localStorage.setItem('paymentCompleted', 'true')
        localStorage.setItem('transactionId', result.transactionId)

        // Redirigir a resultado
        router.push(`/${lang}/resultado?order_id=${orderId}`)

      } catch (error: any) {
        console.error('Error:', error)
        setError(error.message || 'Error procesando el pago')
        setIsProcessing(false)
      }
    }

    loadSipayPayment()
  }, [email, userIQ, userName, lang, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      setError(t?.checkout?.termsRequired || 'Debes aceptar los términos y condiciones')
      return
    }

    if (!email) {
      setError('Por favor ingresa tu email')
      return
    }

    setError('')

    try {
      // Guardar email en localStorage
      localStorage.setItem('userEmail', email)
      if (userName) localStorage.setItem('userName', userName)

      // El pago se procesa cuando el usuario ingresa los datos de la tarjeta
      // y Sipay dispara el evento 'token'
      console.log('📝 Email guardado. Esperando datos de tarjeta...')
      
      // Mostrar mensaje al usuario
      setError('Por favor ingresa los datos de tu tarjeta arriba')

    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Error procesando el pago')
    }
  }

  if (tLoading || !t) {
    return (
      <>
        <MinimalHeader email={email} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4 text-5xl">
              {testConfig[testType]?.icon || '🧠'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {testType === 'iq' ? 'Desbloquea tu Resultado de CI' :
               testType === 'personality' ? 'Desbloquea tu Perfil de Personalidad' :
               testType === 'adhd' ? 'Desbloquea tu Evaluación de TDAH' :
               testType === 'anxiety' ? 'Desbloquea tu Evaluación de Ansiedad' :
               testType === 'depression' ? 'Desbloquea tu Evaluación de Depresión' :
               testType === 'eq' ? 'Desbloquea tu Inteligencia Emocional' :
               t.checkout.almostReady}
            </h1>
            <p className="text-xl text-gray-600">
              {testConfig[testType]?.description || t.checkout.unlockScore}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Columna Izquierda - Información */}
            <div className="space-y-6 order-2 lg:order-1">
              
              {/* Precio Destacado */}
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
                    <FaCheckCircle className="text-blue-600" />
                    Incluye Trial Premium de 2 Días
                  </h4>
                  <p className="text-blue-800 text-sm mb-2">
                    ✅ Acceso completo a todos los tests<br/>
                    ✅ Análisis detallado y comparativas<br/>
                    ✅ Certificado descargable<br/>
                    ✅ Después solo <strong>9,99€/mes</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-3">
                    Cancela en cualquier momento durante el trial
                  </p>
                </div>
              </div>

              {/* Características */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ¿Qué Obtienes?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaBrain className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Resultado Completo</h4>
                      <p className="text-sm text-gray-600">Tu puntuación exacta y análisis detallado</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaChartLine className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Análisis por Categorías</h4>
                      <p className="text-sm text-gray-600">Gráficos y comparativas detalladas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCertificate className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Certificado Oficial</h4>
                      <p className="text-sm text-gray-600">Descargable y compartible</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#07C59A] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUsers className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Comparación Mundial</h4>
                      <p className="text-sm text-gray-600">Ve cómo te comparas con otros usuarios</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Formulario */}
            <div className="lg:sticky lg:top-8 h-fit order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Pago Seguro
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07C59A] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Resumen */}
                  <div className="bg-gray-50 rounded-xl p-6">
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

                  {/* Formulario de Pago de Sipay */}
                  <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 min-h-[350px]">
                    <h4 className="font-bold text-gray-900 mb-4">Datos de la Tarjeta</h4>
                    <div id="sipay-payment-form">
                      {/* Aquí se cargará el formulario de Sipay */}
                      <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 mb-2">Cargando formulario de pago seguro...</p>
                        <p className="text-xs text-gray-500">Powered by Sipay</p>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Términos */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 text-[#07C59A] border-gray-300 rounded focus:ring-[#07C59A]"
                      />
                      <span className="text-sm text-gray-700">
                        Acepto los <a href={`/${lang}/terminos`} target="_blank" className="text-[#07C59A] underline font-semibold">términos y condiciones</a>. 
                        Después del trial de 2 días, se cobrará automáticamente 9,99€/mes. Cancela cuando quieras.
                      </span>
                    </label>
                  </div>

                  {/* Botón de Pago - OCULTO: FastPay maneja el pago */}
                  {/* El botón de FastPay se muestra arriba en #sipay-payment-form */}
                  <button
                    type="submit"
                    disabled={isProcessing || !agreedToTerms}
                    className="hidden"
                    style={{ display: 'none' }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaLock />
                        Pagar 0,50€ Ahora
                      </>
                    )}
                  </button>

                  {/* Badges de Seguridad */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <FaLock className="text-green-500" />
                        <span>Pago 100% Seguro</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCheckCircle className="text-green-500" />
                        <span>Protegido por Sipay</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Tus datos están encriptados y protegidos
                    </p>
                  </div>
                </form>
              </div>

              {/* Garantía */}
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

      <Footer />
    </>
  )
}

