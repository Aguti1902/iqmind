'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { personalityQuestions30, calculatePersonalityScores } from '@/lib/personality-questions'
import { useTranslations } from '@/hooks/useTranslations'
import { FaArrowRight } from 'react-icons/fa'

const dimMap: Record<string, string> = { E: 'cat1', A: 'cat2', C: 'cat3', N: 'cat4', O: 'cat5' }
const questions = personalityQuestions30.map(q => ({ id: q.id, text: q.text, texts: q.texts, category: dimMap[q.dimension] }))

export default function PersonalityTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const { t } = useTranslations()
  const [started, setStarted] = useState(false)
  const [userName, setUserName] = useState('')

  const tc = t?.tests?.personality || {}
  const cm = t?.tests?.common || {}

  const scaleOptions: ScaleOption[] = [
    { value: 1, label: tc.scale1 || 'Muy en desacuerdo', emoji: '😤' },
    { value: 2, label: tc.scale2 || 'En desacuerdo', emoji: '🙁' },
    { value: 3, label: tc.scale3 || 'Neutral', emoji: '😐' },
    { value: 4, label: tc.scale4 || 'De acuerdo', emoji: '🙂' },
    { value: 5, label: tc.scale5 || 'Muy de acuerdo', emoji: '😄' },
  ]

  // 30 preguntas: E(0-5) A(6-11) C(12-17) N(18-23) O(24-29)
  const slides: SlideConfig[] = [
    { afterQuestionIndex: 5, animationType: 'orbit', title: tc.slide1Title || 'Amabilidad', subtitle: tc.slide1Subtitle || 'Tu lado empático y cooperativo', description: tc.slide1Desc, badge: '6 DE 30 COMPLETADAS' },
    { afterQuestionIndex: 11, animationType: 'bars', title: tc.slide2Title || 'Responsabilidad', subtitle: tc.slide2Subtitle || 'Organización y disciplina', description: tc.slide2Desc, badge: '12 DE 30 COMPLETADAS' },
    { afterQuestionIndex: 17, animationType: 'wave', title: tc.slide3Title || 'Neuroticismo', subtitle: tc.slide3Subtitle || 'Estabilidad emocional', description: tc.slide3Desc, badge: '18 DE 30 COMPLETADAS' },
    { afterQuestionIndex: 23, animationType: 'final', title: tc.slide4Title || '¡Última sección!', subtitle: tc.slide4Subtitle || 'Apertura a la Experiencia', description: tc.slide4Desc, badge: '24 DE 30 COMPLETADAS' },
  ]

  const translatedQuestions = questions.map(q => ({
    ...q, category: tc[q.category as keyof typeof tc] as string || q.category,
  }))

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) { localStorage.setItem('userName', userName); setStarted(true) }
  }

  const handleComplete = (answers: { [key: number]: number }) => {
    const results = calculatePersonalityScores(answers)
    localStorage.setItem('testResults', JSON.stringify({ type: 'personality', answers, completedAt: new Date().toISOString(), userName: localStorage.getItem('userName') || 'Usuario' }))
    localStorage.setItem('personalityResults', JSON.stringify({ id: Date.now().toString(), type: 'personality', date: new Date().toISOString(), results, answers }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'personality', title: tc.title || 'Test de Personalidad Big Five', emoji: '🧠',
    colorFrom: 'from-purple-500', colorTo: 'to-violet-700', colorLight: 'from-purple-50',
    colorText: 'text-purple-600', colorRing: 'ring-purple-500',
    scaleDisplay: 'circles',
    instruction: tc.feature1 || 'Elige con qué precisión cada afirmación te describe',
    questions: translatedQuestions, scaleOptions, slides, lang: lang as string,
    onBack: () => router.push(`/${lang}/tests`), onComplete: handleComplete,
  }

  const dims = [
    { key: 'cat1', emoji: '🎉', letter: 'E' },
    { key: 'cat2', emoji: '❤️', letter: 'A' },
    { key: 'cat3', emoji: '📋', letter: 'C' },
    { key: 'cat4', emoji: '🌊', letter: 'N' },
    { key: 'cat5', emoji: '🎨', letter: 'O' },
  ]

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#f0f4f8' }}>
        {/* Minimal header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push(`/${lang}/tests`)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium">
            <FaArrowRight className="rotate-180 text-xs" />
            <span>{cm.back || 'Volver'}</span>
          </button>
          <span className="text-xs text-gray-400">{tc.questionsCount || '30'} {cm.questions || 'preguntas'} · {tc.duration || "8'"}</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-md px-8 py-10 text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #e8f5f0, #d1fae5)' }}>
                <span className="text-3xl">🧠</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                <span style={{ color: '#113240' }}>Mind</span><span style={{ color: '#07C59A' }}>Metric</span>
                {' · '}{tc.title || 'Test de Personalidad'}
              </h1>
              <p className="text-gray-500 text-sm mb-7">{tc.subtitle || 'Modelo OCEAN · Científicamente validado'}</p>

              {/* Name input */}
              <p className="text-gray-600 text-sm font-medium mb-3">{cm.namePlaceholder ? `Antes de comenzar, ¿cómo te llamas?` : 'Antes de comenzar, ¿cómo te llamas?'}</p>
              <form onSubmit={handleStart} className="space-y-3">
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder={cm.namePlaceholder || '¿Cómo te llamas?'}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#07C59A] transition-colors"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3.5 px-8 rounded-xl font-bold text-base text-white transition-all"
                  style={{ background: '#113240' }}
                >
                  {cm.startButton || 'Comenzar Test'}
                </button>
              </form>

              {/* Instructions */}
              <div className="mt-6 text-left bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">ℹ️ {lang === 'en' ? 'Instructions' : 'Instrucciones'}:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• {tc.disclaimer || 'No hay respuestas correctas o incorrectas'}</li>
                  <li>• {tc.feature1 || 'Elige con qué precisión cada afirmación te describe'}</li>
                  <li>• {tc.feature2 || 'Responde con tu primera impresión'}</li>
                  <li>• {tc.questionsCount || '30'} {cm.questions || 'preguntas'} · {lang === 'en' ? 'approx.' : 'aprox.'} {tc.duration || "8'"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <InteractiveTestPlayer config={config} />
}
