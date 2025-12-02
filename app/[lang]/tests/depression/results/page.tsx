'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { DepressionResult, getDepressionInterpretation, getSeverityColor } from '@/lib/depression-questions'
import { FaBrain, FaPhone, FaExclamationTriangle } from 'react-icons/fa'

export default function DepressionResultsPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [results, setResults] = useState<DepressionResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResults = localStorage.getItem('testResults')
    if (storedResults) {
      const parsed = JSON.parse(storedResults)
      if (parsed.depression?.results) {
        setResults(parsed.depression.results)
      } else {
        router.push(`/${lang}/tests`)
      }
    } else {
      router.push(`/${lang}/tests`)
    }
    setLoading(false)
  }, [router, lang])

  if (loading || !results) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600"></div>
        </div>
      </>
    )
  }

  const interpretation = getDepressionInterpretation(results.severity)
  const colors = getSeverityColor(results.severity)

  const maxScore = 27 // 9 preguntas x 3 puntos máximo
  const percentage = Math.round((results.totalScore / maxScore) * 100)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container-custom max-w-5xl">
          {/* Emergency Alert - Si detectamos riesgo */}
          {results.needsHelp && (
            <div className="bg-red-600 text-white rounded-2xl shadow-2xl p-8 mb-8 animate-pulse">
              <div className="flex items-start gap-4">
                <FaExclamationTriangle className="text-4xl flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">🆘 BUSCA AYUDA INMEDIATA</h2>
                  <p className="mb-4 text-lg">
                    Tus respuestas indican que podrías estar en riesgo. Por favor, contacta con un profesional o línea de crisis AHORA.
                  </p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <ul className="space-y-2 font-bold">
                      <li>📞 <strong>Línea 024</strong> - Atención 24/7 (Gratuita)</li>
                      <li>📞 <strong>Teléfono de la Esperanza:</strong> 717 003 717</li>
                      <li>🚨 <strong>Emergencias:</strong> 112</li>
                    </ul>
                  </div>
                  <p className="mt-4 text-sm">
                    No estás solo/a. Hay ayuda disponible y puedes sentirte mejor. Por favor, llama ahora.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full mb-6">
              <span className="text-5xl">😔</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Resultados del Test de Depresión
            </h1>
            <p className="text-xl text-gray-600">
              Evaluación PHQ-9 (Patient Health Questionnaire)
            </p>
          </div>

          {/* Main Result */}
          <div className={`bg-gradient-to-r ${colors.bg} rounded-2xl shadow-2xl p-12 text-white mb-8 text-center`}>
            <h2 className="text-4xl font-bold mb-4">{interpretation.title}</h2>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div>
                <div className="text-6xl font-black">{results.totalScore}</div>
                <div className="text-sm opacity-90">Puntuación</div>
              </div>
              <div className="text-4xl opacity-75">/</div>
              <div>
                <div className="text-6xl font-black">{maxScore}</div>
                <div className="text-sm opacity-90">Máximo</div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 mb-4">
              <div
                className="bg-white h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xl opacity-90">{percentage}% del máximo</p>
          </div>

          {/* Interpretation */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interpretación</h3>
            <p className="text-gray-700 text-lg mb-6">{interpretation.description}</p>

            <h4 className="font-bold text-gray-900 mb-4 text-xl">Recomendaciones:</h4>
            <ul className="space-y-3">
              {interpretation.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={`${colors.text} font-bold flex-shrink-0 mt-1`}>
                    {rec.startsWith('⚠️') || rec.startsWith('🆘') ? '⚠️' : '•'}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Severity Scale */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Escala de Severidad PHQ-9
            </h3>
            
            <div className="space-y-4">
              {[
                { level: 'minimal', range: '0-4', label: 'Mínima', color: 'bg-green-500' },
                { level: 'mild', range: '5-9', label: 'Leve', color: 'bg-blue-500' },
                { level: 'moderate', range: '10-14', label: 'Moderada', color: 'bg-yellow-500' },
                { level: 'moderately_severe', range: '15-19', label: 'Moderadamente Severa', color: 'bg-orange-500' },
                { level: 'severe', range: '20-27', label: 'Severa', color: 'bg-red-500' }
              ].map(({ level, range, label, color }) => {
                const isCurrentLevel = results.severity === level
                return (
                  <div key={level} className={`p-4 rounded-lg transition-all ${
                    isCurrentLevel ? 'ring-4 ring-offset-2 ring-current scale-105' : 'opacity-50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {range}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{label}</h4>
                        {isCurrentLevel && (
                          <p className="text-sm text-gray-600">Tu nivel actual</p>
                        )}
                      </div>
                      {isCurrentLevel && (
                        <div className="text-3xl">✓</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Help Resources */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <FaPhone className="text-3xl text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-purple-900 mb-3">Recursos de Ayuda Profesional</h3>
                <ul className="space-y-2 text-purple-800">
                  <li>• <strong>Línea 024:</strong> Atención a la conducta suicida (24/7, gratuita)</li>
                  <li>• <strong>Teléfono de la Esperanza:</strong> 717 003 717</li>
                  <li>• <strong>Tu médico de cabecera:</strong> Puede derivarte a salud mental</li>
                  <li>• <strong>Psicólogos/Psiquiatras:</strong> Busca profesionales certificados</li>
                  <li>• <strong>Servicios de urgencias:</strong> 112 en caso de emergencia</li>
                </ul>
                <p className="mt-4 text-sm text-purple-800">
                  <strong>Recuerda:</strong> La depresión es una condición médica tratable. Con el apoyo adecuado, puedes sentirte mejor.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/${lang}/tests`)}
              className="flex items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transition-all shadow-lg"
            >
              <FaBrain />
              Hacer Otro Test
            </button>
            <button
              onClick={() => router.push(`/${lang}/cuenta`)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg"
            >
              Ver Mi Historial
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

