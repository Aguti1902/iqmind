'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { adhdQuestions, calculateADHDScores } from '@/lib/adhd-questions'
import { FaArrowRight, FaBrain, FaBolt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

const scaleOptions: ScaleOption[] = [
  { value: 0, label: 'Nunca', emoji: '😌' },
  { value: 1, label: 'Rara vez', emoji: '🙂' },
  { value: 2, label: 'A veces', emoji: '😐' },
  { value: 3, label: 'A menudo', emoji: '😟' },
  { value: 4, label: 'Muy a menudo', emoji: '😰' },
]

const slides: SlideConfig[] = [
  {
    afterQuestionIndex: 8,
    icon: '⚡',
    title: 'Sección 2',
    subtitle: 'Hiperactividad e Impulsividad',
    description: 'Ahora evaluaremos síntomas relacionados con la inquietud, el movimiento y el control de impulsos.',
    accentFrom: 'from-blue-600',
    accentTo: 'to-blue-800',
    badge: '9 de 18 completadas',
  },
]

const questions = adhdQuestions.map(q => ({
  id: q.id,
  text: q.text,
  category: q.category === 'inattention' ? 'Inatención' : 'Hiperactividad',
}))

export default function ADHDTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [userName, setUserName] = useState('')

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('userName', userName)
      setStarted(true)
    }
  }

  const handleComplete = (answers: { [key: number]: number }) => {
    const results = calculateADHDScores(answers)
    localStorage.setItem('testResults', JSON.stringify({
      type: 'adhd', answers, completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario',
    }))
    localStorage.setItem('adhdResults', JSON.stringify({
      id: Date.now().toString(), type: 'adhd', date: new Date().toISOString(), results, answers,
    }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'adhd',
    title: 'Test de TDAH',
    emoji: '🎯',
    colorFrom: 'from-blue-500',
    colorTo: 'to-blue-700',
    colorLight: 'from-blue-50',
    colorText: 'text-blue-600',
    colorRing: 'ring-blue-500',
    questions,
    scaleOptions,
    slides,
    lang: lang as string,
    onBack: () => router.push(`/${lang}/tests`),
    onComplete: handleComplete,
  }

  if (!started) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            {/* Hero Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">
                  🎯
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Test de TDAH</h1>
                <p className="text-blue-100 text-base">Evaluación basada en criterios DSM-5</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-black text-blue-700">18</div>
                    <div className="text-xs text-gray-500 mt-0.5">Preguntas</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-black text-blue-700">5'</div>
                    <div className="text-xs text-gray-500 mt-0.5">Aprox.</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-black text-blue-700">2</div>
                    <div className="text-xs text-gray-500 mt-0.5">Secciones</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaBrain className="text-blue-500 flex-shrink-0" />
                    <span>Sección 1: <strong>Inatención</strong> (9 preguntas)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaBolt className="text-blue-500 flex-shrink-0" />
                    <span>Sección 2: <strong>Hiperactividad e Impulsividad</strong> (9 preguntas)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                    <span>Piensa en los últimos <strong>6 meses</strong> de tu vida</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3">
                  <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Este test es una herramienta orientativa. <strong>No sustituye</strong> el diagnóstico de un profesional de salud mental.
                  </p>
                </div>

                <form onSubmit={handleStart} className="space-y-4">
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Comenzar Test
                    <FaArrowRight />
                  </button>
                </form>
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
      <InteractiveTestPlayer config={config} />
      <Footer />
    </>
  )
}
