'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { visualQuestions, calculateIQ } from '@/lib/visual-questions'
import Header from '@/components/Header'
import TestHeader from '@/components/TestHeader'
import VisualCell from '@/components/VisualCell'
import { FaClock, FaUser } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'
import { saveTestResult, calculateCategoryScores, updateUserInfo } from '@/lib/test-history'

// Diapositivas de transición entre secciones del test de IQ
const IQ_SLIDES: Record<number, { anim: 'bars' | 'orbit'; title: string; subtitle: string; description: string; badge: string }> = {
  4: {
    anim: 'bars',
    title: 'Nivel Medio',
    subtitle: 'Las preguntas se vuelven más complejas',
    description: 'Has superado la fase inicial. Ahora los patrones requieren mayor razonamiento abstracto.',
    badge: '4 DE 20 COMPLETADAS',
  },
  10: {
    anim: 'orbit',
    title: 'Nivel Avanzado',
    subtitle: '¡Estás en la recta final!',
    description: 'Solo quedan 10 preguntas. Son las más desafiantes — demuestra tu capacidad máxima.',
    badge: '10 DE 20 COMPLETADAS',
  },
}

export default function TestPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [userName, setUserName] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(20).fill(null))
  const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes in seconds
  const [startTime, setStartTime] = useState<number>(0)
  const [showTooFastModal, setShowTooFastModal] = useState(false)
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false)
  const [activeSlide, setActiveSlide] = useState<typeof IQ_SLIDES[number] | null>(null)
  const [slideTransitioning, setSlideTransitioning] = useState(false)

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName')
    if (savedUserName) {
      setUserName(savedUserName)
    }
  }, [])

  useEffect(() => {
    if (!hasStarted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleFinishTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('userName', userName)
      setStartTime(Date.now()) // Establecer el tiempo de inicio cuando realmente comienza el test
      setHasStarted(true)
    }
  }

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)

    // Verificar si es la última pregunta
    if (currentQuestion === visualQuestions.length - 1) {
      const timeElapsed = Date.now() - startTime
      const oneMinute = 60 * 1000
      if (timeElapsed < oneMinute) {
        setShowTooFastModal(true)
        return
      }
      setShowFinishConfirmModal(true)
      return
    }

    // Comprobar si hay diapositiva de transición después de esta pregunta
    const nextQ = currentQuestion + 1
    const slide = IQ_SLIDES[nextQ]
    if (slide) {
      setTimeout(() => {
        setSlideTransitioning(true)
        setActiveSlide(slide)
        setTimeout(() => setSlideTransitioning(false), 300)
      }, 350)
      return
    }

    // Avance automático normal
    setTimeout(() => {
      setCurrentQuestion(currentQuestion + 1)
    }, 300)
  }

  const handleSlideContinue = () => {
    setSlideTransitioning(true)
    setTimeout(() => {
      setActiveSlide(null)
      setCurrentQuestion(prev => prev + 1)
      setSlideTransitioning(false)
    }, 300)
  }

  const handleFinishTest = async () => {
    // Calcular respuestas correctas
    let correctCount = 0
    answers.forEach((answer, index) => {
      if (answer === visualQuestions[index].correctAnswer) {
        correctCount++
      }
    })

    const iq = calculateIQ(correctCount)
    const timeElapsed = (20 * 60) - timeRemaining
    const categoryScores = calculateCategoryScores(answers, visualQuestions)
    
    // Guardar IQ y respuestas correctas en localStorage para las páginas siguientes
    localStorage.setItem('userIQ', iq.toString())
    localStorage.setItem('correctAnswers', correctCount.toString())
    localStorage.setItem('userName', userName)
    
    // Asegurarse de que NO sea test premium (usuarios nuevos deben pasar por checkout)
    localStorage.removeItem('isPremiumTest')
    
    // Mantener compatibilidad con sistema antiguo
    const testResults = {
      answers,
      timeElapsed,
      completedAt: new Date().toISOString(),
      userName
    }
    localStorage.setItem('testResults', JSON.stringify(testResults))

    // Si el usuario está autenticado, guardar en el backend
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const response = await fetch('/api/save-test-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            iq,
            correctAnswers: correctCount,
            timeElapsed,
            answers,
            categoryScores
          })
        })

        if (response.ok) {
          console.log('✅ Resultado de test guardado en backend')
        } else {
          console.error('❌ Error guardando resultado en backend')
        }
      } catch (error) {
        console.error('❌ Error guardando resultado en backend:', error)
      }
    }
    
    // Redirigir a análisis
    router.push(`/${lang}/analizando`)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < visualQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Si está en la última pregunta, verificar anti-bot y mostrar modal
      const timeElapsed = Date.now() - startTime
      const oneMinute = 60 * 1000
      
      if (timeElapsed < oneMinute) {
        setShowTooFastModal(true)
        return
      }
      
      // Mostrar modal de confirmación
      setShowFinishConfirmModal(true)
    }
  }

  const question = visualQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / visualQuestions.length) * 100
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t ? t.test.loading : 'Loading...'}</p>
          </div>
        </div>
      </>
    )
  }

  // Pantalla de bienvenida
  if (!hasStarted) {
    return (
      <>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-8">
          <div className="container-custom max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-[#e6f5f5] rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUser className="text-4xl text-[#07C59A]" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                <span className="text-[#113240]">Mind</span><span className="text-[#07C59A]">Metric</span> {t.test.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                {t.test.welcomeSubtitle}
              </p>

              <form onSubmit={handleStart} className="max-w-md mx-auto">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t.test.namePlaceholder}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-6"
                  required
                  autoFocus
                />

                <button type="submit" className="w-full btn-primary text-xl py-4">
                  {t.test.startButton}
                </button>
              </form>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                <h3 className="font-bold text-gray-900 mb-3">{t.test.instructionsTitle}</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li dangerouslySetInnerHTML={{ __html: `• ${t.test.instruction1}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t.test.instruction2}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t.test.instruction3}` }} />
                  <li>• {t.test.instruction4}</li>
                  <li>• {t.test.instruction5}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Pantalla del test
  return (
    <>
      <TestHeader 
        timeRemaining={timeRemaining}
        currentQuestion={currentQuestion}
        totalQuestions={visualQuestions.length}
        userName={userName}
        t={t}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-2 lg:py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3 mb-3 lg:mb-8">
            <div 
              className="bg-[#07C59A] h-2 lg:h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Contenido principal - Layout lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 items-stretch h-[calc(100vh-140px)] lg:h-auto">
            {/* Panel izquierdo - Matriz 3x3 */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl p-3 lg:p-6 flex flex-col">
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 lg:mb-3 text-center">
                {t.test.completeSequence}
              </h3>
              
              <div className="grid grid-cols-3 gap-1.5 lg:gap-2 w-full max-w-[280px] lg:max-w-[340px] mx-auto p-1 lg:p-2 flex-1">
                {question.matrix.flat().map((cell, index) => (
                  <VisualCell 
                    key={index} 
                    cell={cell} 
                    size={80}
                    isHighlighted={cell.type === 'empty'}
                  />
                ))}
              </div>
            </div>

            {/* Panel derecho - Opciones A-F */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl p-3 lg:p-6 border-2 lg:border-4 border-[#07C59A] flex flex-col">
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 lg:mb-3 text-center">
                {t.test.chooseAnswer}
              </h3>
              
              <div className="grid grid-cols-3 gap-1.5 lg:gap-2 w-full max-w-[280px] lg:max-w-[340px] mx-auto p-1 lg:p-2 flex-1">
                {question.options.map((option, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 lg:gap-1.5">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#113240] text-white rounded-full flex items-center justify-center text-xs lg:text-sm font-bold">
                      {optionLetters[index]}
                    </div>
                    <div 
                      className="w-full aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleOptionSelect(index)}
                    >
                      <VisualCell cell={option} isOption={true} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer de navegación */}
          <div className="flex justify-center items-center mt-3 lg:mt-6 gap-2 lg:gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2 lg:py-2.5 rounded-full font-semibold text-xs lg:text-sm transition-all ${
                currentQuestion === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#113240] text-white hover:bg-[#052547]'
              }`}
            >
              <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">{t.test.previous}</span>
            </button>

            <div className="px-3 lg:px-6 py-2 lg:py-2.5 bg-[#07C59A] text-white rounded-full font-bold text-sm lg:text-base">
              {currentQuestion + 1}/{visualQuestions.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2 lg:py-2.5 rounded-full font-semibold text-xs lg:text-sm transition-all bg-[#113240] text-white hover:bg-[#052547]"
            >
              <span className="hidden sm:inline">{currentQuestion === visualQuestions.length - 1 ? t.test.finish : t.test.next}</span>
              <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Diapositiva de transición entre secciones */}
      {activeSlide && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <style>{`
            @keyframes iqBarRise {
              from { transform: scaleY(0); opacity: 0; }
              to   { transform: scaleY(1); opacity: 1; }
            }
            @keyframes iqOrbitDot {
              from { transform: rotate(0deg) translateX(36px) rotate(0deg); }
              to   { transform: rotate(360deg) translateX(36px) rotate(-360deg); }
            }
            @keyframes iqOrbitDot2 {
              from { transform: rotate(120deg) translateX(36px) rotate(-120deg); }
              to   { transform: rotate(480deg) translateX(36px) rotate(-480deg); }
            }
            @keyframes iqOrbitDot3 {
              from { transform: rotate(240deg) translateX(36px) rotate(-240deg); }
              to   { transform: rotate(600deg) translateX(36px) rotate(-600deg); }
            }
            @keyframes iqSlideIn {
              from { opacity: 0; transform: translateY(20px) scale(0.96); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes iqFadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .iq-slide-card { animation: iqSlideIn 0.45s cubic-bezier(.22,.68,0,1.2) both; }
            .iq-fu-0 { animation: iqFadeUp 0.4s ease-out 0.2s both; }
            .iq-fu-1 { animation: iqFadeUp 0.4s ease-out 0.35s both; }
            .iq-fu-2 { animation: iqFadeUp 0.4s ease-out 0.5s both; }
            .iq-fu-3 { animation: iqFadeUp 0.4s ease-out 0.65s both; }
            .iq-bar-1 { animation: iqBarRise 0.5s cubic-bezier(.22,.68,0,1.2) 0.15s both; transform-origin: bottom; }
            .iq-bar-2 { animation: iqBarRise 0.5s cubic-bezier(.22,.68,0,1.2) 0.3s both; transform-origin: bottom; }
            .iq-bar-3 { animation: iqBarRise 0.5s cubic-bezier(.22,.68,0,1.2) 0.45s both; transform-origin: bottom; }
            .iq-od-1 { animation: iqOrbitDot 3s linear infinite; }
            .iq-od-2 { animation: iqOrbitDot2 3s linear infinite; }
            .iq-od-3 { animation: iqOrbitDot3 3s linear infinite; }
          `}</style>
          <div
            className={`iq-slide-card w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-300 ${slideTransitioning ? 'opacity-0 scale-95' : ''}`}
            style={{ background: 'linear-gradient(135deg, #113240 0%, #07C59A 100%)' }}
          >
            {/* Dot mesh background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

            <div className="relative px-8 py-14 text-center text-white">
              <span className="iq-fu-0 inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-7"
                style={{ background: 'rgba(7,197,154,0.2)', border: '1px solid rgba(7,197,154,0.5)', color: '#07C59A' }}>
                {activeSlide.badge}
              </span>

              {/* Animation */}
              <div className="flex justify-center mb-7">
                {activeSlide.anim === 'bars' && (
                  <div className="flex items-end gap-3 h-16">
                    <div className="iq-bar-1 rounded-t-lg w-9" style={{ height: '45%', background: 'rgba(7,197,154,0.35)' }} />
                    <div className="iq-bar-2 rounded-t-lg w-9" style={{ height: '70%', background: 'rgba(7,197,154,0.65)' }} />
                    <div className="iq-bar-3 rounded-t-lg w-9" style={{ height: '100%', background: '#07C59A' }} />
                  </div>
                )}
                {activeSlide.anim === 'orbit' && (
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute rounded-full w-7 h-7" style={{ background: '#07C59A' }} />
                    <div className="absolute rounded-full w-16 h-16 border" style={{ borderColor: 'rgba(7,197,154,0.3)' }} />
                    <div className="iq-od-1 absolute" style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
                    <div className="iq-od-2 absolute" style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(7,197,154,0.7)' }} />
                    <div className="iq-od-3 absolute" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                  </div>
                )}
              </div>

              <h2 className="iq-fu-1 text-3xl font-black mb-2 tracking-tight">{activeSlide.title}</h2>
              <p className="iq-fu-2 text-base font-medium mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>{activeSlide.subtitle}</p>
              <p className="iq-fu-2 text-sm leading-relaxed mb-8 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>{activeSlide.description}</p>

              <button
                onClick={handleSlideContinue}
                className="iq-fu-3 inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-2xl transition-all hover:scale-105"
                style={{ background: 'rgba(7,197,154,0.2)', border: '1.5px solid rgba(7,197,154,0.5)', color: '#fff' }}
              >
                Continuar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación finalizar */}
      {showFinishConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.test.confirmFinishTitle}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {t.test.confirmFinishMessage}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFinishConfirmModal(false)}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-all duration-200"
                >
                  {t.test.goBack}
                </button>
                <button
                  onClick={() => {
                    setShowFinishConfirmModal(false)
                    handleFinishTest()
                  }}
                  className="flex-1 bg-[#113240] hover:bg-[#052547] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t.test.getResults}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal anti-bot */}
      {showTooFastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClock className="text-3xl text-yellow-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t?.test?.tooFastTitle}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {t?.test?.tooFastMessage}
              </p>
              
              <button
                onClick={() => setShowTooFastModal(false)}
                className="w-full bg-[#113240] hover:bg-[#052547] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t?.test?.understood}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
