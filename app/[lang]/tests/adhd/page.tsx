'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { adhdQuestions, calculateADHDScores } from '@/lib/adhd-questions'
import { FaArrowLeft, FaCheck } from 'react-icons/fa'

export default function ADHDTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [started, setStarted] = useState(false)

  const progress = (Object.keys(answers).length / adhdQuestions.length) * 100
  const isComplete = Object.keys(answers).length === adhdQuestions.length

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    const results = calculateADHDScores(answers)
    
    // Guardar resultados en localStorage
    const testResult = {
      id: Date.now().toString(),
      type: 'adhd',
      date: new Date().toISOString(),
      results,
      answers
    }
    
    // Guardar en formato compatible con sistema de checkout
    localStorage.setItem('testResults', JSON.stringify({
      type: 'adhd',
      answers,
      completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario'
    }))
    
    // Guardar datos específicos del test de TDAH
    localStorage.setItem('adhdResults', JSON.stringify(testResult))
    
    // Marcar como usuario nuevo (debe pasar por checkout)
    localStorage.removeItem('isPremiumTest')
    
    // Redirigir al flujo de análisis (igual que test de IQ)
    router.push(`/${lang}/analizando`)
  }

  if (!started) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
          <div className="container-custom max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎯</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Test de TDAH
                </h1>
                <p className="text-xl text-gray-600">
                  Evaluación de síntomas de Trastorno por Déficit de Atención e Hiperactividad
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-blue-900 mb-3">Sobre este test:</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>18 preguntas</strong> basadas en criterios DSM-5</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>5-8 minutos</strong> de duración aproximada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Evalúa <strong>2 categorías</strong>: Inatención e Hiperactividad/Impulsividad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Orientación sobre nivel de riesgo y recomendaciones</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-red-900 mb-3">⚠️ Importante - Disclaimer Médico:</h3>
                <ul className="space-y-2 text-red-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Este test es solo una <strong>herramienta de autoeva luación orientativa</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span><strong>NO es un diagnóstico médico</strong> ni sustituye la evaluación de un profesional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>El TDAH debe ser diagnosticado por un profesional de salud mental cualificado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Si los síntomas afectan significativamente tu vida, consulta con un especialista</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg mb-8">
                <h3 className="font-bold text-yellow-900 mb-3">Instrucciones:</h3>
                <ul className="space-y-2 text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">1.</span>
                    <span>Piensa en <strong>los últimos 6 meses</strong> de tu vida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">2.</span>
                    <span>Responde con qué frecuencia experimentas cada síntoma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">3.</span>
                    <span>Usa la escala: Nunca (0) - Rara vez (1) - A veces (2) - A menudo (3) - Muy a menudo (4)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">4.</span>
                    <span>Sé honesto/a para obtener resultados útiles</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="container-custom max-w-4xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Pregunta {Object.keys(answers).length} de {adhdQuestions.length}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(progress)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="space-y-8">
              {adhdQuestions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-lg text-gray-900 flex-1">
                      {question.text}
                    </p>
                  </div>
                  
                  {/* Scale */}
                  <div className="flex flex-col gap-2 pl-11">
                    {[
                      { value: 0, label: 'Nunca' },
                      { value: 1, label: 'Rara vez' },
                      { value: 2, label: 'A veces' },
                      { value: 3, label: 'A menudo' },
                      { value: 4, label: 'Muy a menudo' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(question.id, value)}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          answers[question.id] === value
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-[1.02]'
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

