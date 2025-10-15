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
      // Verificar anti-bot (1 minuto)
      const timeElapsed = Date.now() - startTime
      const oneMinute = 60 * 1000
      
      if (timeElapsed < oneMinute) {
        setShowTooFastModal(true)
        return
      }
      
      // Mostrar modal de confirmación para finalizar
      setShowFinishConfirmModal(true)
      return
    }

    // Avance automático para preguntas que no son la última
    setTimeout(() => {
      setCurrentQuestion(currentQuestion + 1)
    }, 300)
  }

  const handleFinishTest = () => {
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
            <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                <FaUser className="text-4xl text-[#218B8E]" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                <span className="text-[#031C43]">IQ</span><span className="text-[#218B8E]">mind</span> {t.test.title}
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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-[#218B8E] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Contenido principal - Layout lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch h-[calc(100vh-200px)]">
            {/* Panel izquierdo - Matriz 3x3 */}
            <div className="bg-white rounded-2xl shadow-lg p-3 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 text-center">
                {t.test.completeSequence}
              </h3>
              
              <div className="grid grid-cols-3 gap-1.5 w-full max-w-[280px] mx-auto flex-1">
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
            <div className="bg-white rounded-2xl shadow-lg p-3 border-2 border-[#218B8E] flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 text-center">
                {t.test.chooseAnswer}
              </h3>
              
              <div className="grid grid-cols-3 gap-1.5 w-full max-w-[280px] mx-auto flex-1">
                {question.options.map((option, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 bg-[#031C43] text-white rounded-full flex items-center justify-center text-xs font-bold">
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
          <div className="flex justify-center items-center mt-4 gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                currentQuestion === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#031C43] text-white hover:bg-[#052547]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t.test.previous}
            </button>

            <div className="px-4 py-2 bg-[#218B8E] text-white rounded-full font-bold text-sm">
              {currentQuestion + 1}/{visualQuestions.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all bg-[#031C43] text-white hover:bg-[#052547]"
            >
              {currentQuestion === visualQuestions.length - 1 ? t.test.finish : t.test.next}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

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
                  className="flex-1 bg-[#031C43] hover:bg-[#052547] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
                className="w-full bg-[#031C43] hover:bg-[#052547] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
