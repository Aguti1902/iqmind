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
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-8 px-4">
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-2xl p-10 text-center animate-fadeIn">
              {/* Icon */}
              <div className="w-20 h-20 bg-[#e6f5f5] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🧠</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                <span className="text-[#113240]">Mind</span><span className="text-[#07C59A]">Metric</span>
                {' '}{tc.title || 'Test de Personalidad'}
              </h1>
              <p className="text-lg text-gray-600 mb-8">{tc.subtitle || 'Modelo OCEAN · Científicamente validado'}</p>

              {/* Name input */}
              <form onSubmit={handleStart} className="max-w-md mx-auto">
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder={cm.namePlaceholder || '¿Cómo te llamas?'}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07C59A] focus:border-transparent mb-6"
                  required
                  autoFocus
                />
                <button type="submit" className="w-full btn-primary text-xl py-4">
                  {cm.startButton || 'Comenzar Test'}
                </button>
              </form>

              {/* Instructions */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-md mx-auto">
                <h3 className="font-bold text-gray-900 mb-3">ℹ️ {lang === 'en' ? 'Instructions' : 'Instrucciones'}:</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• {tc.disclaimer || 'No hay respuestas correctas o incorrectas'}</li>
                  <li>• {tc.feature1 || 'Elige con qué precisión cada afirmación te describe'}</li>
                  <li>• {tc.feature2 || 'Responde con tu primera impresión'}</li>
                  <li>• <strong>{tc.questionsCount || '30'}</strong> {cm.questions || 'preguntas'} · {lang === 'en' ? 'approx.' : 'aprox.'} <strong>{tc.duration || "8'"}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return <InteractiveTestPlayer config={config} />
}
