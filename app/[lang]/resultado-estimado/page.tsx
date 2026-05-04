'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import { visualQuestions as questions, calculateIQ } from '@/lib/visual-questions'
import { FaLock, FaChartLine, FaCertificate, FaShare, FaCheckCircle, FaBrain, FaBullseye, FaHeart, FaStar, FaSmile, FaBolt, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function ResultadoEstimadoPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [estimatedIQ, setEstimatedIQ] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [testType, setTestType] = useState<string>('iq')

  const testConfig: any = {
    'iq':         { title: 'Test de CI Completado',                       subtitle: 'Tu Coeficiente Intelectual' },
    'personality':{ title: 'Test de Personalidad Completado',             subtitle: 'Análisis Big Five (OCEAN)' },
    'adhd':       { title: 'Test de TDAH Completado',                     subtitle: 'Evaluación de Atención' },
    'anxiety':    { title: 'Test de Ansiedad Completado',                 subtitle: 'Análisis GAD-7' },
    'depression': { title: 'Test de Depresión Completado',                subtitle: 'Análisis PHQ-9' },
    'eq':         { title: 'Test de Inteligencia Emocional Completado',   subtitle: 'Análisis EQ' },
  }

  const testIcons: Record<string, JSX.Element> = {
    'iq':          <FaBrain      className="text-5xl text-[#07C59A]" />,
    'personality': <FaBullseye   className="text-5xl text-[#07C59A]" />,
    'adhd':        <FaBullseye   className="text-5xl text-[#07C59A]" />,
    'anxiety':     <FaHeart      className="text-5xl text-blue-400" />,
    'depression':  <FaStar       className="text-5xl text-yellow-500" />,
    'eq':          <FaSmile      className="text-5xl text-red-400" />,
  }

  useEffect(() => {
    const testResultsStr = localStorage.getItem('testResults')
    if (!testResultsStr) {
      router.push('/test')
      return
    }

    const testResults = JSON.parse(testResultsStr)
    const testType = testResults.type || localStorage.getItem('currentTestType') || 'iq'
    const answers = testResults.answers
    const name = testResults.userName || localStorage.getItem('userName') || 'Usuario'

    // Calcular resultados según el tipo de test
    if (testType === 'iq' || !testType) {
      // Test de IQ
      let correctAnswers = 0
      answers.forEach((answer: number | null, index: number) => {
        if (questions[index] && answer === questions[index].correctAnswer) {
          correctAnswers++
        }
      })
      const iq = calculateIQ(correctAnswers)
      setEstimatedIQ(iq)
      localStorage.setItem('userIQ', iq.toString())
      localStorage.setItem('correctAnswers', correctAnswers.toString())
    } else {
      // Para otros tests, usamos un valor genérico que indica "completado"
      // Los resultados reales se mostrarán después del pago
      setEstimatedIQ(null)
    }

    setUserName(name)
    setTestType(testType)
    setIsLoading(false)

    // Guardar tipo de test para el checkout
    localStorage.setItem('testType', testType)
    console.log('📊 Tipo de test en resultado-estimado:', testType)
  }, [router])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleCheckout = async () => {
    // Validar email
    if (!email) {
      setEmailError(t.estimatedResult.emailRequired || 'Por favor, introduce tu correo electrónico')
      return
    }
    
    if (!validateEmail(email)) {
      setEmailError(t.estimatedResult.emailInvalid || 'Por favor, introduce un correo electrónico válido')
      return
    }

    // Validar términos
    if (!agreedToTerms) {
      alert(t.estimatedResult.termsRequired || 'Por favor, acepta los términos y condiciones para continuar')
      return
    }

    // Guardar email y testType en localStorage
    localStorage.setItem('userEmail', email)
    localStorage.setItem('testType', testType)
    
    console.log('🎯 Redirigiendo al checkout HTML con testType:', testType)
    
    // Redirigir al checkout React con componente Sipay
    router.push(`/${lang}/checkout-payment?` + new URLSearchParams({
      email: email,
      testType: testType,
      lang: lang || 'es'
    }).toString())
  }

  if (isLoading || loading || !t) {
    return (
      <>
        <MinimalHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t ? t.test.loading : 'Loading...'}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MinimalHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12">
        <div className="container-custom max-w-4xl">
          {/* Animated Result Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-[#07C59A]/10 rounded-full mb-4">
                {testIcons[testType] || testIcons['iq']}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {userName}, {testConfig[testType]?.title || t.estimatedResult.title}
              </h1>
              <p className="text-xl text-gray-600">
                {testConfig[testType]?.subtitle || t.estimatedResult.subtitle}
              </p>
            </div>

            {/* Blurred Result Preview */}
            <div className="relative mb-8">
              <div className="blur-sm pointer-events-none">
                <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-8 text-white text-center">
                  {testType === 'iq' && estimatedIQ ? (
                    <>
                      <div className="text-6xl font-bold mb-2">{estimatedIQ}</div>
                      <div className="text-2xl">{t.estimatedResult.estimatedIQ}</div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">{testIcons[testType] || testIcons['iq']}</div>
                      <div className="text-3xl font-bold mb-2">{testConfig[testType]?.title || 'Test Completado'}</div>
                      <div className="text-xl">{testConfig[testType]?.subtitle || 'Resultados Disponibles'}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-6 text-center max-w-md">
                  <FaLock className="text-3xl text-primary-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t.estimatedResult.unlockTitle}
                  </h3>
                </div>
              </div>
            </div>

            {/* What You Get - Adaptado por tipo de test */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {testType === 'iq' ? 'Desbloquea tu Resultado Completo de CI' :
                 testType === 'personality' ? 'Desbloquea tu Perfil de Personalidad Completo' :
                 testType === 'adhd' ? 'Desbloquea tu Evaluación de TDAH Completa' :
                 testType === 'anxiety' ? 'Desbloquea tu Evaluación de Ansiedad Completa' :
                 testType === 'depression' ? 'Desbloquea tu Evaluación de Depresión Completa' :
                 testType === 'eq' ? 'Desbloquea tu Inteligencia Emocional Completa' :
                 t.estimatedResult.unlockSubtitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testType === 'iq' && (
                  <>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Puntuación Exacta de CI</h4>
                        <p className="text-sm text-gray-600">Análisis detallado personalizado</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaChartLine className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Gráficos Comparativos</h4>
                        <p className="text-sm text-gray-600">Compárate con la población mundial</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCertificate className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Certificado Oficial</h4>
                        <p className="text-sm text-gray-600">Descargable y compartible</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaShare className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Acceso Premium Completo</h4>
                        <p className="text-sm text-gray-600">¡Comparte tu Resultado!</p>
                      </div>
                    </div>
                  </>
                )}
                {testType === 'personality' && (
                  <>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Análisis Big Five Completo</h4>
                        <p className="text-sm text-gray-600">5 dimensiones de personalidad</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaChartLine className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Gráficos Personalizados</h4>
                        <p className="text-sm text-gray-600">Visualiza tu perfil único</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCertificate className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Recomendaciones Profesionales</h4>
                        <p className="text-sm text-gray-600">Para desarrollo personal</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaShare className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Acceso Premium</h4>
                        <p className="text-sm text-gray-600">Todos los tests ilimitados</p>
                      </div>
                    </div>
                  </>
                )}
                {(testType === 'adhd' || testType === 'anxiety' || testType === 'depression') && (
                  <>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Análisis Detallado</h4>
                        <p className="text-sm text-gray-600">Nivel de severidad y síntomas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaChartLine className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Gráficos y Estadísticas</h4>
                        <p className="text-sm text-gray-600">Visualiza tus resultados</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCertificate className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Recomendaciones Profesionales</h4>
                        <p className="text-sm text-gray-600">Estrategias personalizadas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaShare className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Acceso Premium</h4>
                        <p className="text-sm text-gray-600">Todos los tests ilimitados</p>
                      </div>
                    </div>
                  </>
                )}
                {testType === 'eq' && (
                  <>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Análisis EQ Completo</h4>
                        <p className="text-sm text-gray-600">Competencias emocionales</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaChartLine className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Áreas de Fortaleza</h4>
                        <p className="text-sm text-gray-600">Y oportunidades de mejora</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCertificate className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Plan de Desarrollo</h4>
                        <p className="text-sm text-gray-600">Personalizado para ti</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaShare className="text-green-500 text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Acceso Premium</h4>
                        <p className="text-sm text-gray-600">Todos los tests ilimitados</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Email Section - Redesigned */}
            <div className="bg-gradient-to-br from-[#e6f5f5] to-white rounded-2xl p-8 mb-8 border-2 border-[#07C59A]">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {testType === 'iq' ? (
                    <>Descubre tu <span className="text-[#07C59A]">¡Capacidad Intelectual!</span></>
                  ) : testType === 'personality' ? (
                    <>Descubre tu <span className="text-[#07C59A]">¡Personalidad!</span></>
                  ) : testType === 'adhd' ? (
                    <>Descubre tu <span className="text-[#07C59A]">¡Nivel de TDAH!</span></>
                  ) : testType === 'anxiety' ? (
                    <>Descubre tu <span className="text-[#07C59A]">¡Nivel de Ansiedad!</span></>
                  ) : testType === 'depression' ? (
                    <>Descubre tu <span className="text-[#07C59A]">¡Nivel de Depresión!</span></>
                  ) : testType === 'eq' ? (
                    <>Descubre tu <span className="text-[#07C59A]">¡Inteligencia Emocional!</span></>
                  ) : (
                    <>{t.estimatedResult.mainTitle} <span className="text-[#07C59A]">{t.estimatedResult.mainTitleHighlight}</span></>
                  )}
                </h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  {testType === 'iq' 
                    ? 'Proporciona tu email para acceder a tu evaluación integral de inteligencia y perfil mental personalizado.'
                    : testType === 'personality'
                    ? 'Proporciona tu email para acceder a tu análisis completo de personalidad Big Five.'
                    : testType === 'adhd'
                    ? 'Proporciona tu email para acceder a tu evaluación completa de TDAH y recomendaciones.'
                    : testType === 'anxiety'
                    ? 'Proporciona tu email para acceder a tu evaluación completa de ansiedad y estrategias.'
                    : testType === 'depression'
                    ? 'Proporciona tu email para acceder a tu evaluación completa de depresión y recursos.'
                    : testType === 'eq'
                    ? 'Proporciona tu email para acceder a tu análisis completo de inteligencia emocional.'
                    : t.estimatedResult.mainSubtitle
                  }
                </p>
              </div>

              <div className="max-w-lg mx-auto">
                {/* Email Input */}
                <div className="mb-6">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError('')
                    }}
                    placeholder={t.estimatedResult.emailPlaceholder || "Email"}
                    className={`w-full px-6 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white ${
                      emailError 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-[#07C59A] focus:border-[#07C59A]'
                    }`}
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-2 text-left flex items-center gap-1">
                      <FaExclamationTriangle className="flex-shrink-0" /> {emailError}
                    </p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-[#07C59A] border-gray-300 rounded focus:ring-[#07C59A] cursor-pointer"
                    />
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {t.estimatedResult.acceptTerms}{' '}
                      <a 
                        href={`/${lang}/terminos`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#07C59A] underline hover:text-[#069e7b]"
                      >
                        {t.estimatedResult.termsLink}
                      </a>
                      {' '}{t.estimatedResult.and}{' '}
                      <a 
                        href={`/${lang}/privacidad`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#07C59A] underline hover:text-[#069e7b]"
                      >
                        {t.estimatedResult.privacyLink}
                      </a>
                      .
                    </span>
                  </label>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleCheckout}
                  disabled={!email || !agreedToTerms}
                  className={`w-full text-xl font-bold py-4 px-8 rounded-xl transition-all duration-200 ${
                    email && agreedToTerms
                      ? 'bg-[#113240] hover:bg-[#052547] text-white shadow-lg hover:shadow-xl cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t.estimatedResult.unlockButton}
                </button>
                
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="flex justify-center mb-2">
                <FaShieldAlt className="text-3xl text-[#07C59A]" />
              </div>
              <h4 className="font-semibold text-gray-900">Privacidad Garantizada</h4>
              <p className="text-sm text-gray-600">{t.estimatedResult.trust1Desc}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="flex justify-center mb-2">
                <FaBolt className="text-3xl text-[#07C59A]" />
              </div>
              <h4 className="font-semibold text-gray-900">{t.estimatedResult.trust2Title}</h4>
              <p className="text-sm text-gray-600">{t.estimatedResult.trust2Desc}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="flex justify-center mb-2">
                <FaCheckCircle className="text-3xl text-[#07C59A]" />
              </div>
              <h4 className="font-semibold text-gray-900">{t.estimatedResult.trust3Title}</h4>
              <p className="text-sm text-gray-600">{t.estimatedResult.trust3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

