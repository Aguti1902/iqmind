'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ADHDResult, getADHDInterpretation, getCategoryInterpretation } from '@/lib/adhd-questions'
import { FaArrowLeft, FaBrain, FaExclamationTriangle } from 'react-icons/fa'

export default function ADHDResultsPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [results, setResults] = useState<ADHDResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResults = localStorage.getItem('testResults')
    if (storedResults) {
      const parsed = JSON.parse(storedResults)
      if (parsed.adhd?.results) {
        setResults(parsed.adhd.results)
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  const interpretation = getADHDInterpretation(results.riskLevel)
  const categoryInterpretation = getCategoryInterpretation(results.category)

  const getRiskColor = (level: string) => {
    const colors = {
      low: { bg: 'from-green-500 to-green-600', text: 'text-green-600', light: 'bg-green-50' },
      moderate: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600', light: 'bg-yellow-50' },
      high: { bg: 'from-red-500 to-red-600', text: 'text-red-600', light: 'bg-red-50' }
    }
    return colors[level as keyof typeof colors]
  }

  const riskColors = getRiskColor(results.riskLevel)
  const maxScore = 72 // 18 preguntas x 4 puntos máximo
  const percentage = Math.round((results.totalScore / maxScore) * 100)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mb-6">
              <span className="text-5xl">🎯</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Resultados del Test de TDAH
            </h1>
            <p className="text-xl text-gray-600">
              Evaluación basada en criterios DSM-5
            </p>
          </div>

          {/* Main Result Card */}
          <div className={`bg-gradient-to-r ${riskColors.bg} rounded-2xl shadow-2xl p-12 text-white mb-8 text-center`}>
            <h2 className="text-4xl font-bold mb-4">{interpretation.title}</h2>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div>
                <div className="text-6xl font-black">{results.totalScore}</div>
                <div className="text-sm opacity-90">Puntuación Total</div>
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

            <div className={`${riskColors.light} border-l-4 border-${results.riskLevel === 'low' ? 'green' : results.riskLevel === 'moderate' ? 'yellow' : 'red'}-500 p-6 rounded-r-lg mb-6`}>
              <h4 className="font-bold text-gray-900 mb-3">Patrón Identificado:</h4>
              <p className="text-gray-800">{categoryInterpretation}</p>
            </div>

            <h4 className="font-bold text-gray-900 mb-4 text-xl">Recomendaciones:</h4>
            <ul className="space-y-3">
              {interpretation.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={`${riskColors.text} font-bold flex-shrink-0 mt-1`}>•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Inatención */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Inatención</h3>
                    <p className="text-sm opacity-90">Dificultades de atención y organización</p>
                  </div>
                  <div className="text-4xl font-black">{results.inattentionScore}</div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Nivel</span>
                    <span className="text-sm font-bold text-purple-600">
                      {Math.round((results.inattentionScore / 36) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-700 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(results.inattentionScore / 36) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Incluye dificultades para mantener la atención, seguir instrucciones, organizarse y recordar tareas.
                </p>
              </div>
            </div>

            {/* Hiperactividad */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Hiperactividad</h3>
                    <p className="text-sm opacity-90">Inquietud e impulsividad</p>
                  </div>
                  <div className="text-4xl font-black">{results.hyperactivityScore}</div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Nivel</span>
                    <span className="text-sm font-bold text-orange-600">
                      {Math.round((results.hyperactivityScore / 36) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-700 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(results.hyperactivityScore / 36) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Incluye inquietud motora, dificultad para estar quieto, impulsividad y habla excesiva.
                </p>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <FaExclamationTriangle className="text-3xl text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-3">Importante - Aviso Médico</h3>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Este test es una <strong>herramienta de autoevaluación</strong>, no un diagnóstico médico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Solo un profesional de salud mental puede diagnosticar TDAH</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Si tus síntomas afectan tu vida diaria, consulta con un especialista</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Existen tratamientos efectivos disponibles para el TDAH</span>
                  </li>
                </ul>
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
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg"
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

