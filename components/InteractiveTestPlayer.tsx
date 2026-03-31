'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaArrowLeft, FaChevronRight, FaCheck } from 'react-icons/fa'

export interface TestQuestion {
  id: number
  text: string
  category?: string
  warningText?: string
}

export interface ScaleOption {
  value: number
  label: string
  emoji?: string
}

export type SlideAnimationType = 'bars' | 'rings' | 'orbit' | 'wave' | 'final' | 'check'

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
      setTimeout(() => setTransitioning(false), 300)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 250)
  }, [])

  const handleAnswer = (value: number) => {
    if (transitioning) return
    const step = currentStep as { type: 'question'; question: TestQuestion; questionIndex: number }
    setSelectedValue(value)
    setAnswers(prev => ({ ...prev, [step.question.id]: value }))
    const newAnswers = { ...answers, [step.question.id]: value }
    const isLastStep = currentStepIndex === steps.length - 1
    if (isLastStep && Object.keys(newAnswers).length === totalQuestions) {
      setTimeout(() => onComplete(newAnswers), 600)
      return
    }
    setTimeout(() => goToStep(currentStepIndex + 1), 420)
  }

  const handlePrev = () => { if (currentStepIndex > 0) goToStep(currentStepIndex - 1) }
  const handleSlideNext = () => goToStep(currentStepIndex + 1)

  const transitionClass = transitioning
    ? direction === 'out' ? 'opacity-0 translate-y-4' : 'opacity-0 -translate-y-4'
    : 'opacity-100 translate-y-0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <style>{`
        @keyframes mmBarRise {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        @keyframes mmRingPulse {
          0%   { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes mmOrbit {
          from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
        }
        @keyframes mmOrbit2 {
          from { transform: rotate(120deg) translateX(38px) rotate(-120deg); }
          to   { transform: rotate(480deg) translateX(38px) rotate(-480deg); }
        }
        @keyframes mmOrbit3 {
          from { transform: rotate(240deg) translateX(38px) rotate(-240deg); }
          to   { transform: rotate(600deg) translateX(38px) rotate(-600deg); }
        }
        @keyframes mmWave {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-18px); }
        }
        @keyframes mmFinalBurst {
          0%   { transform: scale(0) rotate(0deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        @keyframes mmCheckDraw {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mmFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mm-bar-1 { animation: mmBarRise 0.55s cubic-bezier(.22,.68,0,1.2) 0.1s both; transform-origin: bottom; }
        .mm-bar-2 { animation: mmBarRise 0.55s cubic-bezier(.22,.68,0,1.2) 0.25s both; transform-origin: bottom; }
        .mm-bar-3 { animation: mmBarRise 0.55s cubic-bezier(.22,.68,0,1.2) 0.4s both; transform-origin: bottom; }
        .mm-ring-1 { animation: mmRingPulse 2s ease-out 0s infinite; }
        .mm-ring-2 { animation: mmRingPulse 2s ease-out 0.65s infinite; }
        .mm-ring-3 { animation: mmRingPulse 2s ease-out 1.3s infinite; }
        .mm-orbit-1 { animation: mmOrbit 3s linear infinite; }
        .mm-orbit-2 { animation: mmOrbit2 3s linear infinite; }
        .mm-orbit-3 { animation: mmOrbit3 3s linear infinite; }
        .mm-wave-1 { animation: mmWave 1.4s ease-in-out 0s infinite; }
        .mm-wave-2 { animation: mmWave 1.4s ease-in-out 0.18s infinite; }
        .mm-wave-3 { animation: mmWave 1.4s ease-in-out 0.36s infinite; }
        .mm-wave-4 { animation: mmWave 1.4s ease-in-out 0.54s infinite; }
        .mm-wave-5 { animation: mmWave 1.4s ease-in-out 0.72s infinite; }
        .mm-final { animation: mmFinalBurst 0.8s cubic-bezier(.22,.68,0,1.2) both; }
        .mm-check { stroke-dasharray: 100; animation: mmCheckDraw 0.6s ease-out 0.3s both; }
        .mm-fadeinup { animation: mmFadeInUp 0.5s ease-out both; }
        .mm-fadeinup-1 { animation: mmFadeInUp 0.5s ease-out 0.15s both; }
        .mm-fadeinup-2 { animation: mmFadeInUp 0.5s ease-out 0.3s both; }
        .mm-fadeinup-3 { animation: mmFadeInUp 0.5s ease-out 0.45s both; }
      `}</style>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progress, 2)}%`, background: 'linear-gradient(90deg,#07C59A,#113240)' }}
          />
        </div>
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center justify-between">
          <button
            onClick={currentStepIndex > 0 ? handlePrev : onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>Atrás</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{answeredCount} / {totalQuestions}</span>
            <span className="text-sm font-bold" style={{ color: '#07C59A' }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center px-4">
        <div className={`w-full max-w-2xl transition-all duration-300 ease-out ${transitionClass}`}>
          {currentStep.type === 'slide' ? (
            <SlideScreen slide={currentStep.slide} onContinue={handleSlideNext} />
          ) : (
            <QuestionCard
              step={currentStep}
              totalQuestions={totalQuestions}
              answers={answers}
              selectedValue={selectedValue}
              scaleOptions={scaleOptions}
              onAnswer={handleAnswer}
              colorFrom={config.colorFrom}
              colorTo={config.colorTo}
              colorText={config.colorText}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Question Card ──────────────────────────────────────────────────────────────

function QuestionCard({
  step, totalQuestions, answers, selectedValue, scaleOptions, onAnswer, colorFrom, colorTo, colorText,
}: {
  step: { type: 'question'; question: TestQuestion; questionIndex: number }
  totalQuestions: number
  answers: { [key: number]: number }
  selectedValue: number | null
  scaleOptions: ScaleOption[]
  onAnswer: (v: number) => void
  colorFrom: string
  colorTo: string
  colorText: string
}) {
  const { question, questionIndex } = step
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${colorFrom} ${colorTo} px-8 py-5`}>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm font-medium tracking-wide uppercase">Pregunta</span>
          <span className="bg-white/20 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
            {questionIndex + 1} / {totalQuestions}
          </span>
          {question.category && (
            <span className="ml-auto text-white/70 text-xs font-medium bg-white/10 px-2.5 py-0.5 rounded-full">
              {question.category}
            </span>
          )}
        </div>
      </div>

      <div className="px-8 pt-8 pb-4">
        <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">{question.text}</p>
        {question.warningText && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-sm text-red-800 font-medium">{question.warningText}</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 space-y-2.5">
        {scaleOptions.map(opt => {
          const isSelected = selectedValue === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium text-left
                transition-all duration-200 border-2 group
                ${isSelected
                  ? `bg-gradient-to-r ${colorFrom} ${colorTo} text-white border-transparent shadow-lg scale-[1.02]`
                  : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-300 hover:bg-white hover:shadow-md'
                }
              `}
            >
              {opt.emoji && <span className="text-xl flex-shrink-0">{opt.emoji}</span>}
              {!opt.emoji && (
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                  ${isSelected ? 'bg-white/20 text-white' : `bg-gray-200 ${colorText} group-hover:bg-gray-300`}`}>
                  {opt.value}
                </span>
              )}
              <span className="flex-1 text-base">{opt.label}</span>
              {isSelected && <FaCheck className="text-white/80 flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Slide Screen ───────────────────────────────────────────────────────────────

function SlideScreen({ slide, onContinue }: { slide: SlideConfig; onContinue: () => void }) {
  return (
    <div
      className="rounded-3xl overflow-hidden shadow-2xl relative"
      style={{ background: 'linear-gradient(135deg, #113240 0%, #07C59A 100%)' }}
    >
      {/* Subtle mesh overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative px-8 py-16 text-center text-white">
        {slide.badge && (
          <span className="mm-fadeinup inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-8"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#07C59A', border: '1px solid rgba(7,197,154,0.4)' }}>
            {slide.badge}
          </span>
        )}

        {/* CSS Animation */}
        <div className="flex justify-center mb-8">
          <SlideAnimation type={slide.animationType} />
        </div>

        <h2 className="mm-fadeinup-1 text-3xl md:text-4xl font-black mb-3 tracking-tight">{slide.title}</h2>
        <p className="mm-fadeinup-2 text-lg text-white/80 font-medium mb-3">{slide.subtitle}</p>
        {slide.description && (
          <p className="mm-fadeinup-2 text-sm text-white/60 max-w-sm mx-auto leading-relaxed mb-8">{slide.description}</p>
        )}

        <button
          onClick={onContinue}
          className="mm-fadeinup-3 inline-flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 mt-4"
          style={{ background: 'rgba(7,197,154,0.25)', border: '1.5px solid rgba(7,197,154,0.5)', color: '#fff', backdropFilter: 'blur(6px)' }}
        >
          Continuar
          <FaChevronRight />
        </button>
      </div>
    </div>
  )
}

// ── CSS Animations ─────────────────────────────────────────────────────────────

function SlideAnimation({ type }: { type: SlideAnimationType }) {
  const teal = '#07C59A'
  const navy = '#113240'
  const white = 'rgba(255,255,255,0.9)'
  const whiteA = 'rgba(255,255,255,0.25)'

  if (type === 'bars') {
    return (
      <div className="flex items-end gap-3 h-20">
        {[{ h: '45%', delay: 0 }, { h: '70%', delay: 1 }, { h: '100%', delay: 2 }].map((b, i) => (
          <div key={i} className={`mm-bar-${i + 1} rounded-t-xl w-10`}
            style={{ height: `${parseInt(b.h)}%`, background: i === 2 ? teal : i === 1 ? 'rgba(7,197,154,0.65)' : 'rgba(7,197,154,0.35)' }} />
        ))}
      </div>
    )
  }

  if (type === 'rings') {
    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        {[1, 2, 3].map(i => (
          <div key={i} className={`mm-ring-${i} absolute rounded-full border-2`}
            style={{ width: 50, height: 50, borderColor: i === 1 ? teal : 'rgba(7,197,154,0.5)' }} />
        ))}
        <div className="rounded-full w-5 h-5 z-10" style={{ background: teal }} />
      </div>
    )
  }

  if (type === 'orbit') {
    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Center */}
        <div className="absolute rounded-full w-8 h-8" style={{ background: teal }} />
        {/* Orbit ring */}
        <div className="absolute rounded-full w-20 h-20 border" style={{ borderColor: 'rgba(7,197,154,0.3)' }} />
        {/* Orbiting dots */}
        {(['mm-orbit-1', 'mm-orbit-2', 'mm-orbit-3'] as const).map((cls, i) => (
          <div key={i} className={`${cls} absolute`}
            style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? white : whiteA }} />
        ))}
      </div>
    )
  }

  if (type === 'wave') {
    return (
      <div className="flex items-center gap-1.5 h-14">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`mm-wave-${i} rounded-full w-3`}
            style={{ height: 28, background: i === 3 ? teal : i === 2 || i === 4 ? 'rgba(7,197,154,0.65)' : 'rgba(7,197,154,0.35)' }} />
        ))}
      </div>
    )
  }

  if (type === 'final') {
    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Rotating diamond */}
        <div className="mm-final absolute w-14 h-14 rounded-sm" style={{ background: 'rgba(7,197,154,0.2)', transform: 'rotate(45deg)' }} />
        <div className="mm-final absolute w-10 h-10 rounded-sm" style={{ background: teal, transform: 'rotate(45deg)', animationDelay: '0.1s' }} />
        <div className="absolute w-4 h-4 rounded-full" style={{ background: white }} />
      </div>
    )
  }

  if (type === 'check') {
    return (
      <div className="flex items-center justify-center w-20 h-20">
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="32" r="28" fill="rgba(7,197,154,0.2)" stroke={teal} strokeWidth="2" />
          <polyline
            className="mm-check"
            points="18,32 27,42 46,22"
            fill="none"
            stroke={teal}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  return null
}
