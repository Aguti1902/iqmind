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

export interface SlideConfig {
  afterQuestionIndex: number // -1 = before all, 0 = after question index 0, etc.
  icon: string
  title: string
  subtitle: string
  description?: string
  accentFrom: string
  accentTo: string
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

  // Slides before all questions (afterQuestionIndex === -1)
  slides
    .filter(s => s.afterQuestionIndex === -1)
    .forEach(s => steps.push({ type: 'slide', slide: s }))

  questions.forEach((q, idx) => {
    steps.push({ type: 'question', question: q, questionIndex: idx })
    // Slides after this question
    slides
      .filter(s => s.afterQuestionIndex === idx)
      .forEach(s => steps.push({ type: 'slide', slide: s }))
  })

  return steps
}

export default function InteractiveTestPlayer({ config }: { config: TestConfig }) {
  const { questions, scaleOptions, slides, lang, onBack, onComplete } = config

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

  // Sync selectedValue when navigating back to a question
  useEffect(() => {
    if (currentStep.type === 'question') {
      const existing = answers[currentStep.question.id]
      setSelectedValue(existing !== undefined ? existing : null)
    } else {
      setSelectedValue(null)
    }
  }, [currentStepIndex])

  const goToStep = useCallback(
    (nextIndex: number, dir: 'forward' | 'back' = 'forward') => {
      setDirection('out')
      setTransitioning(true)
      setTimeout(() => {
        setCurrentStepIndex(nextIndex)
        setDirection('in')
        setTimeout(() => setTransitioning(false), 300)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 250)
    },
    []
  )

  const handleAnswer = (value: number) => {
    if (transitioning) return
    const step = currentStep as { type: 'question'; question: TestQuestion; questionIndex: number }
    setSelectedValue(value)
    setAnswers(prev => ({ ...prev, [step.question.id]: value }))

    const newAnswers = { ...answers, [step.question.id]: value }
    const isLastStep = currentStepIndex === steps.length - 1

    if (isLastStep && Object.keys(newAnswers).length === totalQuestions) {
      // Auto-advance then complete
      setTimeout(() => onComplete(newAnswers), 600)
      return
    }

    setTimeout(() => {
      goToStep(currentStepIndex + 1)
    }, 420)
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) goToStep(currentStepIndex - 1, 'back')
  }

  const handleSlideNext = () => goToStep(currentStepIndex + 1)

  const isLastQuestionAnswered =
    currentStep.type === 'question' && answers[currentStep.question.id] !== undefined

  const transitionClass = transitioning
    ? direction === 'out'
      ? 'opacity-0 translate-y-4'
      : 'opacity-0 -translate-y-4'
    : 'opacity-100 translate-y-0'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.colorLight} to-white`}>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full bg-gradient-to-r ${config.colorFrom} ${config.colorTo} transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(progress, 2)}%` }}
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
            <span className="text-sm font-medium text-gray-500">
              {answeredCount} / {totalQuestions}
            </span>
            <span
              className={`text-sm font-bold bg-gradient-to-r ${config.colorFrom} ${config.colorTo} bg-clip-text text-transparent`}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center px-4">
        <div
          className={`w-full max-w-2xl transition-all duration-300 ease-out ${transitionClass}`}
        >
          {currentStep.type === 'slide' ? (
            <SlideScreen
              slide={currentStep.slide}
              onContinue={handleSlideNext}
              colorFrom={config.colorFrom}
              colorTo={config.colorTo}
            />
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
              colorRing={config.colorRing}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Question Card ──────────────────────────────────────────────────────────────

function QuestionCard({
  step,
  totalQuestions,
  answers,
  selectedValue,
  scaleOptions,
  onAnswer,
  colorFrom,
  colorTo,
  colorText,
  colorRing,
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
  colorRing: string
}) {
  const { question, questionIndex } = step
  const isAnswered = answers[question.id] !== undefined

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Question header */}
      <div className={`bg-gradient-to-r ${colorFrom} ${colorTo} px-8 py-6`}>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm font-medium tracking-wide uppercase">
            Pregunta
          </span>
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

      {/* Question body */}
      <div className="px-8 pt-8 pb-4">
        <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed mb-2">
          {question.text}
        </p>
        {question.warningText && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-sm text-red-800 font-medium">{question.warningText}</p>
          </div>
        )}
      </div>

      {/* Scale options */}
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
                ${
                  isSelected
                    ? `bg-gradient-to-r ${colorFrom} ${colorTo} text-white border-transparent shadow-lg scale-[1.02]`
                    : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-300 hover:bg-white hover:shadow-md'
                }
              `}
            >
              {opt.emoji && (
                <span className="text-xl flex-shrink-0">{opt.emoji}</span>
              )}
              {!opt.emoji && (
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                    ${isSelected ? 'bg-white/20 text-white' : `bg-gray-200 ${colorText} group-hover:bg-gray-300`}
                  `}
                >
                  {opt.value}
                </span>
              )}
              <span className="flex-1 text-base">{opt.label}</span>
              {isSelected && <FaCheck className="text-white/80 flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pb-6">
        {Array.from({ length: Math.min(totalQuestions, 20) }).map((_, i) => {
          const qId = i < totalQuestions ? i : null
          const answered = qId !== null && answers[Object.keys(answers).map(Number)[i]] !== undefined
          const isCurrent = questionIndex === i
          return (
            <div
              key={i}
              className={`
                rounded-full transition-all duration-300
                ${isCurrent ? `w-4 h-2 bg-gradient-to-r ${colorFrom} ${colorTo}` : ''}
                ${!isCurrent && answers[step.questionIndex - (step.questionIndex - i)] !== undefined ? `w-2 h-2 opacity-60 bg-gradient-to-r ${colorFrom} ${colorTo}` : ''}
                ${!isCurrent && answers[step.questionIndex - (step.questionIndex - i)] === undefined ? 'w-2 h-2 bg-gray-200' : ''}
              `}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Slide Screen ───────────────────────────────────────────────────────────────

function SlideScreen({
  slide,
  onContinue,
  colorFrom,
  colorTo,
}: {
  slide: SlideConfig
  onContinue: () => void
  colorFrom: string
  colorTo: string
}) {
  return (
    <div
      className={`rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${slide.accentFrom} ${slide.accentTo}`}
    >
      <div className="px-8 py-16 text-center text-white">
        {slide.badge && (
          <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
            {slide.badge}
          </span>
        )}
        <div className="text-7xl mb-6 animate-bounce-once">{slide.icon}</div>
        <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">{slide.title}</h2>
        <p className="text-lg md:text-xl text-white/80 font-medium mb-4">{slide.subtitle}</p>
        {slide.description && (
          <p className="text-base text-white/65 max-w-md mx-auto mb-8 leading-relaxed">
            {slide.description}
          </p>
        )}
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg mt-4"
        >
          Continuar
          <FaChevronRight />
        </button>
      </div>
    </div>
  )
}
