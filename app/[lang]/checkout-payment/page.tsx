'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SipayInline from '@/components/SipayInline'
import GooglePayButton from '@/components/GooglePayButton'
import ApplePayButton from '@/components/ApplePayButton'
import TrustpilotReviews from '@/components/TrustpilotReviews'
import { FaGraduationCap, FaChartBar, FaDna, FaLock, FaShieldAlt, FaCreditCard, FaCheckCircle, FaGift, FaTag } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

const checkoutReviews = [
  { name: 'María G.', title: 'Muy profesional', text: 'Muy profesional y detallado. Me ayudó a entenderme mejor.' },
  { name: 'Carlos R.', title: 'Resultados precisos', text: 'Resultados precisos y el certificado es muy útil.' },
  { name: 'Ana P.', title: 'Excelente experiencia', text: 'Excelente experiencia, lo recomiendo totalmente.' },
  { name: 'David M.', title: 'Análisis muy completo', text: 'El análisis por categorías es muy completo.' },
  { name: 'Laura S.', title: '¡Gracias!', text: 'Rápido, fácil y muy informativo. ¡Gracias!' },
  { name: 'Sofía P.', title: 'Increíble precisión', text: 'El análisis superó mis expectativas. Muy recomendable.' },
  { name: 'Javier M.', title: 'Vale la pena', text: 'Totalmente vale la pena. El certificado es muy profesional.' },
]

const socialProofNotifications = [
  { name: 'Iva***', flag: '🇪🇸', score: 126 },
  { name: 'Car***', flag: '🇲🇽', score: 119 },
  { name: 'Mar***', flag: '🇦🇷', score: 133 },
  { name: 'Lau***', flag: '🇨🇴', score: 121 },
  { name: 'Pab***', flag: '🇨🇱', score: 128 },
  { name: 'Sof***', flag: '🇵🇪', score: 115 },
  { name: 'Gen***', flag: '🇪🇸', score: 125 },
  { name: 'byl***', flag: '🇪🇸', score: 136 },
  { name: 'Ana***', flag: '🇧🇷', score: 122 },
  { name: 'Dav***', flag: '🇨🇴', score: 118 },
]

export const dynamic = 'force-dynamic'

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  )
}

function CheckoutPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentRef = useRef<HTMLDivElement>(null)

  const [email, setEmail] = useState('')
  const [testType, setTestType] = useState('iq')
  const [lang, setLang] = useState('es')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'none' | 'card' | 'google' | 'apple'>('none')
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(540)
  const [notifIndex, setNotifIndex] = useState(0)
  const [notifVisible, setNotifVisible] = useState(true)
  const [showBottomCta, setShowBottomCta] = useState(false)

  // Mostrar CTA fijo al 50% de scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setShowBottomCta(total > 0 && scrolled / total >= 0.5)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 540 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Social proof notification rotator
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifVisible(false)
      setTimeout(() => {
        setNotifIndex((prev) => (prev + 1) % socialProofNotifications.length)
        setNotifVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const notif = socialProofNotifications[notifIndex]

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
      let testData: any = {}
      const testResultsStr = localStorage.getItem('testResults')
      if (testResultsStr) {
        try {
          const testResults = JSON.parse(testResultsStr)
          testData = {
            answers: testResults.answers || [],
            timeElapsed: testResults.timeElapsed || 0,
            correctAnswers: testResults.correctAnswers || 0,
            categoryScores: testResults.categoryScores || {},
          }
        } catch {}
      }
      const response = await fetch('/api/sipay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userName: email.split('@')[0],
          amount: 0.50,
          userIQ: localStorage.getItem('userIQ') || 100,
          lang,
          testData,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error creando el pago')
      setPaymentData(data)
      setIsLoading(false)
    } catch (error: any) {
      setError(error.message || 'Error cargando el formulario de pago')
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (response: any) => {
    setIsProcessing(true)
    setError('')
    try {
      const result = await fetch('/api/sipay/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          requestId: response.request_id,
          email,
          amount: 0.50,
          lang,
          testType,
        }),
      })
      const data = await result.json()
      if (!result.ok) {
        setError(data.error || 'Error procesando el pago. Por favor, intenta de nuevo.')
        setIsProcessing(false)
        return
      }
      if (data.requires3DS && data.threeDSUrl) {
        window.location.href = data.threeDSUrl
        return
      }
      if (data.success) {
        router.push('/' + lang + '/resultado?order_id=' + paymentData.orderId + '&payment=success')
        return
      }
      setError('Respuesta inesperada del servidor.')
      setIsProcessing(false)
    } catch (error: any) {
      setError('Error de conexión. Por favor, verifica tu conexión e intenta de nuevo.')
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: any) => {
    setError(error.description || 'Error procesando el pago. Por favor, intenta de nuevo.')
  }

  const handleGooglePayProcess = async (token: string): Promise<boolean> => {
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
        setError(data.error || 'Error en Google Pay')
        return false
      }
      router.push('/' + lang + '/resultado?order_id=' + data.orderId + '&payment=success')
      return true
    } catch (error: any) {
      setError(error.message || 'Error con Google Pay')
      return false
    }
  }

  const handleApplePayProcess = async (applePayToken: any, requestId: string): Promise<boolean> => {
    const effectiveEmail = email || searchParams.get('email') || localStorage.getItem('userEmail') || ''
    try {
      const response = await fetch('/api/sipay/apple-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applePayToken,
          requestId: requestId || '',
          email: effectiveEmail,
          userName: effectiveEmail.split('@')[0],
          amount: 0.50,
          userIQ: localStorage.getItem('userIQ') || 100,
          lang,
          testType,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Error en Apple Pay')
        return false
      }
      router.push('/' + lang + '/resultado?order_id=' + data.orderId + '&payment=success')
      return true
    } catch (error: any) {
      setError(error.message || 'Error con Apple Pay')
      return false
    }
  }

  const scrollToPayment = () => {
    paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="min-h-screen bg-white pb-20">

      {/* Social proof notification bar — fijo en la parte superior */}
      <div className="sticky top-0 z-40 bg-gray-100 py-1.5 px-4 text-center text-xs text-gray-700 overflow-hidden shadow-sm">
        <span
          className={`inline-block transition-all duration-400 ${notifVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
          style={{ transition: 'opacity 0.4s, transform 0.4s' }}
        >
          <strong>{notif.name}</strong> acaba de comprar el resultado {notif.flag}{' '}
          <span className="font-semibold">CI {notif.score}</span>
        </span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/FAVICON2.png" alt="MindMetric" className="h-8 w-8" />
            <span className="text-lg font-bold text-gray-900">MindMetric</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <FaLock className="text-green-600" />
            Pago 100% seguro
          </div>
        </div>
      </header>

      {/* Countdown offer bar */}
      <div className="bg-white border-b border-gray-100 py-2 px-4 text-center">
        <p className="text-sm">
          <span className="text-[#07C59A] font-semibold">¡Consigue tu CI por solo €0,50!</span>
          {' '}Oferta finaliza en
        </p>
        <p className="text-2xl font-bold text-gray-900 tracking-wider">{formatCountdown(countdown)}</p>
      </div>

      {/* Hero section */}
      <section className="bg-[#EEF4FF] py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Mobile: certificate on top, text below. Desktop: side by side */}
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8 md:items-center">

            {/* Certificate — shown first on all screens */}
            <div className="relative mx-auto w-full max-w-sm order-1 mb-6 md:mb-0 md:order-2">
              <div className="absolute inset-0 translate-x-3 translate-y-3 bg-white rounded-lg border border-gray-200 shadow-md" />
              <div className="relative bg-white rounded-lg border-2 border-blue-400 shadow-xl p-5 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <img src="/images/FAVICON2.png" alt="" className="h-5 w-5" />
                  <span className="text-xs font-semibold text-gray-600">MindMetric</span>
                  <div className="ml-auto w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center">
                    <img src="/images/FAVICON2.png" alt="" className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">Certificado de test de CI</h3>
                <p className="text-xs text-gray-500 mb-1">Otorgado con orgullo a</p>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 blur-sm" />
                <p className="text-xs text-gray-500 mb-1">Puntuación de CI</p>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3 blur-sm" />
                <div className="blur-sm select-none">
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    Este certificado confirma la finalización de la prueba MindMetric. La puntuación de CI presentada representa una medición del rendimiento cognitivo basada en sus respuestas a la prueba.
                  </p>
                </div>
                <div className="flex justify-between items-end mt-2 blur-sm">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                    <p className="text-[10px] text-gray-400">Fecha de emisión</p>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                    <p className="text-[10px] text-gray-400">ID certificado</p>
                  </div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-14 mb-1" />
                    <p className="text-[10px] text-gray-400">Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text + CTA — below certificate on mobile, left on desktop */}
            <div className="order-2 md:order-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 leading-tight">
                ¡Felicidades!
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-[#07C59A] mb-6 leading-tight">
                ¡Tu puntuación está lista!
              </h2>
              <button
                onClick={scrollToPayment}
                className="bg-[#07C59A] hover:bg-[#069e7b] text-white font-bold px-8 py-3.5 rounded-lg text-base transition-colors w-full md:w-auto"
              >
                Descubre tu CI
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Media logos */}
      <div className="bg-white border-b border-gray-100 py-4 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          {['BUSINESS INSIDER', 'digitaltrends', 'msn', 'Newsweek', 'USA TODAY', 'yahoo/finance', 'BUSINESS INSIDER', 'digitaltrends', 'msn', 'Newsweek', 'USA TODAY', 'yahoo/finance'].map((logo, i) => (
            <span key={i} className={`text-gray-400 font-bold text-sm flex-shrink-0 ${logo === 'Newsweek' ? 'text-red-500' : logo === 'yahoo/finance' ? 'text-purple-600' : ''}`}>
              {logo === 'digitaltrends' ? (
                <span className="flex items-center gap-0.5">
                  <span className="text-blue-500">+</span>digitaltrends
                </span>
              ) : logo === 'msn' ? (
                <span className="flex items-center gap-0.5">
                  <span className="text-blue-600 font-black">9</span>
                  <span>msn</span>
                </span>
              ) : (
                logo
              )}
            </span>
          ))}
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      </div>

      {/* Main section */}
      <section className="py-10 px-4 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          ¡Obtén tu certificado de coeficiente intelectual ahora!
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — trust panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Stats */}
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Más de <strong>2.636</strong> tests realizados hoy</p>
                <p className="text-sm text-gray-600 mt-0.5">CI promedio: <strong>116</strong></p>
              </div>
              <div className="flex items-center">
                {['🇮🇹', '🇩🇪', '🇫🇷', '🇱🇻', '🇪🇸'].map((f, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-lg overflow-hidden flex-shrink-0"
                    style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: i }}
                  >
                    {f}
                  </div>
                ))}
                <div
                  className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600"
                  style={{ marginLeft: '-8px', zIndex: 5 }}
                >
                  +47
                </div>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Por qué puedes confiar en MindMetric</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#07C59A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaGraduationCap className="text-[#07C59A] text-base" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Test de CI</p>
                  <p className="text-xs text-gray-500 mt-0.5">Nuestra evaluación se basa en la Escala de Inteligencia Stanford-Binet, el estándar de referencia en tests de CI desde 1916.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#07C59A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaChartBar className="text-[#07C59A] text-base" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Informe Completo</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tu informe personalizado se genera usando la teoría de habilidades cognitivas de Cattell-Horn-Carroll (CHC).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#07C59A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaDna className="text-[#07C59A] text-base" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Entrenamiento respaldado por la neurociencia</p>
                  <p className="text-xs text-gray-500 mt-0.5">Nuestros programas de entrenamiento cognitivo se basan en las últimas investigaciones en neurociencia.</p>
                </div>
              </div>
            </div>

            {/* Media logos in trust panel */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">MindMetric ha sido presentado en</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-black text-gray-800 text-xs">BUSINESS INSIDER</span>
                <span className="text-blue-500 font-bold text-xs">+digitaltrends</span>
                <span className="text-gray-700 font-bold text-xs flex items-center gap-0.5"><span className="text-blue-600 font-black">9</span>msn</span>
                <span className="text-red-500 font-bold text-sm">Newsweek</span>
                <span className="font-black text-gray-700 text-xs">USA TODAY</span>
                <span className="text-purple-600 font-bold text-xs">yahoo/finance</span>
              </div>
            </div>
          </div>

          {/* Right — payment form */}
          <div ref={paymentRef} id="payment-form" className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6">

              {/* Feature checkmarks */}
              <div className="space-y-2 mb-5">
                {[
                  'Obtén tu puntuación de CI exacta',
                  'Compárate con la población general',
                  'Identifica tus fortalezas y áreas de mejora cognitivas',
                ].map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckIcon className="w-4 h-4 text-[#07C59A] flex-shrink-0 mt-0.5" />
                    {feat}
                  </div>
                ))}
              </div>

              {/* Discount code badge */}
              <div className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <FaTag className="text-gray-500 flex-shrink-0 text-sm" />
                  <span className="text-sm font-medium text-gray-800">Código Promocional MM-94 Aplicado</span>
                </div>
                <span className="text-sm font-bold text-green-600 whitespace-nowrap ml-2">Ahorras 94%</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm text-gray-500">A pagar hoy:</span>
                <span className="text-lg text-gray-400 line-through">€7,95</span>
                <span className="text-2xl font-bold text-gray-900">€0,50</span>
              </div>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Obtén una prueba de 2 días por solo €0,50. Después de la prueba, te cobraremos €19,99/mes hasta que canceles.
              </p>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Payment area */}
              {isProcessing ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Procesando pago...</p>
                  <p className="text-xs text-gray-400 mt-1">Serás redirigido para verificar con tu banco</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Preparando pago seguro...</p>
                </div>
              ) : paymentData ? (
                <div className="space-y-2.5">
                  {/* Google Pay */}
                  <GooglePayButton
                    amount={0.50}
                    currency="EUR"
                    onProcessPayment={handleGooglePayProcess}
                    onError={handlePaymentError}
                    env={paymentData.sipayConfig?.endpoint?.includes('live') ? 'live' : 'sandbox'}
                    gatewayMerchantId={paymentData.sipayConfig?.key || 'clicklabsdigital'}
                  />

                  {/* Apple Pay */}
                  <ApplePayButton
                    amount={0.50}
                    currency="EUR"
                    onProcessPayment={handleApplePayProcess}
                    onError={handlePaymentError}
                  />

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">o</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Card button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod(paymentMethod === 'card' ? 'none' : 'card')}
                    className="w-full bg-[#07C59A] hover:bg-[#069e7b] text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <FaCreditCard className="text-white" />
                    Tarjeta de crédito o débito
                  </button>

                  {/* Expandable card form */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${paymentMethod === 'card' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-2">
                      <SipayInline
                        merchantKey={paymentData.sipayConfig?.key || 'clicklabsdigital'}
                        amount={50}
                        currency="EUR"
                        template="v4"
                        lang={lang}
                        env={paymentData.sipayConfig?.endpoint?.includes('live') ? 'live' : 'sandbox'}
                        onRequestId={(requestId, payload) => {
                          handlePaymentSuccess({ request_id: requestId, ...(typeof payload === 'object' && payload !== null ? payload : {}) })
                        }}
                        height={450}
                      />
                    </div>
                  </div>

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FaLock className="text-green-500 text-xs" />
                      <span>Pago Seguro</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FaShieldAlt className="text-green-500 text-xs" />
                      <span>SSL 256-bit</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MdVerified className="text-green-500 text-sm" />
                      <span>PCI DSS</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Guarantee */}
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <FaShieldAlt className="text-amber-500 text-lg flex-shrink-0" />
              <span className="text-sm font-medium text-amber-900">Garantía de Devolución</span>
              <a href={`/${lang}/reembolso`} className="text-xs text-amber-700 underline ml-auto">Ver política</a>
            </div>
          </div>
        </div>
      </section>

      {/* Blurred report teaser */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <img src="/images/FAVICON2.png" alt="" className="h-5 w-5" />
            <h3 className="font-bold text-lg text-gray-900">Informe Personal de CI</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Tus resultados revelan información fascinante sobre tus fortalezas cognitivas y tu potencial oculto. Con puntuaciones que te colocan entre los mejores en áreas clave, tus habilidades en Lógica y Reconocimiento de Patrones son realmente excepcionales:
          </p>

          {/* Blurred text strip */}
          <div className="select-none pointer-events-none space-y-1.5 mb-3" style={{ filter: 'blur(4px)', WebkitFilter: 'blur(4px)' }}>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tu puntuación de CI te coloca en el percentil 94 de la población mundial. Tus habilidades de razonamiento lógico y memoria de trabajo son excepcionales, superando a la mayoría de personas de tu grupo de edad.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              En el área de reconocimiento de patrones obtienes una puntuación de 138, lo que indica una capacidad analítica muy por encima del promedio.
            </p>
          </div>

          {/* Lock card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-center flex flex-col items-center gap-1.5">
            <FaLock className="text-gray-400 text-lg" />
            <p className="text-sm text-gray-700">
              Para leer el informe completo, necesitas{' '}
              <button onClick={scrollToPayment} className="text-[#07C59A] font-semibold underline">
                acceso total
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-gray-900 mb-3">Cómo te beneficiarás</h4>
            <ul className="space-y-2">
              {[
                'Superarás a tus compañeros y destacarás en ambientes competitivos',
                'Abrirás nuevas oportunidades de carrera y lograrás tus objetivos profesionales',
                'Tomarás mejores decisiones en todos los aspectos de tu vida',
                'Aumentarás tu confianza y seguridad en ti mismo para afrontar nuevos retos',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon className="w-4 h-4 text-[#07C59A] flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-gray-900 mb-3">Aprende cómo</h4>
            <ul className="space-y-2">
              {[
                'Resolver problemas complejos con mayor claridad y confianza',
                'Adquirir nuevas habilidades más rápido y recordar información de forma más efectiva',
                'Desarrollar mejores estrategias de pensamiento analítico',
                'Mejorar tu memoria para un mejor rendimiento',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon className="w-4 h-4 text-[#07C59A] flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Reseñas</h2>
          <TrustpilotReviews
            reviews={checkoutReviews}
            visibleCount={3}
            rating={4.8}
            totalReviews="125.390"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-400 text-sm">© 2026 MindMetric. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Fixed bottom CTA bar — visible solo tras 50% de scroll */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 z-50 shadow-lg transition-all duration-300 ${showBottomCta ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-sm mx-auto">
          <button
            onClick={scrollToPayment}
            className="w-full bg-[#07C59A] hover:bg-[#069e7b] text-white font-bold py-3.5 rounded-lg text-base transition-colors"
          >
            Descubre tu CI →
          </button>
        </div>
      </div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  )
}

export default function CheckoutPayment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPaymentContent />
    </Suspense>
  )
}
