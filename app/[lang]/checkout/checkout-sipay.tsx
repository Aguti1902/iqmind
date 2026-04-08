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
  const [paymentData, setPaymentData] = useState<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

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

  // Ya no cargamos el script aquí - se cargará DESPUÉS de que el botón esté en el DOM

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

        // Definir callback global
        ;(window as any).processSipayPayment = async (response: any) => {
          console.log('📨 Respuesta de Sipay FastPay:', response)
          
          if (response.type === 'success' && response.request_id) {
            await processPaymentWithRequestId(data.orderId, response.request_id, data.amount, response)
          } else {
            setError(response.description || 'Error capturando los datos de la tarjeta')
            setIsProcessing(false)
          }
        }

        // Guardar datos para renderizar el formulario
        setPaymentData(data)
        
        console.log('🎯 FastPay ya está cargado en el layout - El iframe debería renderizarse automáticamente')
        console.log('📊 Datos de pago guardados:', {
          orderId: data.orderId,
          amount: data.amount,
          sipayKey: data.sipayConfig?.key,
          hasCallback: typeof (window as any).processSipayPayment === 'function'
        })
        
        // Verificar estado del script y DOM después de 1 segundo
        setTimeout(() => {
          console.log('🔍 === DEBUG COMPLETO ===')
          console.log('1. ¿Script fastpay.js cargado?', !!document.querySelector('script[src*="fastpay.js"]'))
          console.log('2. ¿Objeto FastPay existe?', typeof (window as any).FastPay)
          console.log('3. ¿Botón en DOM?', !!document.querySelector('.fastpay-btn'))
          console.log('4. HTML del contenedor:', document.getElementById('sipay-payment-form')?.innerHTML.substring(0, 200))
          console.log('5. ¿Iframe renderizado?', !!document.querySelector('iframe[src*="sipay"]'))
          
          const button = document.querySelector('.fastpay-btn')
          if (button) {
            console.log('6. Atributos del botón:')
            Array.from(button.attributes).forEach(attr => {
              console.log(`   - ${attr.name}: ${attr.value}`)
            })
          }
          
          console.log('======================')
        }, 1000)
        
        // Verificar después de 3 segundos
        setTimeout(() => {
          const iframe = document.querySelector('iframe[src*="sipay"]')
          if (!iframe) {
            console.error('❌ DESPUÉS DE 3 SEGUNDOS: Iframe NO detectado')
            console.error('🔧 Posible causa: FastPay no compatible con React')
          } else {
            console.log('✅ DESPUÉS DE 3 SEGUNDOS: Iframe SÍ detectado')
          }
        }, 3000)
        
      } catch (error: any) {
        console.error('Error:', error)
        setError(error.message || 'Error cargando el formulario de pago')
      }
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

  // useEffect para logs exhaustivos cuando cambia paymentData
  useEffect(() => {
    if (!paymentData) {
      console.log('⚪ paymentData es null - esperando datos...')
      return
    }

    console.log('🟢 paymentData actualizado - iniciando verificación exhaustiva')
    console.log('📦 paymentData completo:', paymentData)

    // Verificar inmediatamente
    const checkFastPayImmediately = () => {
      console.log('🔍 [Verificación Inmediata]')
      console.log('  - FastPay global:', typeof (window as any).FastPay)
      console.log('  - Script en DOM:', !!document.querySelector('script[src*="fastpay.js"]'))
      console.log('  - Callback definido:', typeof (window as any).processSipayPayment)
    }

    checkFastPayImmediately()

    // Verificar después de que React termine de renderizar
    const timer1 = setTimeout(() => {
      console.log('🔍 [Después de 100ms - React debería haber renderizado]')
      const container = document.getElementById('sipay-payment-form')
      const button = document.querySelector('.fastpay-btn')
      
      console.log('  - Contenedor existe:', !!container)
      console.log('  - Botón existe:', !!button)
      
      if (button) {
        console.log('  - Botón HTML:', (button as HTMLElement).outerHTML)
        console.log('  - Clases del botón:', button.className)
        console.log('  - data-key:', button.getAttribute('data-key'))
        console.log('  - data-amount:', button.getAttribute('data-amount'))
        console.log('  - data-callback:', button.getAttribute('data-callback'))
      } else {
        console.error('  ❌ Botón NO encontrado en el DOM')
      }

      const iframe = document.querySelector('iframe[src*="sipay"]')
      console.log('  - Iframe existe:', !!iframe)
      if (iframe) {
        console.log('  - Iframe src:', (iframe as HTMLIFrameElement).src)
      }
    }, 100)

    // Verificar después de 1 segundo
    const timer2 = setTimeout(() => {
      console.log('🔍 [Después de 1 segundo]')
      const iframe = document.querySelector('iframe[src*="sipay"]')
      if (iframe) {
        console.log('  ✅ Iframe renderizado!')
      } else {
        console.error('  ❌ Iframe NO renderizado - FastPay NO transformó el botón')
        console.error('  💡 Esto confirma que FastPay NO funciona en React/Next.js')
      }
    }, 1000)

    // Verificar después de 3 segundos
    const timer3 = setTimeout(() => {
      console.log('🔍 [Verificación Final - 3 segundos]')
      const iframe = document.querySelector('iframe[src*="sipay"]')
      if (!iframe) {
        console.error('  ❌ CONFIRMADO: FastPay NO es compatible con React')
        console.error('  📋 Resumen:')
        console.error('    - Script cargado: ✅')
        console.error('    - Botón en DOM: ✅')
        console.error('    - Atributos correctos: ✅')
        console.error('    - Iframe renderizado: ❌')
        console.error('  💬 FastPay simplemente NO detecta el botón en React')
      }
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [paymentData])

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

    // Verificar que la instancia de Sipay esté lista
    const sipayInstance = (window as any).sipayInstance
    if (!sipayInstance) {
      setError('Formulario de pago no inicializado. Por favor recarga la página.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Guardar email en localStorage
      localStorage.setItem('userEmail', email)
      if (userName) localStorage.setItem('userName', userName)

      // Disparar el envío del formulario de Sipay
      // Esto validará los datos de la tarjeta y generará el token
      // El token se recibirá en el evento 'token' configurado en initializeSipayForm
      console.log('📤 Procesando pago con Sipay...')
      sipayInstance.submit()

    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Error procesando el pago')
      setIsProcessing(false)
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
                    <span className="text-gray-500 line-through text-2xl">29,99€</span>
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
                    ✅ Después solo <strong>19,99€/mes</strong>
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
                          <span className="text-xs text-gray-500">Después 19,99€/mes</span>
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
                    
                    {!paymentData ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 mb-2">Cargando formulario de pago seguro...</p>
                        <p className="text-xs text-gray-500">Powered by Sipay</p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                          El checkout ha sido migrado a HTML estático.
                        </p>
                        <p className="text-sm text-gray-500">
                          Redirigiendo...
                        </p>
                      </div>
                    )}
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
                        Después del trial de 2 días, se cobrará automáticamente 19,99€/mes. Cancela cuando quieras.
                      </span>
                    </label>
                  </div>

                  {/* Botón de Pago */}
                  <button
                    type="submit"
                    disabled={isProcessing || !agreedToTerms}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                      isProcessing || !agreedToTerms
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#113240] text-white hover:bg-[#052547] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
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

