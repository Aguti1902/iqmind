'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { eqQuestions, calculateEQScores } from '@/lib/eq-questions'
import { FaArrowRight } from 'react-icons/fa'

const scaleOptions: ScaleOption[] = [
  { value: 1, label: 'Muy en desacuerdo', emoji: '😤' },
  { value: 2, label: 'En desacuerdo', emoji: '🙁' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'De acuerdo', emoji: '🙂' },
  { value: 5, label: 'Muy de acuerdo', emoji: '😄' },
]

// EQ questions: self_awareness(1-7), self_regulation(8-14), motivation(15-21), empathy(22-28), social_skills(29-33)
const slides: SlideConfig[] = [
  {
    afterQuestionIndex: 6,
    animationType: 'bars',
    title: 'Autorregulación',
    subtitle: 'Control y gestión de tus emociones',
    description: 'Ahora exploraremos tu capacidad para controlar impulsos, manejar el estrés y adaptarte a los cambios.',
    badge: '7 DE 33 COMPLETADAS',
  },
  {
    afterQuestionIndex: 13,
    animationType: 'orbit',
    title: 'Motivación',
    subtitle: 'Tu fuerza interior y perseverancia',
    description: 'Exploraremos tu impulso interno, optimismo y orientación hacia el logro.',
    badge: '14 DE 33 COMPLETADAS',
  },
  {
    afterQuestionIndex: 20,
    animationType: 'wave',
    title: 'Empatía',
    subtitle: 'Conectar con los demás',
    description: 'Las siguientes preguntas evalúan tu capacidad para percibir y comprender las emociones de otras personas.',
    badge: '21 DE 33 COMPLETADAS',
  },
  {
    afterQuestionIndex: 27,
    animationType: 'final',
    title: 'Habilidades Sociales',
    subtitle: '¡Última sección!',
    description: 'Evaluaremos tu capacidad para construir relaciones, comunicarte e influir positivamente en los demás.',
    badge: '28 DE 33 COMPLETADAS',
  },
]

const categoryLabels: Record<string, string> = {
  self_awareness: 'Autoconciencia',
  self_regulation: 'Autorregulación',
  motivation: 'Motivación',
  empathy: 'Empatía',
  social_skills: 'Habilidades Sociales',
}

const questions = eqQuestions.map(q => ({
  id: q.id,
  text: q.text,
  category: categoryLabels[q.category],
}))

export default function EQTestPage() {
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
    const results = calculateEQScores(answers)
    localStorage.setItem('testResults', JSON.stringify({
      type: 'eq', answers, completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario',
    }))
    localStorage.setItem('eqResults', JSON.stringify({
      id: Date.now().toString(), type: 'eq', date: new Date().toISOString(), results, answers,
    }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'eq',
    title: 'Test de Inteligencia Emocional',
    emoji: '💚',
    colorFrom: 'from-green-500',
    colorTo: 'to-emerald-700',
    colorLight: 'from-green-50',
    colorText: 'text-green-600',
    colorRing: 'ring-green-500',
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">
                  💚
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Inteligencia Emocional</h1>
                <p className="text-green-100 text-base">Modelo Goleman · 5 dimensiones clave</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-green-50 rounded-2xl">
                    <div className="text-2xl font-black text-green-700">33</div>
                    <div className="text-xs text-gray-500 mt-0.5">Preguntas</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-2xl">
                    <div className="text-2xl font-black text-green-700">8'</div>
                    <div className="text-xs text-gray-500 mt-0.5">Aprox.</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-2xl">
                    <div className="text-2xl font-black text-green-700">5</div>
                    <div className="text-xs text-gray-500 mt-0.5">Secciones</div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-8">
                  {[
                    { emoji: '🧠', label: 'Auto-\nconciencia' },
                    { emoji: '🎯', label: 'Auto-\nrregulación' },
                    { emoji: '🚀', label: 'Motiva-\nción' },
                    { emoji: '❤️', label: 'Empa-\ntía' },
                    { emoji: '🤝', label: 'Hab.\nSociales' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-[10px] text-gray-500 leading-tight whitespace-pre-line">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-green-800">
                    💡 No hay respuestas correctas o incorrectas. Responde pensando en cómo <strong>eres habitualmente</strong>.
                  </p>
                </div>

                <form onSubmit={handleStart} className="space-y-4">
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 transition-colors"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
