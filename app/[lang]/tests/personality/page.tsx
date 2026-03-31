'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { personalityQuestions, calculatePersonalityScores } from '@/lib/personality-questions'
import { FaArrowRight } from 'react-icons/fa'

const scaleOptions: ScaleOption[] = [
  { value: 1, label: 'Muy en desacuerdo', emoji: '😤' },
  { value: 2, label: 'En desacuerdo', emoji: '🙁' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'De acuerdo', emoji: '🙂' },
  { value: 5, label: 'Muy de acuerdo', emoji: '😄' },
]

// Personality: E(1-8), A(9-17), C(18-26), N(27-34), O(35-44)
const slides: SlideConfig[] = [
  {
    afterQuestionIndex: 7,
    animationType: 'orbit',
    title: 'Amabilidad',
    subtitle: 'Tu lado empático y cooperativo',
    description: 'Evaluaremos tu tendencia hacia la compasión, la confianza en los demás y el trabajo en equipo.',
    badge: '8 DE 44 COMPLETADAS',
  },
  {
    afterQuestionIndex: 16,
    animationType: 'bars',
    title: 'Responsabilidad',
    subtitle: 'Organización y disciplina',
    description: 'Ahora exploraremos tu nivel de organización, fiabilidad y orientación al logro.',
    badge: '17 DE 44 COMPLETADAS',
  },
  {
    afterQuestionIndex: 25,
    animationType: 'wave',
    title: 'Neuroticismo',
    subtitle: 'Estabilidad emocional',
    description: 'Exploraremos tu tendencia a experimentar emociones negativas como ansiedad, irritabilidad o tristeza.',
    badge: '26 DE 44 COMPLETADAS',
  },
  {
    afterQuestionIndex: 33,
    animationType: 'final',
    title: '¡Última sección!',
    subtitle: 'Apertura a la Experiencia',
    description: 'La sección final evalúa tu curiosidad intelectual, creatividad e interés por nuevas experiencias.',
    badge: '34 DE 44 COMPLETADAS',
  },
]

const dimensionLabels: Record<string, string> = {
  E: 'Extroversión',
  A: 'Amabilidad',
  C: 'Responsabilidad',
  N: 'Neuroticismo',
  O: 'Apertura',
}

const questions = personalityQuestions.map(q => ({
  id: q.id,
  text: q.text,
  category: dimensionLabels[q.dimension],
}))

export default function PersonalityTestPage() {
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
    const results = calculatePersonalityScores(answers)
    localStorage.setItem('testResults', JSON.stringify({
      type: 'personality', answers, completedAt: new Date().toISOString(),
      userName: localStorage.getItem('userName') || 'Usuario',
    }))
    localStorage.setItem('personalityResults', JSON.stringify({
      id: Date.now().toString(), type: 'personality', date: new Date().toISOString(), results, answers,
    }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'personality',
    title: 'Test de Personalidad Big Five',
    emoji: '🧠',
    colorFrom: 'from-purple-500',
    colorTo: 'to-violet-700',
    colorLight: 'from-purple-50',
    colorText: 'text-purple-600',
    colorRing: 'ring-purple-500',
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-violet-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">
                  🧠
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Personalidad Big Five</h1>
                <p className="text-purple-100 text-base">Modelo OCEAN · Científicamente validado</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-purple-50 rounded-2xl">
                    <div className="text-2xl font-black text-purple-700">44</div>
                    <div className="text-xs text-gray-500 mt-0.5">Preguntas</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-2xl">
                    <div className="text-2xl font-black text-purple-700">10'</div>
                    <div className="text-xs text-gray-500 mt-0.5">Aprox.</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-2xl">
                    <div className="text-2xl font-black text-purple-700">5</div>
                    <div className="text-xs text-gray-500 mt-0.5">Dimensiones</div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-8">
                  {[
                    { emoji: '🎉', letter: 'E', label: 'Extro-\nversión' },
                    { emoji: '❤️', letter: 'A', label: 'Amabi-\nlidad' },
                    { emoji: '📋', letter: 'C', label: 'Respon-\nsabilidad' },
                    { emoji: '🌊', letter: 'N', label: 'Neuro-\nticismo' },
                    { emoji: '🎨', letter: 'O', label: 'Aper-\ntura' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-xl mb-0.5">{item.emoji}</div>
                      <div className="text-xs font-black text-purple-600">{item.letter}</div>
                      <div className="text-[9px] text-gray-400 leading-tight whitespace-pre-line">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-purple-800">
                    💡 No pienses demasiado. Responde con tu <strong>primera impresión</strong>. No hay respuestas correctas ni incorrectas.
                  </p>
                </div>

                <form onSubmit={handleStart} className="space-y-4">
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 transition-colors"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
