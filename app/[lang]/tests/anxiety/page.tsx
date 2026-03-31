'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { anxietyQuestions, calculateAnxietyScore } from '@/lib/anxiety-questions'
import { FaArrowRight, FaHeart, FaShieldAlt, FaCheckCircle } from 'react-icons/fa'

const scaleOptions: ScaleOption[] = [
  { value: 0, label: 'Nunca', emoji: '😌' },
  { value: 1, label: 'Varios días', emoji: '🙂' },
  { value: 2, label: 'Más de la mitad de los días', emoji: '😟' },
  { value: 3, label: 'Casi todos los días', emoji: '😰' },
]

const slides: SlideConfig[] = [
  {
    afterQuestionIndex: 9,
    icon: '💪',
    title: '¡Vas genial!',
    subtitle: 'Ya llevas la mitad del test',
    description: 'Estás haciendo un gran ejercicio de autoconocimiento. Las siguientes preguntas exploran aspectos físicos y conductuales de la ansiedad.',
    accentFrom: 'from-rose-500',
    accentTo: 'to-red-700',
    badge: '10 de 20 completadas',
  },
]

const questions = anxietyQuestions.map(q => ({ id: q.id, text: q.text }))

export default function AnxietyTestPage() {
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
    const results = calculateAnxietyScore(answers)
    localStorage.setItem('testResults', JSON.stringify({
      type: 'anxiety', answers, completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario',
    }))
    localStorage.setItem('anxietyResults', JSON.stringify({
      id: Date.now().toString(), type: 'anxiety', date: new Date().toISOString(), results, answers,
    }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'anxiety',
    title: 'Test de Ansiedad GAD-7',
    emoji: '❤️',
    colorFrom: 'from-rose-500',
    colorTo: 'to-red-700',
    colorLight: 'from-red-50',
    colorText: 'text-red-600',
    colorRing: 'ring-red-500',
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
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-rose-500 to-red-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">
                  ❤️
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Test de Ansiedad</h1>
                <p className="text-red-100 text-base">Escala GAD-7 Extendida · Validada clínicamente</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-red-50 rounded-2xl">
                    <div className="text-2xl font-black text-red-700">20</div>
                    <div className="text-xs text-gray-500 mt-0.5">Preguntas</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-2xl">
                    <div className="text-2xl font-black text-red-700">3'</div>
                    <div className="text-xs text-gray-500 mt-0.5">Aprox.</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-2xl">
                    <div className="text-2xl font-black text-red-700">GAD</div>
                    <div className="text-xs text-gray-500 mt-0.5">Estándar</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaHeart className="text-red-500 flex-shrink-0" />
                    <span>Evalúa síntomas de <strong>ansiedad generalizada</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaShieldAlt className="text-red-500 flex-shrink-0" />
                    <span>Basado en los <strong>últimos 14 días</strong> de tu vida</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCheckCircle className="text-red-500 flex-shrink-0" />
                    <span>Responde <strong>honestamente</strong> para obtener resultados útiles</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-blue-800">
                    💙 Este test es orientativo. Si experimentas ansiedad severa, te recomendamos <strong>buscar ayuda profesional</strong>.
                  </p>
                </div>

                <form onSubmit={handleStart} className="space-y-4">
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-red-500 transition-colors"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-500 to-red-700 hover:from-rose-600 hover:to-red-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
