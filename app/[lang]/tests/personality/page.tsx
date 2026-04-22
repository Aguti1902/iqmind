'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { personalityQuestions, calculatePersonalityScores } from '@/lib/personality-questions'
import { useTranslations } from '@/hooks/useTranslations'
import { FaArrowRight } from 'react-icons/fa'

const dimMap: Record<string, string> = { E: 'cat1', A: 'cat2', C: 'cat3', N: 'cat4', O: 'cat5' }
const questions = personalityQuestions.map(q => ({ id: q.id, text: q.text, texts: q.texts, category: dimMap[q.dimension] }))

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

  const slides: SlideConfig[] = [
    { afterQuestionIndex: 7, animationType: 'orbit', title: tc.slide1Title || 'Amabilidad', subtitle: tc.slide1Subtitle || 'Tu lado empático y cooperativo', description: tc.slide1Desc, badge: tc.slide1Badge || '8 DE 44 COMPLETADAS' },
    { afterQuestionIndex: 16, animationType: 'bars', title: tc.slide2Title || 'Responsabilidad', subtitle: tc.slide2Subtitle || 'Organización y disciplina', description: tc.slide2Desc, badge: tc.slide2Badge || '17 DE 44 COMPLETADAS' },
    { afterQuestionIndex: 25, animationType: 'wave', title: tc.slide3Title || 'Neuroticismo', subtitle: tc.slide3Subtitle || 'Estabilidad emocional', description: tc.slide3Desc, badge: tc.slide3Badge || '26 DE 44 COMPLETADAS' },
    { afterQuestionIndex: 33, animationType: 'final', title: tc.slide4Title || '¡Última sección!', subtitle: tc.slide4Subtitle || 'Apertura a la Experiencia', description: tc.slide4Desc, badge: tc.slide4Badge || '34 DE 44 COMPLETADAS' },
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-violet-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">🧠</div>
                <h1 className="text-3xl font-black tracking-tight mb-2">{tc.title || 'Personalidad Big Five'}</h1>
                <p className="text-purple-100 text-base">{tc.subtitle || 'Modelo OCEAN · Científicamente validado'}</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-purple-50 rounded-2xl"><div className="text-2xl font-black text-purple-700">{tc.questionsCount || '44'}</div><div className="text-xs text-gray-500 mt-0.5">{cm.questions || 'Preguntas'}</div></div>
                  <div className="text-center p-3 bg-purple-50 rounded-2xl"><div className="text-2xl font-black text-purple-700">{tc.duration || "10'"}</div><div className="text-xs text-gray-500 mt-0.5">{cm.approxDuration || 'Aprox.'}</div></div>
                  <div className="text-center p-3 bg-purple-50 rounded-2xl"><div className="text-2xl font-black text-purple-700">{tc.sectionsCount || '5'}</div><div className="text-xs text-gray-500 mt-0.5">{cm.sections || 'Secciones'}</div></div>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-8">
                  {dims.map((d, i) => (
                    <div key={i} className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-xl mb-0.5">{d.emoji}</div>
                      <div className="text-xs font-black text-purple-600">{d.letter}</div>
                      <div className="text-[9px] text-gray-400 leading-tight">{tc[d.key as keyof typeof tc] as string || d.key}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-purple-800">💡 {tc.disclaimer || cm.disclaimer || 'No pienses demasiado. Responde con tu primera impresión.'}</p>
                </div>
                <form onSubmit={handleStart} className="space-y-4">
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder={cm.namePlaceholder || '¿Cómo te llamas?'} className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 transition-colors" required autoFocus />
                  <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    {cm.startButton || 'Comenzar Test'}<FaArrowRight />
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

  return <InteractiveTestPlayer config={config} />
}
