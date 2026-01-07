'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { eqQuestions, calculateEQScores } from '@/lib/eq-questions'
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa'

export default function EQTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [started, setStarted] = useState(false)
  const [userName, setUserName] = useState('')

  const questionsPerPage = 1
  const totalPages = Math.ceil(eqQuestions.length / questionsPerPage)
  const currentQuestions = eqQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  )

  const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined)
  const progress = (Object.keys(answers).length / eqQuestions.length) * 100

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
    const results = calculateEQScores(answers)
    
    // Guardar resultados en localStorage
    const testResult = {
      id: Date.now().toString(),
      type: 'eq',
      date: new Date().toISOString(),
      results,
      answers
    }
    
    // Guardar en formato compatible con sistema de checkout
    localStorage.setItem('testResults', JSON.stringify({
      type: 'eq',
      answers,
      completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario'
    }))
    
    // Guardar datos específicos del test de EQ
    localStorage.setItem('eqResults', JSON.stringify(testResult))
    
    // Marcar como usuario nuevo (debe pasar por checkout)
    localStorage.removeItem('isPremiumTest')
    
    // Redirigir al flujo de análisis (igual que test de IQ)
    router.push(`/${lang}/analizando`)
  }

  if (!started) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
          <div className="container-custom max-w-4xl">
            {/* Pantalla de inicio con nombre */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💚</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Test de Inteligencia Emocional
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Evalúa tu capacidad para reconocer, comprender y gestionar emociones
              </p>

              <form onSubmit={handleStart} className="max-w-md mx-auto mb-8">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Introduce tu nombre"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-6"
                  required
                  autoFocus
                />
                <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-4 px-8 rounded-xl font-bold text-xl transition shadow-lg hover:shadow-xl">
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

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-green-900 mb-3">Sobre este test:</h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>33 preguntas</strong> sobre habilidades emocionales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>8-10 minutos</strong> de duración</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Evalúa <strong>5 componentes</strong> clave de la inteligencia emocional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Basado en el modelo de Daniel Goleman</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">🧠</div>
                  <h4 className="font-bold text-purple-900 text-sm mb-1">Autoconciencia</h4>
                  <p className="text-xs text-purple-700">Reconocer tus emociones</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-bold text-blue-900 text-sm mb-1">Autorregulación</h4>
                  <p className="text-xs text-blue-700">Controlar emociones</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <h4 className="font-bold text-yellow-900 text-sm mb-1">Motivación</h4>
                  <p className="text-xs text-yellow-700">Impulso interno</p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">❤️</div>
                  <h4 className="font-bold text-pink-900 text-sm mb-1">Empatía</h4>
                  <p className="text-xs text-pink-700">Comprender a otros</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">🤝</div>
                  <h4 className="font-bold text-green-900 text-sm mb-1">Habilidades Sociales</h4>
                  <p className="text-xs text-green-700">Relaciones efectivas</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-blue-900 mb-3">Instrucciones:</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• Responde pensando en cómo te comportas normalmente</li>
                  <li>• Usa la escala de 1 (Muy en desacuerdo) a 5 (Muy de acuerdo)</li>
                  <li>• No hay respuestas correctas o incorrectas</li>
                  <li>• Sé honesto/a para resultados precisos</li>
                </ul>
              </div>

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
        <div className="container-custom max-w-4xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Pregunta {Object.keys(answers).length} de {eqQuestions.length}
              </span>
              <span className="text-sm font-semibold text-green-600">
                {Math.round(progress)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-700 h-full rounded-full transition-all duration-500"
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
                      <span className="text-green-600 font-bold">{globalIndex + 1}.</span> {question.text}
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
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white scale-110 shadow-lg'
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
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
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

