'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { PersonalityResult, getPersonalityInterpretation } from '@/lib/personality-questions'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'
import { FaDownload, FaArrowLeft, FaBrain } from 'react-icons/fa'

export default function PersonalityResultsPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [results, setResults] = useState<PersonalityResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResults = localStorage.getItem('testResults')
    if (storedResults) {
      const parsed = JSON.parse(storedResults)
      if (parsed.personality?.results) {
        setResults(parsed.personality.results)
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
      </>
    )
  }

  const radarData = [
    { dimension: 'Apertura', value: results.openness, fullMark: 100 },
    { dimension: 'Responsabilidad', value: results.conscientiousness, fullMark: 100 },
    { dimension: 'Extroversión', value: results.extraversion, fullMark: 100 },
    { dimension: 'Amabilidad', value: results.agreeableness, fullMark: 100 },
    { dimension: 'Neuroticismo', value: results.neuroticism, fullMark: 100 }
  ]

  const dimensions = [
    {
      name: 'Apertura',
      key: 'openness',
      score: results.openness,
      icon: '🎨',
      color: 'from-orange-500 to-orange-600',
      description: 'Creatividad, curiosidad y apertura a nuevas experiencias'
    },
    {
      name: 'Responsabilidad',
      key: 'conscientiousness',
      score: results.conscientiousness,
      icon: '📋',
      color: 'from-green-500 to-green-600',
      description: 'Organización, disciplina y orientación a objetivos'
    },
    {
      name: 'Extroversión',
      key: 'extraversion',
      score: results.extraversion,
      icon: '🎉',
      color: 'from-blue-500 to-blue-600',
      description: 'Sociabilidad, asertividad y nivel de energía'
    },
    {
      name: 'Amabilidad',
      key: 'agreeableness',
      score: results.agreeableness,
      icon: '❤️',
      color: 'from-pink-500 to-pink-600',
      description: 'Empatía, cooperación y consideración hacia otros'
    },
    {
      name: 'Neuroticismo',
      key: 'neuroticism',
      score: results.neuroticism,
      icon: '🌊',
      color: 'from-purple-500 to-purple-600',
      description: 'Estabilidad emocional y manejo del estrés'
    }
  ]

  const getScoreLabel = (score: number) => {
    if (score < 30) return { label: 'Bajo', color: 'text-blue-600' }
    if (score < 50) return { label: 'Medio-Bajo', color: 'text-cyan-600' }
    if (score < 70) return { label: 'Medio-Alto', color: 'text-yellow-600' }
    return { label: 'Alto', color: 'text-green-600' }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full mb-6">
              <span className="text-5xl">🧠</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Tu Perfil de Personalidad
            </h1>
            <p className="text-xl text-gray-600">
              Resultados basados en el modelo Big Five (OCEAN)
            </p>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Vista General de tu Personalidad
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="dimension" 
                  tick={{ fill: '#374151', fontSize: 14, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                <Radar
                  name="Tu Puntuación"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6 mb-8">
            {dimensions.map((dim) => {
              const scoreLabel = getScoreLabel(dim.score)
              return (
                <div key={dim.key} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className={`bg-gradient-to-r ${dim.color} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{dim.icon}</div>
                        <div>
                          <h3 className="text-2xl font-bold">{dim.name}</h3>
                          <p className="text-white/90">{dim.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black">{dim.score}</div>
                        <div className="text-sm font-semibold opacity-90">/ 100</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Nivel</span>
                        <span className={`text-sm font-bold ${scoreLabel.color}`}>{scoreLabel.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${dim.color} h-full rounded-full transition-all duration-1000`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Interpretation */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-2">Interpretación:</h4>
                      <p className="text-gray-700">
                        {getPersonalityInterpretation(dim.key, dim.score)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-[#113240] to-[#052547] rounded-2xl shadow-2xl p-12 text-white mb-8">
            <h2 className="text-4xl font-bold mb-6 text-center">Resumen de tu Personalidad</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-bold text-xl mb-3 text-[#07C59A]">Tus Fortalezas</h3>
                <ul className="space-y-2 text-sm">
                  {dimensions
                    .filter(d => d.score >= 60)
                    .map(d => (
                      <li key={d.key} className="flex items-center gap-2">
                        <span className="text-[#07C59A]">✓</span>
                        <span>{d.name} elevado/a ({d.score}%)</span>
                      </li>
                    ))}
                  {dimensions.filter(d => d.score >= 60).length === 0 && (
                    <li className="opacity-75">Perfil balanceado en todas las dimensiones</li>
                  )}
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-bold text-xl mb-3 text-yellow-300">Áreas de Desarrollo</h3>
                <ul className="space-y-2 text-sm">
                  {dimensions
                    .filter(d => d.score < 40)
                    .map(d => (
                      <li key={d.key} className="flex items-center gap-2">
                        <span className="text-yellow-300">→</span>
                        <span>{d.name} bajo/a ({d.score}%)</span>
                      </li>
                    ))}
                  {dimensions.filter(d => d.score < 40).length === 0 && (
                    <li className="opacity-75">No se identifican áreas significativas que requieran atención</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg text-gray-800 mb-6">
              <h3 className="font-bold text-gray-900 mb-2">💡 Nota Importante</h3>
              <p className="text-sm">
                Este test es una herramienta de autoconocimiento. No hay rasgos "buenos" o "malos". 
                Cada dimensión tiene sus ventajas dependiendo del contexto. El objetivo es conocerte mejor 
                para aprovechar tus fortalezas y trabajar conscientemente en áreas que quieras desarrollar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(`/${lang}/tests`)}
                className="flex items-center justify-center gap-2 bg-white text-[#113240] hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transition-all"
              >
                <FaBrain />
                Hacer Otro Test
              </button>
              <button
                onClick={() => router.push(`/${lang}/cuenta`)}
                className="flex items-center justify-center gap-2 bg-[#07C59A] hover:bg-[#069e7b] text-white px-8 py-4 rounded-lg font-bold transition-all"
              >
                Ver Mi Historial
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">🔬</div>
              <h3 className="font-bold text-gray-900 mb-2">Científicamente Validado</h3>
              <p className="text-sm text-gray-600">
                Basado en el modelo Big Five, uno de los marcos más estudiados en psicología de la personalidad.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Análisis Detallado</h3>
              <p className="text-sm text-gray-600">
                Resultados basados en 44 preguntas cuidadosamente diseñadas para evaluar cada dimensión.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Aplicación Práctica</h3>
              <p className="text-sm text-gray-600">
                Usa estos resultados para mejorar relaciones, carrera y desarrollo personal.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

