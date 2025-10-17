'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import Footer from '@/components/Footer'
import { FaLock, FaCheckCircle, FaBrain, FaCertificate, FaChartLine, FaUsers } from 'react-icons/fa'
import { loadStripe, Stripe, StripeElementsOptions, StripeElementLocale } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslations } from '@/hooks/useTranslations'

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
        <p className="text-gray-600">{t?.checkout?.loading || 'Loading...'}</p>
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

      // Confirmar el pago de €0.50 con Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
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

      // Si llegamos aquí, el pago de €0.50 fue exitoso
      console.log('✅ Pago de €0.50 exitoso:', paymentIntent?.id)
      console.log('📋 PaymentIntent completo:', paymentIntent)
      localStorage.setItem('paymentCompleted', 'true')
      localStorage.setItem('userEmail', email)
      
      // Crear suscripción con trial usando el paymentIntentId
      try {
        const paymentIntentId = paymentIntent?.id

        if (!paymentIntentId) {
          console.error('❌ No se obtuvo el PaymentIntent ID')
          throw new Error('No se pudo obtener el ID del pago')
        }

        console.log('📦 Creando suscripción con PaymentIntent ID:', paymentIntentId)
        console.log('📧 Email:', email)
        console.log('👤 User Name:', userName)

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
            console.log('📊 Datos del test obtenidos:', testData)
          } catch (error) {
            console.error('❌ Error parseando testResults:', error)
          }
        }

        const subscriptionResponse = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            userName,
            paymentIntentId: paymentIntentId,
            testData: testData,
            lang: lang,
          }),
        })

        console.log('📡 Status de respuesta:', subscriptionResponse.status)
        console.log('📡 Status OK:', subscriptionResponse.ok)

        const subscriptionData = await subscriptionResponse.json()
        
        console.log('📥 Respuesta COMPLETA de create-subscription:', JSON.stringify(subscriptionData, null, 2))
        
        if (subscriptionData.error) {
          console.error('❌ Error al crear suscripción:', subscriptionData.error)
          // No bloqueamos el flujo, el usuario aún puede ver sus resultados
        } else {
          console.log('✅ Suscripción creada exitosamente:', subscriptionData)
          console.log('🆔 Subscription ID:', subscriptionData.subscriptionId)
          console.log('📅 Trial End:', subscriptionData.trialEnd)
          console.log('📅 Current Period End:', subscriptionData.currentPeriodEnd)
          
          localStorage.setItem('subscriptionId', subscriptionData.subscriptionId)
          if (subscriptionData.trialEnd) {
            localStorage.setItem('trialEnd', subscriptionData.trialEnd.toString())
          }
        }
      } catch (subError: any) {
        console.error('❌ Error CRÍTICO al crear suscripción:', subError)
        console.error('❌ Error stack:', subError.stack)
        console.error('❌ Error message:', subError.message)
        // No bloqueamos el flujo, el usuario aún puede ver sus resultados
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
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
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
            {t.checkout.acceptTerms} <a href={`/${lang}/terminos`} target="_blank" className="text-[#218B8E] underline font-semibold">{t.checkout.termsAndConditions}</a>. 
            {t.checkout.trialNote}
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
                  {t.checkout.paySecure}
                </>
              )}
            </button>

      {/* Badges de Seguridad */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
                <FaLock className="text-green-500" />
            <span>{t.checkout.sslSecure}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCheckCircle className="text-green-500" />
            <span>{t.checkout.stripeSecure}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {t.checkout.secureNote}
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
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const [stripeMode, setStripeMode] = useState<string>('test')

  // Cargar la configuración de Stripe según el modo actual
  useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const response = await fetch('/api/stripe-config')
        const data = await response.json()
        
        if (data.publishableKey) {
          console.log(`🔑 Cargando Stripe en modo: ${data.mode}`)
          setStripeMode(data.mode)
          setStripePromise(loadStripe(data.publishableKey))
        }
      } catch (error) {
        console.error('Error cargando configuración de Stripe:', error)
      }
    }

    loadStripeConfig()
  }, [])

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
            lang,
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
        <MinimalHeader email={email} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  // Mapear idiomas a los locales de Stripe
  const stripeLocaleMap: Record<string, StripeElementLocale> = {
    'es': 'es',
    'en': 'en',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'sv': 'sv',
    'no': 'nb', // Noruego Bokmål
    'uk': 'en', // Ucraniano (Stripe no soporta uk, usamos en)
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    locale: (stripeLocaleMap[lang] || 'en') as StripeElementLocale,
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
      <MinimalHeader email={email} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* Banner de Modo TEST */}
          {stripeMode === 'test' && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <FaCheckCircle className="text-yellow-600" />
                <span className="font-bold">MODO TEST</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Puedes usar la tarjeta de prueba: <strong>4242 4242 4242 4242</strong>
              </p>
            </div>
          )}
          
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

                {/* Payment Element */}
                {clientSecret && userIQ && userName && stripePromise ? (
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
