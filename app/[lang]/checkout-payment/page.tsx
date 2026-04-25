'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SipayInline from '@/components/SipayInline'
import GooglePayButton from '@/components/GooglePayButton'
import ApplePayButton from '@/components/ApplePayButton'

// Reseñas Trustpilot
const reviews = [
  { name: 'María G.', rating: 5, text: 'Muy profesional y detallado. Me ayudó a entenderme mejor.', country: '🇪🇸', date: 'Hace 2 horas' },
  { name: 'Carlos R.', rating: 5, text: 'Resultados precisos y el certificado es muy útil. Lo recomiendo.', country: '🇲🇽', date: 'Hace 4 horas' },
  { name: 'Ana P.', rating: 5, text: 'Excelente experiencia. El análisis es muy detallado.', country: '🇦🇷', date: 'Hace 5 horas' },
  { name: 'David M.', rating: 5, text: 'El análisis por categorías es muy completo y preciso.', country: '🇨🇴', date: 'Hace 7 horas' },
  { name: 'Laura S.', rating: 5, text: 'Rápido, fácil y muy informativo. ¡Gracias!', country: '🇨🇱', date: 'Hace 9 horas' },
]

// Componente Diploma CSS
function DiplomaCard({ userName }: { userName: string }) {
  return (
    <div className="relative bg-white rounded-xl overflow-hidden" style={{
      border: '3px solid #c5a028',
      boxShadow: '0 8px 40px rgba(197,160,40,0.25), inset 0 0 0 6px rgba(197,160,40,0.1)',
    }}>
      {/* Corner decorations */}
      {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-6 h-6 border-2 border-[#c5a028] opacity-60`}
          style={{ borderRadius: i < 2 ? (i === 0 ? '4px 0 0 0' : '0 4px 0 0') : (i === 2 ? '0 0 0 4px' : '0 0 4px 0') }} />
      ))}

      <div className="px-6 pt-5 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="/images/MINDMETRIC/Isotipo.png" alt="MindMetric" className="h-8 w-8" onError={(e) => { (e.target as HTMLImageElement).src = '/images/FAVICON2.png' }} />
            <span className="font-black text-[#113240] text-sm tracking-wide">MindMetric</span>
          </div>
          <span className="text-[10px] font-bold text-[#c5a028] uppercase tracking-widest border border-[#c5a028] px-2 py-0.5 rounded">Certificado</span>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-black text-[#113240] uppercase tracking-wider mb-0.5">Certificado de Inteligencia</h3>
          <div className="h-px bg-gradient-to-r from-transparent via-[#c5a028] to-transparent" />
        </div>

        {/* Body */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 mb-1">Se certifica que</p>
          <p className="text-base font-bold text-[#113240] mb-3">{userName || 'Tu Nombre'}</p>
          <p className="text-xs text-gray-600 mb-3">ha completado satisfactoriamente el Test de Inteligencia MindMetric</p>
          <p className="text-xs text-gray-500 mb-1">con una puntuación de CI de</p>
          {/* Blurred score */}
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 mb-2">
            <span className="text-2xl font-black text-[#113240]" style={{ filter: 'blur(6px)', userSelect: 'none' }}>127</span>
            <span className="text-xs text-[#07C59A] font-bold">🔒 Bloqueado</span>
          </div>
          <p className="text-[10px] text-gray-400">Completa el pago para desbloquear</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#c5a028]/30">
          <div className="text-center">
            <div className="h-px w-20 bg-gray-300 mb-1" />
            <p className="text-[9px] text-gray-400">MindMetric Labs</p>
          </div>
          {/* Seal */}
          <div className="w-10 h-10 rounded-full border-2 border-[#07C59A] flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, #e6f9f5, #ccf7eb)' }}>
            <span className="text-[8px] font-black text-[#07C59A] text-center leading-none">✓<br/>válido</span>
          </div>
          <div className="text-center">
            <div className="h-px w-20 bg-gray-300 mb-1" />
            <p className="text-[9px] text-gray-400">{new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente Trustpilot
function TrustpilotSection() {
  const tpReviews = [
    { name: 'María G.', stars: 5, text: 'Muy profesional y detallado. El certificado quedó increíble.', date: 'Hace 2h', flag: '🇪🇸' },
    { name: 'Carlos R.', stars: 5, text: 'Resultados muy precisos. Lo recomiendo totalmente.', date: 'Hace 4h', flag: '🇲🇽' },
    { name: 'Ana Pérez', stars: 5, text: 'Excelente experiencia. El análisis por categorías es muy útil.', date: 'Hace 5h', flag: '🇦🇷' },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
      {/* Trustpilot header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Trustpilot logo */}
            <svg viewBox="0 0 126 32" className="h-5 w-auto" fill="none">
              <rect width="32" height="32" rx="2" fill="#00b67a"/>
              <path d="M16 5.5l3.09 9.51H29.5l-8.27 6.01 3.16 9.73L16 24.73l-8.39 6.02 3.16-9.73L2.5 15.01H12.91L16 5.5z" fill="white"/>
            </svg>
            <span className="text-sm font-black text-gray-800">Trustpilot</span>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => <span key={i} className="text-[#00b67a] text-sm">★</span>)}
            <span className="text-xs font-bold text-gray-700 ml-1">4.8</span>
            <span className="text-xs text-gray-500">· Excelente</span>
          </div>
        </div>
        <span className="text-xs text-gray-400">+2.400 opiniones</span>
      </div>
      {/* Reviews */}
      <div className="space-y-3">
        {tpReviews.map((r, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{r.flag}</span>
                <span className="text-xs font-bold text-gray-800">{r.name}</span>
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#00b67a] fill-current"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div className="flex">{[1,2,3,4,5].map(j => <span key={j} className="text-[#00b67a] text-[10px]">★</span>)}</div>
            </div>
            <p className="text-xs text-gray-600 italic">"{r.text}"</p>
            <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(10 * 60) // 10 minutos

  // Countdown timer
  useEffect(() => {
    const saved = sessionStorage.getItem('checkout_countdown')
    if (saved) setCountdown(parseInt(saved))
    const timer = setInterval(() => {
      setCountdown(prev => {
        const next = Math.max(0, prev - 1)
        sessionStorage.setItem('checkout_countdown', next.toString())
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatCountdown = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

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
        amount: 0.90,
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
    setIsProcessing(true)
    setError('')
    
    try {
      // Paso 1: Iniciar autorización con Sipay
      const result = await fetch('/api/sipay/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          requestId: response.request_id,
          email: email,
          amount: 0.90,
          lang: lang,
          testType: testType,
        }),
      })

      const data = await result.json()
      console.log('📡 Respuesta backend:', data)
      
      if (!result.ok) {
        console.error('❌ Backend error:', data)
        setError(data.error || 'Error procesando el pago. Por favor, intenta de nuevo.')
        setIsProcessing(false)
        return
      }
      
      // Si requiere 3DS, redirigir a la URL de autenticación
      if (data.requires3DS && data.threeDSUrl) {
        console.log('🔐 Redirigiendo a 3DS:', data.threeDSUrl)
        window.location.href = data.threeDSUrl
        return
      }
      
      // Si no requiere 3DS (frictionless), el backend ya confirmó el pago
      if (data.success) {
        console.log('🎉 Pago frictionless completado! Redirigiendo a resultados...')
        router.push('/' + lang + '/resultado?order_id=' + paymentData.orderId + '&payment=success')
        return
      }

      // Si llegamos aquí, algo inesperado pasó
      setError('Respuesta inesperada del servidor. Por favor, intenta de nuevo.')
      setIsProcessing(false)
      
    } catch (error: any) {
      console.error('❌ Error en el proceso de pago:', error)
      setError('Error de conexión. Por favor, verifica tu conexión e intenta de nuevo.')
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: any) => {
    console.error('❌ Error en el pago:', error)
    setError(error.description || 'Error procesando el pago. Por favor, intenta de nuevo.')
  }

  // Handler para Google Pay - devuelve Promise<boolean> para que el botón espere
  const handleGooglePayProcess = async (token: string): Promise<boolean> => {
    console.log('🔍 Google Pay: procesando pago en backend...')
    try {
      const response = await fetch('/api/sipay/google-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googlePayToken: token,
          email,
          userName: email.split('@')[0],
          amount: 0.90,
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

      console.log('✅ Google Pay exitoso:', data)
      router.push('/' + lang + '/resultado?order_id=' + data.orderId + '&payment=success')
      return true
    } catch (error: any) {
      console.error('❌ Error Google Pay:', error)
      setError(error.message || 'Error con Google Pay')
      return false
    }
  }

  // Handler para Apple Pay - devuelve Promise<boolean> para que el botón espere
  const handleApplePayProcess = async (applePayToken: any, requestId: string): Promise<boolean> => {
    console.log('🍎 Apple Pay: procesando pago en backend...')
    // Garantizar que tenemos email — tomar del estado o de la URL en tiempo de ejecución
    const effectiveEmail = email || searchParams.get('email') || localStorage.getItem('userEmail') || ''
    console.log('🍎 Apple Pay email usado:', effectiveEmail, '| requestId:', requestId || '(vacío)')
    try {
      const response = await fetch('/api/sipay/apple-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applePayToken,
          requestId: requestId || '',
          email: effectiveEmail,
          userName: effectiveEmail.split('@')[0],
          amount: 0.90,
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

      console.log('✅ Apple Pay exitoso:', data)
      router.push('/' + lang + '/resultado?order_id=' + data.orderId + '&payment=success')
      return true
    } catch (error: any) {
      console.error('❌ Error Apple Pay:', error)
      setError(error.message || 'Error con Apple Pay')
      return false
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

      {/* ── Urgency banner ── */}
      <div className="bg-[#113240] text-white py-2.5 px-4 text-center">
        <span className="text-sm font-medium">
          ⏰ ¡Oferta especial! Tu descuento finaliza en{' '}
          <span className="font-black text-[#07C59A] text-base tabular-nums">{formatCountdown(countdown)}</span>
        </span>
      </div>

      {/* Social proof bar */}
      <div className="bg-gradient-to-r from-[#07C59A]/10 to-[#113240]/10 border-b border-gray-200 py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 text-xs text-gray-600 flex-wrap">
          <span>🔥 <strong>247</strong> personas lo compraron hoy</span>
          <span>·</span>
          <span>🧠 CI promedio: <strong>115</strong></span>
          <span>·</span>
          <span>✅ +50.000 tests realizados</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-5 order-2 lg:order-1">

              {/* Diploma */}
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">Tu certificado te espera</p>
                <DiplomaCard userName={email.split('@')[0]} />
              </div>

              {/* What you get */}
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <h3 className="text-base font-black text-[#113240] mb-3">✅ Lo que obtienes por solo 0,90€</h3>
                <div className="space-y-2.5">
                  {[
                    ['🧠', 'Puntuación exacta de CI', 'Tu IQ real, no una estimación'],
                    ['📊', 'Análisis por 6 categorías', 'Lógica, memoria, razonamiento...'],
                    ['🏆', 'Certificado descargable', 'Con tu nombre y puntuación'],
                    ['📈', 'Comparación mundial', 'Ves cómo eres frente a millones'],
                    ['🔄', '2 días Premium gratis', 'Luego 19,99€/mes, cancela siempre'],
                  ].map(([icon, title, desc], i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trustpilot */}
              <TrustpilotSection />

              {/* Guarantee */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🛡️</span>
                <div>
                  <p className="text-sm font-bold text-green-800">Garantía de Satisfacción Total</p>
                  <p className="text-xs text-green-700">Si no estás satisfecho, te devolvemos tu dinero. Sin preguntas.</p>
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

                {isProcessing ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 mb-2">Procesando pago...</p>
                    <p className="text-xs text-gray-500">Serás redirigido a la verificación de tu banco</p>
                  </div>
                ) : isLoading ? (
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
                          <span className="font-semibold">0,90€</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="text-gray-700 block">Trial Premium (2 días)</span>
                            <span className="text-xs text-gray-500">Después 19,99€/mes</span>
                          </div>
                          <span className="font-semibold text-green-600">GRATIS</span>
                        </div>
                        <div className="border-t-2 pt-2 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Hoy</span>
                          <span className="text-2xl font-bold text-[#07C59A]">0,90€</span>
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
                          amount={0.90}
                          currency="EUR"
                          onProcessPayment={handleGooglePayProcess}
                          onError={handlePaymentError}
                          env={paymentData.sipayConfig?.endpoint?.includes('live') ? 'live' : 'sandbox'}
                          gatewayMerchantId={paymentData.sipayConfig?.key || 'clicklabsdigital'}
                        />

                        {/* Apple Pay */}
                        <ApplePayButton
                          amount={0.90}
                          currency="EUR"
                          onProcessPayment={handleApplePayProcess}
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
                          <div className="flex gap-2 flex-shrink-0 items-center">
                            {/* Visa */}
                            <span className="inline-flex items-center justify-center bg-[#1A1F71] rounded px-1.5 py-0.5 h-5">
                              <span className="text-white font-black italic text-[11px] tracking-wider" style={{fontFamily:'Arial Black,Arial,sans-serif',letterSpacing:'0.5px'}}>VISA</span>
                            </span>
                            {/* Mastercard */}
                            <svg className="h-5 w-auto" viewBox="0 0 50 32" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
                              <rect width="50" height="32" rx="4" fill="#252525"/>
                              <circle cx="19" cy="16" r="10" fill="#EB001B"/>
                              <circle cx="31" cy="16" r="10" fill="#F79E1B"/>
                              <path d="M25 8.27a10 10 0 0 1 0 15.46A10 10 0 0 1 25 8.27z" fill="#FF5F00"/>
                            </svg>
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
