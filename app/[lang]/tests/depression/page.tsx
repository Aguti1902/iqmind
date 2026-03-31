'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { depressionQuestions, calculateDepressionScore } from '@/lib/depression-questions'
import { FaArrowRight, FaPhoneAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'

const scaleOptions: ScaleOption[] = [
  { value: 0, label: 'Nunca', emoji: '😌' },
  { value: 1, label: 'Varios días', emoji: '🙂' },
  { value: 2, label: 'Más de la mitad de los días', emoji: '😟' },
  { value: 3, label: 'Casi todos los días', emoji: '😔' },
]

const slides: SlideConfig[] = [
  {
    afterQuestionIndex: 9,
    icon: '🌱',
    title: 'Vas muy bien',
    subtitle: 'La mitad del camino completada',
    description: 'Gracias por tu honestidad. Las siguientes preguntas exploran el bienestar físico, la energía y los patrones de pensamiento.',
    accentFrom: 'from-slate-600',
    accentTo: 'to-gray-800',
    badge: '10 de 20 completadas',
  },
]

const questions = depressionQuestions.map(q => ({
  id: q.id,
  text: q.text,
  warningText: q.id === 9
    ? '⚠️ Si tienes estos pensamientos, busca ayuda inmediata: Línea 024 (gratuita 24/7) o llama al 112'
    : undefined,
}))

export default function DepressionTestPage() {
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
    const results = calculateDepressionScore(answers)
    localStorage.setItem('testResults', JSON.stringify({
      type: 'depression', answers, completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario',
    }))
    localStorage.setItem('depressionResults', JSON.stringify({
      id: Date.now().toString(), type: 'depression', date: new Date().toISOString(), results, answers,
    }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'depression',
    title: 'Test de Depresión PHQ-9',
    emoji: '🌧️',
    colorFrom: 'from-slate-500',
    colorTo: 'to-gray-700',
    colorLight: 'from-gray-50',
    colorText: 'text-gray-600',
    colorRing: 'ring-gray-500',
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-slate-500 to-gray-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">
                  🌧️
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Test de Depresión</h1>
                <p className="text-gray-200 text-base">Cuestionario PHQ-9 Extendido · Validado clínicamente</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-gray-50 rounded-2xl">
                    <div className="text-2xl font-black text-gray-700">20</div>
                    <div className="text-xs text-gray-500 mt-0.5">Preguntas</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-2xl">
                    <div className="text-2xl font-black text-gray-700">5'</div>
                    <div className="text-xs text-gray-500 mt-0.5">Aprox.</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-2xl">
                    <div className="text-2xl font-black text-gray-700">PHQ</div>
                    <div className="text-xs text-gray-500 mt-0.5">Estándar</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaInfoCircle className="text-gray-500 flex-shrink-0" />
                    <span>Basado en los <strong>últimos 14 días</strong> de tu vida</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCheckCircle className="text-gray-500 flex-shrink-0" />
                    <span>Evalúa síntomas del <strong>estado de ánimo y bienestar</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaPhoneAlt className="text-red-500 flex-shrink-0" />
                    <span>Línea de crisis: <strong>024</strong> (gratuita 24h) · Emergencias: <strong>112</strong></span>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-red-800">
                    ⚠️ Este test es orientativo. <strong>NO es un diagnóstico</strong>. Si tienes pensamientos de hacerte daño, llama al <strong>024</strong> ahora.
                  </p>
                </div>

                <form onSubmit={handleStart} className="space-y-4">
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-500 transition-colors"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-slate-500 to-gray-700 hover:from-slate-600 hover:to-gray-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
