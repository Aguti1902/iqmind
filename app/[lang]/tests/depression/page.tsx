'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { depressionQuestions, calculateDepressionScore } from '@/lib/depression-questions'
import { FaArrowLeft, FaCheck, FaExclamationTriangle } from 'react-icons/fa'

export default function DepressionTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [started, setStarted] = useState(false)

  const progress = (Object.keys(answers).length / depressionQuestions.length) * 100
  const isComplete = Object.keys(answers).length === depressionQuestions.length

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    const results = calculateDepressionScore(answers)
    
    // Guardar resultados en localStorage
    const testResult = {
      id: Date.now().toString(),
      type: 'depression',
      date: new Date().toISOString(),
      results,
      answers
    }
    
    // Guardar en formato compatible con sistema de checkout
    localStorage.setItem('testResults', JSON.stringify({
      type: 'depression',
      answers,
      completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario'
    }))
    
    // Guardar datos específicos del test de depresión
    localStorage.setItem('depressionResults', JSON.stringify(testResult))
    
    // Marcar como usuario nuevo (debe pasar por checkout)
    localStorage.removeItem('isPremiumTest')
    
    // Redirigir al flujo de análisis (igual que test de IQ)
    router.push(`/${lang}/analizando`)
  }

  if (!started) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
          <div className="container-custom max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">😔</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Test de Depresión PHQ-9
                </h1>
                <p className="text-xl text-gray-600">
                  Cuestionario de Salud del Paciente - Evaluación de síntomas depresivos
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-blue-900 mb-3">Sobre este test:</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>9 preguntas</strong> de la escala PHQ-9 clínicamente validada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>3-5 minutos</strong> de duración</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Evalúa síntomas de <strong>depresión</strong> según criterios DSM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Herramienta usada por profesionales de salud mental</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg mb-8">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-2xl text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-3">⚠️ Importante - Disclaimer Médico:</h3>
                    <ul className="space-y-2 text-red-800 text-sm">
                      <li>• Este test es una <strong>herramienta de autoevaluación</strong>, NO un diagnóstico médico</li>
                      <li>• Solo un profesional puede diagnosticar depresión clínica</li>
                      <li>• Si tienes <strong>pensamientos de autolesión o suicidio</strong>, busca ayuda inmediata</li>
                      <li>• La depresión es tratable - hay recursos y tratamientos efectivos disponibles</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-yellow-900 mb-3">Instrucciones:</h3>
                <p className="text-yellow-800 mb-3">
                  Durante las <strong>últimas 2 semanas</strong>, ¿con qué frecuencia has experimentado estos problemas?
                </p>
                <ul className="space-y-2 text-yellow-800 text-sm">
                  <li>• Nunca (0 puntos)</li>
                  <li>• Varios días (1 punto)</li>
                  <li>• Más de la mitad de los días (2 puntos)</li>
                  <li>• Casi todos los días (3 puntos)</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-purple-900 mb-3">🆘 Líneas de Ayuda Inmediata:</h3>
                <ul className="space-y-2 text-purple-800 text-sm">
                  <li>• <strong>Línea 024</strong> - Atención a conducta suicida (24/7)</li>
                  <li>• <strong>Teléfono de la Esperanza:</strong> 717 003 717</li>
                  <li>• <strong>Emergencias:</strong> 112</li>
                  <li>• Si tienes pensamientos de hacerte daño, llama AHORA</li>
                </ul>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container-custom max-w-4xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Pregunta {Object.keys(answers).length} de {depressionQuestions.length}
              </span>
              <span className="text-sm font-semibold text-gray-600">
                {Math.round(progress)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-gray-500 to-gray-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Durante las últimas 2 semanas...
            </h2>
            <p className="text-gray-600 mb-6">¿Con qué frecuencia has experimentado estos problemas?</p>

            <div className="space-y-8">
              {depressionQuestions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-lg text-gray-900 flex-1">
                      {question.text}
                    </p>
                  </div>
                  
                  {/* Warning for question 9 */}
                  {question.id === 9 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 ml-11 rounded-r-lg">
                      <p className="text-sm text-red-800">
                        <strong>⚠️ Si tienes estos pensamientos, busca ayuda inmediata: Línea 024 o 112</strong>
                      </p>
                    </div>
                  )}
                  
                  {/* Options */}
                  <div className="flex flex-col gap-2 pl-11">
                    {[
                      { value: 0, label: 'Nunca' },
                      { value: 1, label: 'Varios días' },
                      { value: 2, label: 'Más de la mitad de los días' },
                      { value: 3, label: 'Casi todos los días' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(question.id, value)}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          answers[question.id] === value
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg scale-[1.02]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push(`/${lang}/tests`)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all"
            >
              <FaArrowLeft />
              Volver
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isComplete}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${
                isComplete
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaCheck />
              Ver Resultados
            </button>
          </div>

          {!isComplete && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Por favor, responde todas las preguntas para ver tus resultados
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

