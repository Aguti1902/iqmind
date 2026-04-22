'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveTestPlayer, { TestConfig, ScaleOption, SlideConfig } from '@/components/InteractiveTestPlayer'
import { adhdQuestions, calculateADHDScores } from '@/lib/adhd-questions'
import { useTranslations } from '@/hooks/useTranslations'
import { FaArrowRight, FaBrain, FaBolt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

const questions = adhdQuestions.map(q => ({
  id: q.id,
  text: q.text,
  category: q.category === 'inattention' ? 'cat1' : 'cat2',
}))

export default function ADHDTestPage() {
  const { lang } = useParams()
  const router = useRouter()
  const { t } = useTranslations()
  const [started, setStarted] = useState(false)
  const [userName, setUserName] = useState('')

  const tc = t?.tests?.adhd || {}
  const cm = t?.tests?.common || {}

  const scaleOptions: ScaleOption[] = [
    { value: 0, label: tc.scale0 || 'Nunca', emoji: '😌' },
    { value: 1, label: tc.scale1 || 'Rara vez', emoji: '🙂' },
    { value: 2, label: tc.scale2 || 'A veces', emoji: '😐' },
    { value: 3, label: tc.scale3 || 'A menudo', emoji: '😟' },
    { value: 4, label: tc.scale4 || 'Muy a menudo', emoji: '😰' },
  ]

  const slides: SlideConfig[] = [{
    afterQuestionIndex: 8,
    animationType: 'bars',
    title: tc.slide1Title || 'Sección 2',
    subtitle: tc.slide1Subtitle || 'Hiperactividad e Impulsividad',
    description: tc.slide1Desc || 'Ahora evaluaremos síntomas relacionados con la inquietud, el movimiento y el control de impulsos.',
    badge: tc.slide1Badge || '9 DE 18 COMPLETADAS',
  }]

  const translatedQuestions = questions.map(q => ({
    ...q,
    category: q.category === 'cat1' ? (tc.cat1 || 'Inatención') : (tc.cat2 || 'Hiperactividad'),
  }))

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('userName', userName)
      setStarted(true)
    }
  }

  const handleComplete = (answers: { [key: number]: number }) => {
    const results = calculateADHDScores(answers)
    localStorage.setItem('testResults', JSON.stringify({ type: 'adhd', answers, completedAt: new Date().toISOString(), userName: localStorage.getItem('userName') || 'Usuario' }))
    localStorage.setItem('adhdResults', JSON.stringify({ id: Date.now().toString(), type: 'adhd', date: new Date().toISOString(), results, answers }))
    localStorage.removeItem('isPremiumTest')
    router.push(`/${lang}/analizando`)
  }

  const config: TestConfig = {
    type: 'adhd',
    title: tc.title || 'Test de TDAH',
    emoji: '🎯',
    colorFrom: 'from-blue-500',
    colorTo: 'to-blue-700',
    colorLight: 'from-blue-50',
    colorText: 'text-blue-600',
    colorRing: 'ring-blue-500',
    questions: translatedQuestions,
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
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-5xl">🎯</div>
                <h1 className="text-3xl font-black tracking-tight mb-2">{tc.title || 'Test de TDAH'}</h1>
                <p className="text-blue-100 text-base">{tc.subtitle || 'Evaluación basada en criterios DSM-5'}</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-black text-blue-700">{tc.questionsCount || '18'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{cm.questions || 'Preguntas'}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-black text-blue-700">{tc.duration || "5'"}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{cm.approxDuration || 'Aprox.'}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-black text-blue-700">{tc.sectionsCount || '2'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{cm.sections || 'Secciones'}</div>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600"><FaBrain className="text-blue-500 flex-shrink-0" /><span>{tc.feature1 || 'Sección 1: Inatención (9 preguntas)'}</span></div>
                  <div className="flex items-center gap-3 text-sm text-gray-600"><FaBolt className="text-blue-500 flex-shrink-0" /><span>{tc.feature2 || 'Sección 2: Hiperactividad e Impulsividad (9 preguntas)'}</span></div>
                  <div className="flex items-center gap-3 text-sm text-gray-600"><FaCheckCircle className="text-blue-500 flex-shrink-0" /><span>{tc.feature3 || 'Piensa en los últimos 6 meses de tu vida'}</span></div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3">
                  <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{tc.disclaimer || cm.disclaimer || 'Este test es una herramienta orientativa.'}</p>
                </div>
                <form onSubmit={handleStart} className="space-y-4">
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder={cm.namePlaceholder || '¿Cómo te llamas?'} className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors" required autoFocus />
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
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
