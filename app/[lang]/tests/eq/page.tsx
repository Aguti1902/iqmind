'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { eqQuestions, calculateEQScores } from '@/lib/eq-questions'
import { useTranslations } from '@/hooks/useTranslations'
import { FaArrowRight } from 'react-icons/fa'

const catMap: Record<string, string> = {
  self_awareness: 'cat1', self_regulation: 'cat2',
  motivation: 'cat3', empathy: 'cat4', social_skills: 'cat5',
}
const questions = eqQuestions.map(q => ({ id: q.id, text: q.text, category: catMap[q.category] }))

export default function EQTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const { t } = useTranslations()
  const [started, setStarted] = useState(false)
  const [userName, setUserName] = useState('')

  const tc = t?.tests?.eq || {}
  const cm = t?.tests?.common || {}

  const scaleOptions: ScaleOption[] = [
    { value: 1, label: tc.scale1 || 'Muy en desacuerdo', emoji: '😤' },
    { value: 2, label: tc.scale2 || 'En desacuerdo', emoji: '🙁' },
    { value: 3, label: tc.scale3 || 'Neutral', emoji: '😐' },
    { value: 4, label: tc.scale4 || 'De acuerdo', emoji: '🙂' },
    { value: 5, label: tc.scale5 || 'Muy de acuerdo', emoji: '😄' },
  ]

  const slides: SlideConfig[] = [
    { afterQuestionIndex: 6, animationType: 'bars', title: tc.slide1Title || 'Autorregulación', subtitle: tc.slide1Subtitle || 'Control y gestión de tus emociones', description: tc.slide1Desc, badge: tc.slide1Badge || '7 DE 33 COMPLETADAS' },
    { afterQuestionIndex: 13, animationType: 'orbit', title: tc.slide2Title || 'Motivación', subtitle: tc.slide2Subtitle || 'Tu fuerza interior y perseverancia', description: tc.slide2Desc, badge: tc.slide2Badge || '14 DE 33 COMPLETADAS' },
    { afterQuestionIndex: 20, animationType: 'wave', title: tc.slide3Title || 'Empatía', subtitle: tc.slide3Subtitle || 'Conectar con los demás', description: tc.slide3Desc, badge: tc.slide3Badge || '21 DE 33 COMPLETADAS' },
    { afterQuestionIndex: 27, animationType: 'final', title: tc.slide4Title || 'Habilidades Sociales', subtitle: tc.slide4Subtitle || '¡Última sección!', description: tc.slide4Desc, badge: tc.slide4Badge || '28 DE 33 COMPLETADAS' },
  ]

  const translatedQuestions = questions.map(q => ({
    ...q, category: tc[q.category as keyof typeof tc] as string || q.category,
  }))

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) { localStorage.setItem('userName', userName); setStarted(true) }
  }

  const handleComplete = (answers: { [key: number]: number }) => {
    const results = calculateEQScores(answers)
    localStorage.setItem('testResults', JSON.stringify({ type: 'eq', answers, completedAt: new Date().toISOString(), userName: localStorage.getItem('userName') || 'Usuario' }))
    localStorage.setItem('eqResults', JSON.stringify({ id: Date.now().toString(), type: 'eq', date: new Date().toISOString(), results, answers }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'eq', title: tc.title || 'Inteligencia Emocional', emoji: '💚',
    colorFrom: 'from-green-500', colorTo: 'to-emerald-700', colorLight: 'from-green-50',
    colorText: 'text-green-600', colorRing: 'ring-green-500',
    scaleDisplay: 'circles',
    instruction: tc.feature1 || 'Elige con qué precisión cada afirmación te describe',
    questions: translatedQuestions, scaleOptions, slides, lang: lang as string,
    onBack: () => router.push(`/${lang}/tests`), onComplete: handleComplete,
  }

  const dims = [
    { key: 'cat1', emoji: '🧠', default: 'Auto-\nconciencia' },
    { key: 'cat2', emoji: '🎯', default: 'Auto-\nrregulación' },
    { key: 'cat3', emoji: '🚀', default: 'Motiva-\nción' },
    { key: 'cat4', emoji: '❤️', default: 'Empa-\ntía' },
    { key: 'cat5', emoji: '🤝', default: 'Hab.\nSociales' },
  ]

  if (!started) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">💚</div>
                <h1 className="text-3xl font-black tracking-tight mb-2">{tc.title || 'Inteligencia Emocional'}</h1>
                <p className="text-green-100 text-base">{tc.subtitle || 'Modelo Goleman · 5 dimensiones clave'}</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-green-50 rounded-2xl"><div className="text-2xl font-black text-green-700">{tc.questionsCount || '33'}</div><div className="text-xs text-gray-500 mt-0.5">{cm.questions || 'Preguntas'}</div></div>
                  <div className="text-center p-3 bg-green-50 rounded-2xl"><div className="text-2xl font-black text-green-700">{tc.duration || "8'"}</div><div className="text-xs text-gray-500 mt-0.5">{cm.approxDuration || 'Aprox.'}</div></div>
                  <div className="text-center p-3 bg-green-50 rounded-2xl"><div className="text-2xl font-black text-green-700">{tc.sectionsCount || '5'}</div><div className="text-xs text-gray-500 mt-0.5">{cm.sections || 'Secciones'}</div></div>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-8">
                  {dims.map((d, i) => (
                    <div key={i} className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="text-2xl mb-1">{d.emoji}</div>
                      <div className="text-[10px] text-gray-500 leading-tight whitespace-pre-line">{tc[d.key as keyof typeof tc] || d.default}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-green-800">💡 {tc.disclaimer || cm.disclaimer || 'No hay respuestas correctas o incorrectas.'}</p>
                </div>
                <form onSubmit={handleStart} className="space-y-4">
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder={cm.namePlaceholder || '¿Cómo te llamas?'} className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 transition-colors" required autoFocus />
                  <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
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
