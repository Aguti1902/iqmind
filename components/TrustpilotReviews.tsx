'use client'

import { useState, useEffect, useCallback } from 'react'

interface Review {
  name: string
  text: string
  title?: string
  initials?: string
}

interface TrustpilotReviewsProps {
  reviews: Review[]
  visibleCount?: number
  rating?: number
  totalReviews?: string
  compact?: boolean
}

const TIME_AGOS = [
  'Hace 1 hora',
  'Hace 2 horas',
  'Hace 5 horas',
  'Hace 6 horas',
  'Hace 12 horas',
  'Hace 17 horas',
  'Hace 1 día',
  'Hace 2 días',
  'Hace 3 días',
]

function getEmailHint(name: string): string {
  const clean = name
    .toLowerCase()
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
  const domains = ['gmail.c...', 'yahoo.c...', 'hotmail...', 'outlook...']
  const domain = domains[name.length % domains.length]
  return clean.substring(0, 9) + '...' + domain
}

function getAutoTitle(text: string): string {
  const words = text.split(' ')
  if (words.length <= 3) return text
  return words.slice(0, 3).join(' ') + '...'
}

function TrustpilotStarBox({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'
  return (
    <div className={`${dim} bg-[#00B67A] flex items-center justify-center flex-shrink-0`}>
      <svg viewBox="0 0 24 24" className="w-[70%] h-[70%] fill-white">
        <path d="M12 2l2.582 7.647H22.5l-6.535 4.706 2.582 7.647L12 17.294l-6.547 4.706 2.582-7.647L1.5 9.647h7.918z" />
      </svg>
    </div>
  )
}

function TrustpilotStarRow({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <TrustpilotStarBox key={i} size={size} />
      ))}
    </div>
  )
}

function TrustpilotLogo({ small = false }: { small?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${small ? 'mt-1' : 'mt-2'}`}>
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${small ? 'w-3.5 h-3.5' : 'w-4 h-4'} bg-[#00B67A] flex items-center justify-center`}>
            <svg viewBox="0 0 24 24" className="w-[70%] h-[70%] fill-white">
              <path d="M12 2l2.582 7.647H22.5l-6.535 4.706 2.582 7.647L12 17.294l-6.547 4.706 2.582-7.647L1.5 9.647h7.918z" />
            </svg>
          </div>
        ))}
      </div>
      <span className={`font-semibold text-gray-800 ${small ? 'text-xs' : 'text-sm'}`}>Trustpilot</span>
    </div>
  )
}

export default function TrustpilotReviews({
  reviews,
  visibleCount = 3,
  rating = 4.1,
  totalReviews = '125.390',
  compact = false,
}: TrustpilotReviewsProps) {
  const [current, setCurrent] = useState(0)
  const step = visibleCount
  const maxIndex = Math.max(0, reviews.length - visibleCount)

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : Math.min(maxIndex, prev + step)))
  }, [maxIndex, step])

  const goPrev = () => {
    setCurrent((prev) => (prev === 0 ? maxIndex : Math.max(0, prev - step)))
  }

  useEffect(() => {
    const timer = setInterval(goNext, 5000)
    return () => clearInterval(timer)
  }, [goNext])

  const cardWidthPct = 100 / visibleCount
  const translatePct = current * cardWidthPct

  return (
    <div>
      {/* Cards carousel */}
      <div className="relative" style={{ paddingLeft: compact ? '28px' : '40px', paddingRight: compact ? '28px' : '40px' }}>
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${translatePct}%)` }}
          >
            {reviews.map((review, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-2"
                style={{ width: `${cardWidthPct}%` }}
              >
                <div className={`bg-white border border-gray-200 rounded-sm h-full flex flex-col ${compact ? 'p-3' : 'p-4'}`}>
                  {/* Stars + verified */}
                  <div className="flex items-center justify-between mb-2">
                    <TrustpilotStarRow size={compact ? 'sm' : 'md'} />
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#00B67A] flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-2 h-2 fill-white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </div>
                      <span className="whitespace-nowrap">Por invit...</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className={`font-bold text-gray-900 mb-1 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                    {review.title || getAutoTitle(review.text)}
                  </h4>

                  {/* Body */}
                  <p className={`text-gray-700 leading-snug flex-1 ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
                    {review.text}
                  </p>

                  {/* Footer: email + time */}
                  <div className={`flex items-center gap-1 text-gray-400 mt-2 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    <span className="truncate">{getEmailHint(review.name)}</span>
                    <span>·</span>
                    <span className="whitespace-nowrap">{TIME_AGOS[index % TIME_AGOS.length]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow left */}
        <button
          onClick={goPrev}
          className={`absolute top-1/2 -translate-y-1/2 left-0 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:border-gray-500 transition-colors ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}
          aria-label="Anterior"
        >
          <svg viewBox="0 0 24 24" className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} fill-current text-gray-600`}>
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        {/* Arrow right */}
        <button
          onClick={goNext}
          className={`absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:border-gray-500 transition-colors ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}
          aria-label="Siguiente"
        >
          <svg viewBox="0 0 24 24" className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} fill-current text-gray-600`}>
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className={`text-center ${compact ? 'mt-3 text-xs' : 'mt-5 text-sm'} text-gray-600`}>
        <p>
          Valoración de{' '}
          <strong className="text-gray-900">{rating}</strong>{' '}
          sobre 5 en base a{' '}
          <strong className="underline cursor-pointer">{totalReviews} opiniones</strong>.{' '}
          {!compact && 'Nuestras opiniones de 3, 4 y 5 estrellas.'}
        </p>
        <div className="flex justify-center">
          <TrustpilotLogo small={compact} />
        </div>
      </div>
    </div>
  )
}
