'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa'

export interface TestQuestion {
  id: number
  text: string
  texts?: Record<string, string> // translations: { en: '...', fr: '...' }
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
  instruction?: string // Texto de instrucción encima de las opciones
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

// Get translated question text
function getQuestionText(q: TestQuestion, lang: string): string {
  if (q.texts && q.texts[lang]) return q.texts[lang]
  return q.text
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
  const progress = (answeredCount / totalQuestions) * 100
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
      setTimeout(() => setTransitioning(false), 280)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 220)
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
    setTimeout(() => goToStep(currentStepIndex + 1), 380)
  }

  const handlePrev = () => { if (currentStepIndex > 0) goToStep(currentStepIndex - 1) }
  const handleSlideNext = () => goToStep(currentStepIndex + 1)

  const transitionClass = transitioning
    ? direction === 'out' ? 'opacity-0 translate-y-3' : 'opacity-0 -translate-y-3'
    : 'opacity-100 translate-y-0'

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Top progress bar + mini-header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progress, 1)}%`, background: 'linear-gradient(90deg,#07C59A,#113240)' }}
          />
        </div>
        <div className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={currentStepIndex > 0 ? handlePrev : onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <FaArrowLeft className="text-xs" />
            <span>{config.lang === 'en' ? 'Back' : config.lang === 'fr' ? 'Retour' : config.lang === 'de' ? 'Zurück' : 'Atrás'}</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">{answeredCount}/{totalQuestions}</div>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: '#07C59A' }} />
            </div>
            <div className="text-xs font-bold" style={{ color: '#07C59A' }}>{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-10 min-h-screen flex items-center justify-center px-4">
        <div className={`w-full max-w-xl transition-all duration-280 ease-out ${transitionClass}`}>
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

// ── Circle colors for Likert 1-5 ──────────────────────────────────────────────
const CIRCLE_COLORS = [
  { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', selected_bg: '#ef4444' },
  { bg: '#ffedd5', border: '#fdba74', text: '#c2410c', selected_bg: '#f97316' },
  { bg: '#f3f4f6', border: '#d1d5db', text: '#4b5563', selected_bg: '#6b7280' },
  { bg: '#d1fae5', border: '#6ee7b7', text: '#047857', selected_bg: '#10b981' },
  { bg: '#ccfbf1', border: '#5eead4', text: '#0f766e', selected_bg: '#07C59A' },
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
  const { question, questionIndex } = step
  const questionText = getQuestionText(question, lang)
  const catLabel = question.category

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Category + number */}
      <div className={`bg-gradient-to-r ${colorFrom} ${colorTo} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">
            {catLabel || `${lang === 'en' ? 'Question' : lang === 'fr' ? 'Question' : 'Pregunta'}`}
          </span>
          <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question text */}
      <div className="px-6 pt-7 pb-5">
        <p className="text-xl md:text-2xl font-bold text-gray-900 leading-snug text-center">
          {questionText}
        </p>
        {question.warningText && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-sm text-red-800 font-medium">{question.warningText}</p>
          </div>
        )}
      </div>

      {/* Instruction */}
      {instruction && (
        <p className="text-center text-sm text-gray-400 px-6 mb-1">{instruction}</p>
      )}

      {/* Scale options */}
      <div className="px-6 pb-8">
        {scaleDisplay === 'circles' ? (
          <CircleScale options={scaleOptions} selectedValue={selectedValue} onAnswer={onAnswer} />
        ) : (
          <ButtonScale options={scaleOptions} selectedValue={selectedValue} onAnswer={onAnswer} colorFrom={colorFrom} colorTo={colorTo} />
        )}
      </div>
    </div>
  )
}

// ── Circle Scale (Likert 1-5) ─────────────────────────────────────────────────
function CircleScale({ options, selectedValue, onAnswer }: {
  options: ScaleOption[]
  selectedValue: number | null
  onAnswer: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-end justify-center gap-3 mb-3">
        {options.map((opt, i) => {
          const isSelected = selectedValue === opt.value
          const colors = CIRCLE_COLORS[i] || CIRCLE_COLORS[2]
          return (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="rounded-full transition-all duration-200 flex items-center justify-center font-bold text-lg"
                style={{
                  width: isSelected ? 60 : 52,
                  height: isSelected ? 60 : 52,
                  background: isSelected ? colors.selected_bg : colors.bg,
                  border: `2.5px solid ${isSelected ? colors.selected_bg : colors.border}`,
                  color: isSelected ? '#fff' : colors.text,
                  boxShadow: isSelected ? `0 4px 14px ${colors.selected_bg}55` : 'none',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                }}
              >
                {opt.value}
              </div>
              <span className="text-[10px] text-gray-400 text-center leading-tight max-w-[52px]">
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Button Scale (frequency 0-3 or 0-4) ─────────────────────────────────────
function ButtonScale({ options, selectedValue, onAnswer, colorFrom, colorTo }: {
  options: ScaleOption[]
  selectedValue: number | null
  onAnswer: (v: number) => void
  colorFrom: string
  colorTo: string
}) {
  return (
    <div className="space-y-2.5">
      {options.map(opt => {
        const isSelected = selectedValue === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium text-left
              transition-all duration-200 border-2
              ${isSelected
                ? `bg-gradient-to-r ${colorFrom} ${colorTo} text-white border-transparent shadow-lg scale-[1.01]`
                : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-300 hover:bg-white hover:shadow-sm'
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
    <div className="rounded-3xl overflow-hidden shadow-2xl relative"
      style={{ background: 'linear-gradient(135deg, #113240 0%, #07C59A 100%)' }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative px-8 py-16 text-center text-white">
        {slide.badge && (
          <span className="mm-fu-0 inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-7"
            style={{ background: 'rgba(7,197,154,0.2)', border: '1px solid rgba(7,197,154,0.5)', color: '#07C59A' }}>
            {slide.badge}
          </span>
        )}
        <div className="flex justify-center mb-8">
          <SlideAnimation type={slide.animationType} />
        </div>
        <h2 className="mm-fu-1 text-3xl md:text-4xl font-black mb-3 tracking-tight">{slide.title}</h2>
        <p className="mm-fu-2 text-lg text-white/80 font-medium mb-3">{slide.subtitle}</p>
        {slide.description && (
          <p className="mm-fu-2 text-sm text-white/60 max-w-sm mx-auto leading-relaxed mb-8">{slide.description}</p>
        )}
        <button onClick={onContinue}
          className="mm-fu-3 inline-flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 mt-4"
          style={{ background: 'rgba(7,197,154,0.25)', border: '1.5px solid rgba(7,197,154,0.5)', color: '#fff' }}>
          Continuar <FaChevronRight />
        </button>
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
  if (type === 'check') return (
    <div className="flex items-center justify-center w-20 h-20">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="28" fill="rgba(7,197,154,0.2)" stroke={teal} strokeWidth="2" />
        <polyline className="mm-check" points="18,32 27,42 46,22" fill="none" stroke={teal} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
  return null
}
