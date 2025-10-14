'use client'

import { useState, useEffect } from 'react'
import { FaBrain, FaStar, FaTrophy, FaClock } from 'react-icons/fa'

interface BrainGameProps {
  onComplete: (score: number) => void
  translations?: {
    title: string
    instruction: string
    score: string
    time: string
    gameOver: string
    playAgain: string
    excellent: string
    good: string
    average: string
    tryAgain: string
  }
}

export default function BrainGame({ onComplete, translations }: BrainGameProps) {
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [showSequence, setShowSequence] = useState(false)
  const [gameState, setGameState] = useState<'waiting' | 'showing' | 'playing' | 'finished'>('waiting')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [level, setLevel] = useState(1)
  const [message, setMessage] = useState('')

  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500'
  ]

  const t = translations || {
    title: 'Memory Game',
    instruction: 'Watch the sequence and repeat it',
    score: 'Score',
    time: 'Time',
    gameOver: 'Game Over!',
    playAgain: 'Play Again',
    excellent: 'Excellent!',
    good: 'Good job!',
    average: 'Not bad!',
    tryAgain: 'Try again!'
  }

  useEffect(() => {
    if (gameState === 'waiting') {
      startNewLevel()
    }
  }, [gameState])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0) {
      endGame()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, gameState])

  const startNewLevel = () => {
    const newSequence = Array.from({ length: level + 2 }, () => 
      Math.floor(Math.random() * 6)
    )
    setSequence(newSequence)
    setUserSequence([])
    setShowSequence(true)
    setGameState('showing')
    
    setTimeout(() => {
      setShowSequence(false)
      setGameState('playing')
      setTimeLeft(30)
    }, (level + 2) * 800)
  }

  const handleColorClick = (colorIndex: number) => {
    if (gameState !== 'playing') return

    const newUserSequence = [...userSequence, colorIndex]
    setUserSequence(newUserSequence)

    // Verificar si la secuencia es correcta hasta ahora
    const isCorrect = newUserSequence.every((color, index) => 
      color === sequence[index]
    )

    if (!isCorrect) {
      setMessage(t.tryAgain)
      setTimeout(() => {
        setGameState('finished')
        onComplete(score)
      }, 1000)
      return
    }

    // Si la secuencia está completa
    if (newUserSequence.length === sequence.length) {
      const newScore = score + level * 10
      setScore(newScore)
      
      if (level < 5) {
        setMessage(level === 4 ? t.excellent : level >= 2 ? t.good : t.average)
        setTimeout(() => {
          setLevel(level + 1)
          setGameState('waiting')
          setMessage('')
        }, 1500)
      } else {
        setMessage(t.excellent)
        setTimeout(() => {
          setGameState('finished')
          onComplete(newScore)
        }, 1500)
      }
    }
  }

  const endGame = () => {
    setGameState('finished')
    onComplete(score)
  }

  const restart = () => {
    setScore(0)
    setLevel(1)
    setSequence([])
    setUserSequence([])
    setShowSequence(false)
    setGameState('waiting')
    setTimeLeft(30)
    setMessage('')
  }

  const getPerformanceMessage = () => {
    if (score >= 150) return t.excellent
    if (score >= 100) return t.good
    if (score >= 50) return t.average
    return t.tryAgain
  }

  if (gameState === 'finished') {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
        <FaTrophy className="text-6xl mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">{t.gameOver}</h3>
        <p className="text-lg mb-4">{getPerformanceMessage()}</p>
        <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
          <p className="text-3xl font-bold">{score}</p>
          <p className="text-sm opacity-90">Final Score</p>
        </div>
        <button
          onClick={restart}
          className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition"
        >
          {t.playAgain}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FaBrain className="text-2xl text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">{t.title}</h3>
        </div>
        <p className="text-gray-600 text-sm">{t.instruction}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center bg-blue-50 rounded-lg p-3">
          <FaStar className="text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-600">{score}</p>
          <p className="text-xs text-gray-600">{t.score}</p>
        </div>
        <div className="text-center bg-green-50 rounded-lg p-3">
          <FaClock className="text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-600">{timeLeft}</p>
          <p className="text-xs text-gray-600">{t.time}</p>
        </div>
        <div className="text-center bg-purple-50 rounded-lg p-3">
          <FaTrophy className="text-purple-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-purple-600">{level}</p>
          <p className="text-xs text-gray-600">Level</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorClick(index)}
            className={`aspect-square rounded-lg transition-all duration-200 ${
              showSequence && sequence.includes(index)
                ? 'scale-110 shadow-lg'
                : 'hover:scale-105'
            } ${color}`}
            disabled={gameState === 'showing'}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{message}</p>
        </div>
      )}

      {/* Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{userSequence.length}/{sequence.length}</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(userSequence.length / sequence.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
