'use client'

import { FaClock } from 'react-icons/fa'

interface TestHeaderProps {
  timeRemaining: number
  currentQuestion: number
  totalQuestions: number
  userName: string
  t: any
}

export default function TestHeader({ 
  timeRemaining, 
  currentQuestion, 
  totalQuestions, 
  userName, 
  t 
}: TestHeaderProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/images/LOGO2.svg" alt="IQmind" className="h-8 w-auto" />
          </div>
          
          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg ${
            timeRemaining < 60 ? 'bg-red-100 text-red-600' :
            timeRemaining < 300 ? 'bg-yellow-100 text-yellow-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            <FaClock className="text-lg" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
