'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaArrowLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa'

export interface TestQuestion {
  id: number
  text: string
  texts?: Record<string, string>
  category?: string
  warningText?: string
}

export interface ScaleOption {
  value: number
  label: string
  emoji?: string
}

export type SlideAnimationType = 'bars' | 'rings' | 'orbit' | 'wave' | 'final' | 'check'
export type ScaleDisplay = 'circles' | 'buttons'

export interface SlideConfig {
  afterQuestionIndex: number
  animationType: SlideAnimationType
  title: string
  subtitle: string
  description?: string
  badge?: string
}

export interface TestConfig {
  type: string
  title: string
  emoji: string
  colorFrom: string
  colorTo: string
  colorLight: string
  colorText: string
  colorRing: string
  scaleDisplay?: ScaleDisplay
  instruction?: string
  questions: TestQuestion[]
  scaleOptions: ScaleOption[]
  slides: SlideConfig[]
  lang: string
  onBack: () => void
  onComplete: (answers: { [key: number]: number }) => void
}

type Step =
  | { type: 'question'; question: TestQuestion; questionIndex: number }
  | { type: 'slide'; slide: SlideConfig }

function buildSteps(questions: TestQuestion[], slides: SlideConfig[]): Step[] {
  const steps: Step[] = []
  slides.filter(s => s.afterQuestionIndex === -1).forEach(s => steps.push({ type: 'slide', slide: s }))
  questions.forEach((q, idx) => {
    steps.push({ type: 'question', question: q, questionIndex: idx })
    slides.filter(s => s.afterQuestionIndex === idx).forEach(s => steps.push({ type: 'slide', slide: s }))
  })
  return steps
}

function getQuestionText(q: TestQuestion, lang: string): string {
  if (q.texts && q.texts[lang]) return q.texts[lang]
  return q.text
}

function getCategoryLabel(category: string | undefined, lang: string): string {
  if (!category) return ''
  return category
}

