'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaLock, FaCheckCircle, FaBrain, FaCertificate, FaChartLine, FaUsers } from 'react-icons/fa'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslations } from '@/hooks/useTranslations'

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Componente interno para el formulario de pago
function CheckoutForm({ email, userName, userIQ, lang }: { email: string, userName: string, userIQ: number, lang: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { t, loading: tLoading } = useTranslations()
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (tLoading || !t) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#218B8E] mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!agreedToTerms) {
      setErrorMessage(t.checkout.termsRequired || 'Debes aceptar los términos y condiciones')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      // Confirmar el pago
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message || 'Error al enviar el formulario')
        setIsProcessing(false)
        return
      }

      // Crear payment intent (esto crea el customer también)
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userIQ,
          userName,
        }),
      })

      const { clientSecret, customerId, error: apiError } = await response.json()

      if (apiError || !clientSecret) {
        setErrorMessage(apiError || 'Error al crear el pago')
        setIsProcessing(false)
        return
      }

      // Confirmar el setup del método de pago con Stripe
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/${lang}/resultado`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setErrorMessage(confirmError.message || 'Error al procesar el pago')
        setIsProcessing(false)
        return
      }

      // Si llegamos aquí, el pago fue exitoso
      localStorage.setItem('paymentCompleted', 'true')
      localStorage.setItem('userEmail', email)
      
      // Crear suscripción con trial usando el customerId y paymentMethodId
      try {
        const subscriptionResponse = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userName,
            customerId: customerId,
            paymentMethodId: setupIntent?.payment_method,
          }),
        })

        const subscriptionData = await subscriptionResponse.json()
        
        if (subscriptionData.error) {
          console.error('Error al crear suscripción:', subscriptionData.error)
        } else {
          console.log('Suscripción creada exitosamente:', subscriptionData)
          localStorage.setItem('subscriptionId', subscriptionData.subscriptionId)
        }
      } catch (subError) {
        console.error('Error al crear suscripción:', subError)
      }

      // Redirigir a resultados
      router.push(`/${lang}/resultado`)

    } catch (error: any) {
      console.error('Error al procesar el pago:', error)
      setErrorMessage(error.message || 'Error al procesar el pago')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
            </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
                </div>
      )}

      {/* Términos */}
      <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-5 h-5 text-[#218B8E] border-gray-300 rounded focus:ring-[#218B8E]"
                />
                <span className="text-sm text-gray-700">
            Acepto los <a href={`/${lang}/terminos`} target="_blank" className="text-[#218B8E] underline font-semibold">Términos y Condiciones</a>. 
            Entiendo que se activará una prueba premium de 2 días que puedo cancelar antes de que finalice para evitar el cargo mensual de 19,99€.
                </span>
              </label>
            </div>

      {/* Botón de Pago */}
            <button
        type="submit"
        disabled={isProcessing || !stripe || !agreedToTerms}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
          isProcessing || !stripe || !agreedToTerms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#031C43] text-white hover:bg-[#052547] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Procesando pago...
                </>
              ) : (
                <>
                  <FaLock />
                  Pagar 0,50€ de forma segura
                </>
              )}
            </button>

      {/* Badges de Seguridad */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
                <FaLock className="text-green-500" />
            <span>SSL Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCheckCircle className="text-green-500" />
            <span>Stripe</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Pago 100% seguro • Política de reembolso de 14 días
        </p>
      </div>
    </form>
  )
}

// Componente principal de la página
export default function CheckoutPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [email, setEmail] = useState('')
  const [userIQ, setUserIQ] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const iq = localStorage.getItem('userIQ')
    const savedEmail = localStorage.getItem('userEmail')
    const name = localStorage.getItem('userName')
    
    if (!iq) {
      router.push(`/${lang}/test`)
    } else {
      setUserIQ(parseInt(iq))
      if (savedEmail) {
        setEmail(savedEmail)
      }
      if (name) {
        setUserName(name)
      }
    }
  }, [router, lang])

  // Cargar payment intent automáticamente cuando se carga la página
  useEffect(() => {
    const loadPaymentIntent = async () => {
      if (!email || !userIQ) return

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userIQ,
            userName,
          }),
        })

        const data = await response.json()

        if (data.error) {
          setEmailError(data.error)
          return
        }

        setClientSecret(data.clientSecret)
        localStorage.setItem('userEmail', email)
      } catch (error) {
        setEmailError('Error al inicializar el pago')
      }
    }

    loadPaymentIntent()
  }, [email, userIQ, userName])

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </>
    )
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#218B8E',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <>
      <Header />
      
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
            <div className="space-y-6">
              
              {/* Precio Destacado */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-[#218B8E]">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Desbloquea tu resultado completo
                  </h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-gray-500 line-through text-2xl">19,99€</span>
                    <span className="text-6xl font-bold text-[#218B8E]">0,50€</span>
                  </div>
                  <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-4">
                    ⚡ ¡Ahorra 97% hoy!
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600" />
                    Incluye Prueba Premium de 2 Días
                  </h4>
                  <p className="text-blue-800 text-sm mb-2">
                    • Acceso completo a tu análisis de CI<br/>
                    • Comparativas con población general<br/>
                    • Certificado oficial descargable<br/>
                    • Prueba 2 días gratis, después <strong>19,99€/mes</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-3">
                    ℹ️ Puedes cancelar en cualquier momento antes de que finalice el periodo de prueba
                  </p>
                </div>
              </div>

              {/* Qué Obtendrás */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Por solo 0,50€ obtendrás:
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaBrain className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tu puntuación exacta de CI</h4>
                      <p className="text-sm text-gray-600">Análisis detallado personalizado</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaChartLine className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Gráficos comparativos</h4>
                      <p className="text-sm text-gray-600">Compárate con la población general</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCertificate className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Certificado oficial</h4>
                      <p className="text-sm text-gray-600">Descargable y compartible</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#218B8E] rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUsers className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Acceso a 2 días de prueba premium</h4>
                      <p className="text-sm text-gray-600">Cancela cuando quieras</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confianza */}
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                  <h4 className="font-bold text-green-900">¿Por qué confiar en nosotros?</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>✓ Test validado científicamente</li>
                  <li>✓ Más de 100,000 usuarios satisfechos</li>
                  <li>✓ Pago 100% seguro con Stripe</li>
                  <li>✓ Certificado SSL y encriptación</li>
                  <li>✓ Política de reembolso de 14 días</li>
                </ul>
              </div>
            </div>

            {/* Columna Derecha - Formulario */}
            <div className="lg:sticky lg:top-8 h-fit">
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
                      onChange={(e) => setEmail(e.target.value)}
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
                    📧 Recibirás tu resultado completo aquí
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
                        <span className="text-gray-700 block">{t.pricing.trialTitle}</span>
                        <span className="text-xs text-gray-500">{t.pricing.afterTrial}</span>
                      </div>
                      <span className="font-semibold text-green-600">{t.pricing.free}</span>
                    </div>
                    <div className="border-t-2 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t.checkout.total}</span>
                      <span className="text-3xl font-bold text-[#218B8E]">0,50€</span>
                    </div>
                  </div>
                </div>

                {/* Payment Element */}
                {clientSecret && userIQ && userName ? (
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <CheckoutForm 
                      email={email} 
                      userName={userName} 
                      userIQ={userIQ} 
                      lang={lang}
                    />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#218B8E] mx-auto mb-4"></div>
                    <p className="text-gray-600">{t.checkout.loadingPayment}</p>
                  </div>
                )}
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
                  MG
                </div>
                <div>
                  <h5 className="font-semibold">María García</h5>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "Increíble precisión. El análisis superó mis expectativas."
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                  JL
                </div>
                <div>
                  <h5 className="font-semibold">Juan López</h5>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "Proceso rápido y resultados muy detallados. Lo recomiendo."
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                  AP
                </div>
                <div>
                  <h5 className="font-semibold">Ana Pérez</h5>
                  <div className="text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "Vale totalmente la pena. Certificado profesional."
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
