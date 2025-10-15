'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import { visualQuestions as questions, calculateIQ } from '@/lib/visual-questions'
import { FaLock, FaChartLine, FaCertificate, FaShare, FaCheckCircle } from 'react-icons/fa'
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

  useEffect(() => {
    const testResultsStr = localStorage.getItem('testResults')
    if (!testResultsStr) {
      router.push('/test')
      return
    }

    const testResults = JSON.parse(testResultsStr)
    const answers = testResults.answers
    const name = testResults.userName || localStorage.getItem('userName') || 'Usuario'

    // Calcular respuestas correctas
    let correctAnswers = 0
    answers.forEach((answer: number | null, index: number) => {
      if (answer === questions[index].correctAnswer) {
        correctAnswers++
      }
    })

    const iq = calculateIQ(correctAnswers)
    setEstimatedIQ(iq)
    setUserName(name)
    setIsLoading(false)

    // Guardar datos para el pago
    localStorage.setItem('userIQ', iq.toString())
    localStorage.setItem('correctAnswers', correctAnswers.toString())
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

    // Guardar email en localStorage
    localStorage.setItem('userEmail', email)
    
    // Redirigir a checkout
    router.push(`/${lang}/checkout`)
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
              <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                <FaLock className="text-4xl text-yellow-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {userName}, {t.estimatedResult.title}
              </h1>
              <p className="text-xl text-gray-600">
                {t.estimatedResult.subtitle}
              </p>
            </div>

            {/* Blurred Result Preview */}
            <div className="relative mb-8">
              <div className="blur-sm pointer-events-none">
                <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-8 text-white text-center">
                  <div className="text-6xl font-bold mb-2">{estimatedIQ}</div>
                  <div className="text-2xl">{t.estimatedResult.estimatedIQ}</div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-6 text-center max-w-md">
                  <FaLock className="text-3xl text-primary-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t.estimatedResult.unlockTitle}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t.estimatedResult.priceLabel} <span className="text-2xl font-bold text-primary-600">{t.estimatedResult.price}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* What You Get */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {t.estimatedResult.unlockSubtitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.estimatedResult.feature1}</h4>
                    <p className="text-sm text-gray-600">{t.estimatedResult.feature2}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaChartLine className="text-green-500 text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.estimatedResult.feature3}</h4>
                    <p className="text-sm text-gray-600">{t.estimatedResult.feature2}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCertificate className="text-green-500 text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.estimatedResult.feature4}</h4>
                    <p className="text-sm text-gray-600">{t.estimatedResult.feature2}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaShare className="text-green-500 text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.estimatedResult.feature5}</h4>
                    <p className="text-sm text-gray-600">{t.result.shareTitle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Section - Redesigned */}
            <div className="bg-gradient-to-br from-[#e6f5f5] to-white rounded-2xl p-8 mb-8 border-2 border-[#218B8E]">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {t.estimatedResult.mainTitle} <span className="text-[#218B8E]">{t.estimatedResult.mainTitleHighlight}</span>
                </h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  {t.estimatedResult.mainSubtitle}
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
                        : 'border-gray-300 focus:ring-[#218B8E] focus:border-[#218B8E]'
                    }`}
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-2 text-left">⚠️ {emailError}</p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-[#218B8E] border-gray-300 rounded focus:ring-[#218B8E] cursor-pointer"
                    />
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {t.estimatedResult.acceptTerms}{' '}
                      <a 
                        href={`/${lang}/terminos`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#218B8E] underline hover:text-[#1a6f72]"
                      >
                        {t.estimatedResult.termsLink}
                      </a>
                      {' '}{t.estimatedResult.and}{' '}
                      <a 
                        href={`/${lang}/privacidad`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#218B8E] underline hover:text-[#1a6f72]"
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
                      ? 'bg-[#031C43] hover:bg-[#052547] text-white shadow-lg hover:shadow-xl cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t.estimatedResult.unlockButton}
                </button>
                
                <p className="text-sm text-gray-500 text-center mt-4">
                  🔒 {t.estimatedResult.securePayment}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-gray-900">{t.estimatedResult.trust1Title}</h4>
              <p className="text-sm text-gray-600">{t.estimatedResult.trust1Desc}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900">{t.estimatedResult.trust2Title}</h4>
              <p className="text-sm text-gray-600">{t.estimatedResult.trust2Desc}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-3xl mb-2">✓</div>
              <h4 className="font-semibold text-gray-900">{t.estimatedResult.trust3Title}</h4>
              <p className="text-sm text-gray-600">{t.estimatedResult.trust3Desc}</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">{t.notices.infoTitle}</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• {t.notices.point1}</li>
              <li>• {t.notices.point2}</li>
              <li>• {t.notices.point3}</li>
              <li>• {t.notices.point4}</li>
              <li>• {t.notices.point5} <a href={`/${lang}/terminos`} className="text-primary-600 underline">{t.notices.termsLink}</a> {t.notices.moreInfo}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