export default function InteractiveTestPlayer({ config }: { config: TestConfig }) {
  const { questions, scaleOptions, slides, onBack, onComplete } = config
  const steps = buildSteps(questions, slides)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [selectedValue, setSelectedValue] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [direction, setDirection] = useState<'in' | 'out'>('in')

  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / totalQuestions) * 100)
  const currentStep = steps[currentStepIndex]
  const scaleDisplay = config.scaleDisplay || 'buttons'

  useEffect(() => {
    if (currentStep.type === 'question') {
      const existing = answers[currentStep.question.id]
      setSelectedValue(existing !== undefined ? existing : null)
    } else {
      setSelectedValue(null)
    }
  }, [currentStepIndex])

  const goToStep = useCallback((nextIndex: number) => {
    setDirection('out')
    setTransitioning(true)
    setTimeout(() => {
      setCurrentStepIndex(nextIndex)
      setDirection('in')
      setTimeout(() => setTransitioning(false), 260)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }, [])

  const handleAnswer = (value: number) => {
    if (transitioning) return
    const step = currentStep as { type: 'question'; question: TestQuestion; questionIndex: number }
    setSelectedValue(value)
    setAnswers(prev => ({ ...prev, [step.question.id]: value }))
    const newAnswers = { ...answers, [step.question.id]: value }
    const isLastStep = currentStepIndex === steps.length - 1
    if (isLastStep && Object.keys(newAnswers).length === totalQuestions) {
      setTimeout(() => onComplete(newAnswers), 500)
      return
    }
    setTimeout(() => goToStep(currentStepIndex + 1), 360)
  }

  const handlePrev = () => { if (currentStepIndex > 0) goToStep(currentStepIndex - 1) }
  const handleSlideNext = () => goToStep(currentStepIndex + 1)

  const transitionClass = transitioning
    ? direction === 'out' ? 'opacity-0 translate-y-2' : 'opacity-0 -translate-y-2'
    : 'opacity-100 translate-y-0'

  const lang = config.lang
  const backLabel = lang === 'en' ? 'Back' : lang === 'fr' ? 'Retour' : lang === 'de' ? 'Zurück' : lang === 'it' ? 'Indietro' : lang === 'pt' ? 'Voltar' : 'Atrás'
  const progressLabel = lang === 'en' ? 'completed' : lang === 'fr' ? 'complété' : lang === 'de' ? 'abgeschlossen' : lang === 'it' ? 'completato' : lang === 'pt' ? 'concluído' : 'completado'
  const questionLabel = lang === 'en' ? 'Question' : lang === 'fr' ? 'Question' : lang === 'de' ? 'Frage' : lang === 'it' ? 'Domanda' : lang === 'pt' ? 'Questão' : 'Pregunta'
  const inProgressLabel = lang === 'en' ? 'In progress' : lang === 'fr' ? 'En cours' : lang === 'de' ? 'In Bearbeitung' : lang === 'it' ? 'In corso' : lang === 'pt' ? 'Em andamento' : 'En progreso'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <style>{`
        @keyframes mmBarRise { from{transform:scaleY(0);opacity:0} to{transform:scaleY(1);opacity:1} }
        @keyframes mmRingPulse { 0%{transform:scale(0.6);opacity:0.9} 100%{transform:scale(2.4);opacity:0} }
        @keyframes mmOrbit { from{transform:rotate(0deg) translateX(38px) rotate(0deg)} to{transform:rotate(360deg) translateX(38px) rotate(-360deg)} }
        @keyframes mmOrbit2 { from{transform:rotate(120deg) translateX(38px) rotate(-120deg)} to{transform:rotate(480deg) translateX(38px) rotate(-480deg)} }
        @keyframes mmOrbit3 { from{transform:rotate(240deg) translateX(38px) rotate(-240deg)} to{transform:rotate(600deg) translateX(38px) rotate(-600deg)} }
        @keyframes mmWave { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes mmFinalBurst { 0%{transform:scale(0) rotate(0deg);opacity:0} 60%{transform:scale(1.15) rotate(180deg);opacity:1} 100%{transform:scale(1) rotate(360deg);opacity:1} }
        @keyframes mmCheckDraw { from{stroke-dashoffset:100} to{stroke-dashoffset:0} }
        @keyframes mmFadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .mm-bar-1{animation:mmBarRise .5s cubic-bezier(.22,.68,0,1.2) .1s both;transform-origin:bottom}
        .mm-bar-2{animation:mmBarRise .5s cubic-bezier(.22,.68,0,1.2) .25s both;transform-origin:bottom}
        .mm-bar-3{animation:mmBarRise .5s cubic-bezier(.22,.68,0,1.2) .4s both;transform-origin:bottom}
        .mm-ring-1{animation:mmRingPulse 2s ease-out 0s infinite}
        .mm-ring-2{animation:mmRingPulse 2s ease-out .65s infinite}
        .mm-ring-3{animation:mmRingPulse 2s ease-out 1.3s infinite}
        .mm-orbit-1{animation:mmOrbit 3s linear infinite}
        .mm-orbit-2{animation:mmOrbit2 3s linear infinite}
        .mm-orbit-3{animation:mmOrbit3 3s linear infinite}
        .mm-wave-1{animation:mmWave 1.4s ease-in-out 0s infinite}
        .mm-wave-2{animation:mmWave 1.4s ease-in-out .18s infinite}
        .mm-wave-3{animation:mmWave 1.4s ease-in-out .36s infinite}
        .mm-wave-4{animation:mmWave 1.4s ease-in-out .54s infinite}
        .mm-wave-5{animation:mmWave 1.4s ease-in-out .72s infinite}
        .mm-final{animation:mmFinalBurst .8s cubic-bezier(.22,.68,0,1.2) both}
        .mm-check{stroke-dasharray:100;animation:mmCheckDraw .6s ease-out .3s both}
        .mm-fu-0{animation:mmFadeInUp .5s ease-out both}
        .mm-fu-1{animation:mmFadeInUp .5s ease-out .15s both}
        .mm-fu-2{animation:mmFadeInUp .5s ease-out .3s both}
        .mm-fu-3{animation:mmFadeInUp .5s ease-out .45s both}
      `}</style>

      {/* ── Top header — igual que TestHeader del IQ ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        {/* Thin teal progress bar at very top */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progress, 1)}%`, background: 'linear-gradient(90deg, #07C59A, #113240)' }}
          />
        </div>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <button onClick={currentStepIndex > 0 ? handlePrev : onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/images/MINDMETRIC/Logo.png" alt="MindMetric" className="h-10 md:h-11 w-auto" />
            </button>
            {/* Progress info (right side) */}
            <div className="flex items-center gap-3">
              {currentStep.type === 'question' && (
                <span className="text-sm text-gray-500 hidden sm:block">
                  {questionLabel} {(currentStep as any).questionIndex + 1} / {totalQuestions}
                </span>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
                style={{ background: '#e6f9f5', color: '#07C59A' }}>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="pt-20 pb-12 min-h-screen flex items-center justify-center px-4">
        <div className={`w-full max-w-2xl transition-all duration-260 ease-out ${transitionClass}`}>
          {currentStep.type === 'slide' ? (
            <SlideScreen slide={currentStep.slide} onContinue={handleSlideNext} />
          ) : (
            <QuestionCard
              step={currentStep}
              totalQuestions={totalQuestions}
              answers={answers}
              selectedValue={selectedValue}
              scaleOptions={scaleOptions}
              scaleDisplay={scaleDisplay}
              instruction={config.instruction}
              onAnswer={handleAnswer}
              colorFrom={config.colorFrom}
              colorTo={config.colorTo}
              lang={config.lang}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Circle colors (pastel, matching reference) ────────────────────────────────
const CIRCLE_STYLES = [
  { bg: '#fce4e4', border: '#f9a8a8', selectedBg: '#ef4444', selectedBorder: '#ef4444', label_color: '#6b7280' },
  { bg: '#fef3e2', border: '#fcd08a', selectedBg: '#f59e0b', selectedBorder: '#f59e0b', label_color: '#6b7280' },
  { bg: '#f3f4f6', border: '#d1d5db', selectedBg: '#6b7280', selectedBorder: '#6b7280', label_color: '#6b7280' },
  { bg: '#d1fae5', border: '#6ee7b7', selectedBg: '#10b981', selectedBorder: '#10b981', label_color: '#6b7280' },
  { bg: '#ccfbf1', border: '#5eead4', selectedBg: '#07C59A', selectedBorder: '#07C59A', label_color: '#6b7280' },
]

// ── Question Card ──────────────────────────────────────────────────────────────
function QuestionCard({
  step, totalQuestions, answers, selectedValue, scaleOptions, scaleDisplay,
  instruction, onAnswer, colorFrom, colorTo, lang,
}: {
  step: { type: 'question'; question: TestQuestion; questionIndex: number }
  totalQuestions: number
  answers: { [key: number]: number }
  selectedValue: number | null
  scaleOptions: ScaleOption[]
  scaleDisplay: ScaleDisplay
  instruction?: string
  onAnswer: (v: number) => void
  colorFrom: string
  colorTo: string
  lang: string
}) {
  const { question } = step
  const questionText = getQuestionText(question, lang)
  const selectHint = lang === 'en' ? 'Select how you feel about this statement' :
    lang === 'fr' ? 'Sélectionnez comment vous vous sentez par rapport à cette affirmation' :
    lang === 'de' ? 'Wählen Sie, wie Sie sich zu dieser Aussage fühlen' :
    lang === 'it' ? 'Seleziona come ti senti riguardo a questa affermazione' :
    lang === 'pt' ? 'Selecione como se sente sobre esta afirmação' :
    'Selecciona cómo te sientes sobre esta afirmación'

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="px-10 pt-10 pb-4">
        {/* Instruction text */}
        {instruction && (
          <p className="text-center text-gray-400 text-sm mb-6">{instruction}</p>
        )}

        {/* Category badge */}
        {question.category && (
          <div className="flex justify-center mb-5">
            <span className={`bg-gradient-to-r ${colorFrom} ${colorTo} text-white text-xs font-bold px-5 py-2 rounded-full uppercase tracking-wider`}>
              {question.category}
            </span>
          </div>
        )}

        {/* Question text */}
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 text-center leading-snug mb-10">
          {questionText}
        </h2>

        {question.warningText && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-sm text-red-800 font-medium">{question.warningText}</p>
          </div>
        )}

        {/* Scale */}
        {scaleDisplay === 'circles' ? (
          <CircleScale options={scaleOptions} selectedValue={selectedValue} onAnswer={onAnswer} colorFrom={colorFrom} colorTo={colorTo} />
        ) : (
          <ButtonScale options={scaleOptions} selectedValue={selectedValue} onAnswer={onAnswer} colorFrom={colorFrom} colorTo={colorTo} />
        )}

        {/* Bottom hint */}
        {scaleDisplay === 'circles' && (
          <div className="flex items-center justify-center gap-1.5 mt-6 mb-4">
            <FaInfoCircle className="text-gray-300 text-xs" />
            <span className="text-xs text-gray-400">{selectHint}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Circle Scale ──────────────────────────────────────────────────────────────
function CircleScale({ options, selectedValue, onAnswer, colorFrom, colorTo }: {
  options: ScaleOption[]
  selectedValue: number | null
  onAnswer: (v: number) => void
  colorFrom: string
  colorTo: string
}) {
  return (
    <div className="flex items-start justify-center gap-4">
      {options.map((opt, i) => {
        const style = CIRCLE_STYLES[i] || CIRCLE_STYLES[2]
        const isSelected = selectedValue === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className="flex flex-col items-center gap-2.5 group"
          >
            {/* Label above */}
            <span className="text-[11px] text-gray-500 text-center leading-tight w-16 min-h-[28px] flex items-end justify-center">
              {opt.label}
            </span>
            {/* Circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200"
              style={{
                background: isSelected ? style.selectedBg : style.bg,
                border: isSelected ? `3px solid ${style.selectedBorder}` : `2px solid ${style.border}`,
                color: isSelected ? '#fff' : '#6b7280',
                boxShadow: isSelected ? `0 6px 20px ${style.selectedBg}55` : 'none',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {opt.value}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Button Scale ──────────────────────────────────────────────────────────────
function ButtonScale({ options, selectedValue, onAnswer, colorFrom, colorTo }: {
  options: ScaleOption[]
  selectedValue: number | null
  onAnswer: (v: number) => void
  colorFrom: string
  colorTo: string
}) {
  return (
    <div className="space-y-2.5 pb-4">
      {options.map(opt => {
        const isSelected = selectedValue === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-xl font-medium text-left
              transition-all duration-200 border-2
              ${isSelected
                ? `bg-gradient-to-r ${colorFrom} ${colorTo} text-white border-transparent shadow-md`
                : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-200 hover:bg-white'
              }
            `}
          >
            {opt.emoji && <span className="text-xl flex-shrink-0">{opt.emoji}</span>}
            <span className="flex-1 text-base">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Slide Screen ───────────────────────────────────────────────────────────────
