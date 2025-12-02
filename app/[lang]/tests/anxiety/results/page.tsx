'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AnxietyResult, getAnxietyInterpretation, getSeverityColor } from '@/lib/anxiety-questions'
import { FaBrain, FaPhone } from 'react-icons/fa'

export default function AnxietyResultsPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [results, setResults] = useState<AnxietyResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResults = localStorage.getItem('testResults')
    if (storedResults) {
      const parsed = JSON.parse(storedResults)
      if (parsed.anxiety?.results) {
        setResults(parsed.anxiety.results)
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
      </>
    )
  }

  const interpretation = getAnxietyInterpretation(results.severity)
  const colors = getSeverityColor(results.severity)

  const maxScore = 21 // 7 preguntas x 3 puntos máximo
  const percentage = Math.round((results.totalScore / maxScore) * 100)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-12">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-red-500 to-red-700 rounded-full mb-6">
              <span className="text-5xl">❤️</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Resultados de Ansiedad
            </h1>
            <p className="text-xl text-gray-600">
              Evaluación GAD-7 (Trastorno de Ansiedad Generalizada)
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
                  <span className={`${colors.text} font-bold flex-shrink-0 mt-1`}>•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Severity Scale */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Escala de Severidad GAD-7
            </h3>
            
            <div className="space-y-4">
              {[
                { level: 'minimal', range: '0-4', label: 'Mínima', color: 'bg-green-500' },
                { level: 'mild', range: '5-9', label: 'Leve', color: 'bg-blue-500' },
                { level: 'moderate', range: '10-14', label: 'Moderada', color: 'bg-yellow-500' },
                { level: 'severe', range: '15-21', label: 'Severa', color: 'bg-red-500' }
              ].map(({ level, range, label, color }) => {
                const isCurrentLevel = results.severity === level
                return (
                  <div key={level} className={`p-4 rounded-lg transition-all ${
                    isCurrentLevel ? 'ring-4 ring-offset-2 ring-current scale-105' : 'opacity-50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
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

          {/* Emergency Resources */}
          {(results.severity === 'moderate' || results.severity === 'severe') && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <FaPhone className="text-3xl text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-3">Recursos de Ayuda</h3>
                  <p className="text-red-800 mb-4">
                    Si estás experimentando ansiedad significativa, hay ayuda disponible:
                  </p>
                  <ul className="space-y-2 text-red-800">
                    <li>• <strong>Línea de Crisis:</strong> 024 (España) - Atención 24/7</li>
                    <li>• <strong>Teléfono de la Esperanza:</strong> 717 003 717</li>
                    <li>• Consulta con tu médico de cabecera para derivación a salud mental</li>
                    <li>• Busca psicólogos certificados en tu área</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">🔬</div>
              <h3 className="font-bold text-gray-900 mb-2">Validado Clínicamente</h3>
              <p className="text-sm text-gray-600">
                El GAD-7 es usado mundialmente por profesionales de salud mental.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">💊</div>
              <h3 className="font-bold text-gray-900 mb-2">Tratable</h3>
              <p className="text-sm text-gray-600">
                La ansiedad responde bien a terapia, medicación o combinación de ambas.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-bold text-gray-900 mb-2">No Estás Solo/a</h3>
              <p className="text-sm text-gray-600">
                Millones de personas experimentan ansiedad. Hay comunidades y apoyo disponible.
              </p>
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
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg"
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

