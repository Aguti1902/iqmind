'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { personalityQuestions, calculatePersonalityScores } from '@/lib/personality-questions'
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa'

export default function PersonalityTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [started, setStarted] = useState(false)
  const [userName, setUserName] = useState('')
  const [userName, setUserName] = useState('')

  const questionsPerPage = 10
  const totalPages = Math.ceil(personalityQuestions.length / questionsPerPage)
  const currentQuestions = personalityQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  )

  const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined)
  const progress = (Object.keys(answers).length / personalityQuestions.length) * 100

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('userName', userName)
      setStarted(true)
    }
  }

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = () => {
    const results = calculatePersonalityScores(answers)
    
    // Guardar resultados en localStorage
    const testResult = {
      id: Date.now().toString(),
      type: 'personality',
      date: new Date().toISOString(),
      results,
      answers
    }
    
    // Guardar en formato compatible con sistema de checkout
    localStorage.setItem('testResults', JSON.stringify({
      type: 'personality',
      answers,
      completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario'
    }))
    
    // Guardar datos específicos del test de personalidad
    localStorage.setItem('personalityResults', JSON.stringify(testResult))
    
    // Marcar como usuario nuevo (debe pasar por checkout)
    localStorage.removeItem('isPremiumTest')
    
    // Redirigir al flujo de análisis (igual que test de IQ)
    router.push(`/${lang}/analizando`)
  }

  if (!started) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
          <div className="container-custom max-w-4xl">
            {/* Pantalla de inicio con nombre */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🧠</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Test de Personalidad Big Five
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Descubre los 5 rasgos fundamentales de tu personalidad
              </p>

              <form onSubmit={handleStart} className="max-w-md mx-auto mb-8">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Introduce tu nombre"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
                  required
                  autoFocus
                />
                <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-4 px-8 rounded-xl font-bold text-xl transition shadow-lg hover:shadow-xl">
                  Comenzar Test
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Información sobre el test
                </h2>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-purple-900 mb-3">Sobre este test:</h3>
                <ul className="space-y-2 text-purple-800">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span><strong>44 preguntas</strong> sobre tu comportamiento y preferencias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span><strong>10-15 minutos</strong> de duración aproximada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Evalúa <strong>5 dimensiones</strong>: Apertura, Responsabilidad, Extroversión, Amabilidad y Neuroticismo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Basado en el modelo <strong>OCEAN</strong>, científicamente validado</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-blue-900 mb-3">Instrucciones:</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">1.</span>
                    <span>Responde con honestidad, no hay respuestas correctas o incorrectas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">2.</span>
                    <span>Usa la escala de 1 a 5, donde 1 es "Muy en desacuerdo" y 5 es "Muy de acuerdo"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">3.</span>
                    <span>No pienses demasiado, responde con tu primera impresión</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">4.</span>
                    <span>Completa todas las preguntas para obtener resultados precisos</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">🎨</div>
                  <h4 className="font-bold text-orange-900 text-sm">Apertura</h4>
                  <p className="text-xs text-orange-700">Creatividad e imaginación</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <h4 className="font-bold text-green-900 text-sm">Responsabilidad</h4>
                  <p className="text-xs text-green-700">Organización y disciplina</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <h4 className="font-bold text-blue-900 text-sm">Extroversión</h4>
                  <p className="text-xs text-blue-700">Sociabilidad y energía</p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">❤️</div>
                  <h4 className="font-bold text-pink-900 text-sm">Amabilidad</h4>
                  <p className="text-xs text-pink-700">Empatía y cooperación</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">🌊</div>
                  <h4 className="font-bold text-purple-900 text-sm">Neuroticismo</h4>
                  <p className="text-xs text-purple-700">Estabilidad emocional</p>
                </div>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Comenzar Test
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
        <div className="container-custom max-w-4xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Pregunta {Object.keys(answers).length} de {personalityQuestions.length}
              </span>
              <span className="text-sm font-semibold text-purple-600">
                {Math.round(progress)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Página {currentPage + 1} de {totalPages}
            </h2>

            <div className="space-y-8">
              {currentQuestions.map((question, index) => {
                const globalIndex = currentPage * questionsPerPage + index
                return (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <p className="text-lg font-medium text-gray-900 mb-4">
                      <span className="text-purple-600 font-bold">{globalIndex + 1}.</span> {question.text}
                    </p>
                    
                    {/* Scale */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className="text-sm text-gray-600 whitespace-nowrap">Muy en desacuerdo</span>
                      <div className="flex gap-2 flex-1 justify-center">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => handleAnswer(question.id, value)}
                            className={`w-12 h-12 rounded-full font-bold transition-all duration-200 ${
                              answers[question.id] === value
                                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white scale-110 shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">Muy de acuerdo</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'
              }`}
            >
              <FaArrowLeft />
              Anterior
            </button>

            {currentPage === totalPages - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isPageComplete}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${
                  isPageComplete
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaCheck />
                Ver Resultados
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isPageComplete}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isPageComplete
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Siguiente
                <FaArrowRight />
              </button>
            )}
          </div>

          {!isPageComplete && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Por favor, responde todas las preguntas de esta página para continuar
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