function SlideScreen({ slide, onContinue }: { slide: SlideConfig; onContinue: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-8 py-14 text-center"
        style={{ background: 'linear-gradient(135deg, #113240 0%, #07C59A 100%)' }}>
        <div className="relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative">
            {slide.badge && (
              <span className="mm-fu-0 inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-7 text-white"
                style={{ background: 'rgba(7,197,154,0.25)', border: '1px solid rgba(7,197,154,0.6)' }}>
                {slide.badge}
              </span>
            )}
            <div className="flex justify-center mb-8">
              <SlideAnimation type={slide.animationType} />
            </div>
            <h2 className="mm-fu-1 text-3xl md:text-4xl font-black mb-3 text-white tracking-tight">{slide.title}</h2>
            <p className="mm-fu-2 text-lg font-medium mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>{slide.subtitle}</p>
            {slide.description && (
              <p className="mm-fu-2 text-sm max-w-sm mx-auto leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>{slide.description}</p>
            )}
            <button onClick={onContinue}
              className="mm-fu-3 inline-flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 mt-4 text-white"
              style={{ background: 'rgba(7,197,154,0.25)', border: '1.5px solid rgba(7,197,154,0.6)' }}>
              Continuar <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CSS Animations ─────────────────────────────────────────────────────────────
function SlideAnimation({ type }: { type: SlideAnimationType }) {
  const teal = '#07C59A'
  if (type === 'bars') return (
    <div className="flex items-end gap-3 h-20">
      {[{ h: '45%', c: 'rgba(7,197,154,0.35)' }, { h: '70%', c: 'rgba(7,197,154,0.65)' }, { h: '100%', c: '#07C59A' }].map((b, i) => (
        <div key={i} className={`mm-bar-${i + 1} rounded-t-xl w-10`} style={{ height: b.h, background: b.c }} />
      ))}
    </div>
  )
  if (type === 'rings') return (
    <div className="relative flex items-center justify-center w-20 h-20">
      {[1, 2, 3].map(i => (
        <div key={i} className={`mm-ring-${i} absolute rounded-full border-2`}
          style={{ width: 50, height: 50, borderColor: i === 1 ? teal : 'rgba(7,197,154,0.5)' }} />
      ))}
      <div className="rounded-full w-5 h-5 z-10" style={{ background: teal }} />
    </div>
  )
  if (type === 'orbit') return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <div className="absolute rounded-full w-8 h-8" style={{ background: teal }} />
      <div className="absolute rounded-full w-20 h-20 border" style={{ borderColor: 'rgba(7,197,154,0.3)' }} />
      {['mm-orbit-1', 'mm-orbit-2', 'mm-orbit-3'].map((cls, i) => (
        <div key={i} className={`${cls} absolute`}
          style={{ width: i === 0 ? 10 : 7, height: i === 0 ? 10 : 7, borderRadius: '50%', background: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(7,197,154,0.7)' }} />
      ))}
    </div>
  )
  if (type === 'wave') return (
    <div className="flex items-center gap-1.5 h-14">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`mm-wave-${i} rounded-full w-3`}
          style={{ height: 28, background: i === 3 ? teal : i === 2 || i === 4 ? 'rgba(7,197,154,0.65)' : 'rgba(7,197,154,0.35)' }} />
      ))}
    </div>
  )
  if (type === 'final') return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <div className="mm-final absolute w-14 h-14 rounded-sm" style={{ background: 'rgba(7,197,154,0.2)', transform: 'rotate(45deg)' }} />
      <div className="mm-final absolute w-10 h-10 rounded-sm" style={{ background: teal, transform: 'rotate(45deg)', animationDelay: '0.1s' }} />
      <div className="absolute w-4 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.9)' }} />
    </div>
  )
  return null
}
