'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function EncuestaSatisfaccionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('cancelEmail')
    if (!email) {
      router.push(`/${lang}/cancelar-suscripcion`)
      return
    }
    setUserEmail(email)
  }, [router, lang])

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score)
  }

  const handleContinue = async () => {
    if (selectedScore === null) {
      alert('Por favor, selecciona una puntuación')
      return
    }

    setSubmitting(true)

    try {
      // Guardar la encuesta
      await fetch('/api/satisfaction-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          score: selectedScore,
          timestamp: new Date().toISOString()
        })
      })

      // Continuar a página de gracias
      router.push(`/${lang}/cancelar-suscripcion/gracias`)
    } catch (error) {
      console.error('Error guardando encuesta:', error)
      // Continuar de todos modos
      router.push(`/${lang}/cancelar-suscripcion/gracias`)
    }
  }

  const handleSkip = () => {
    // Omitir y continuar
    router.push(`/${lang}/cancelar-suscripcion/gracias`)
  }

  const getScoreColor = (score: number) => {
    if (score <= 2) return 'bg-red-200 border-red-300 hover:bg-red-300'
    if (score <= 4) return 'bg-orange-200 border-orange-300 hover:bg-orange-300'
    if (score <= 6) return 'bg-yellow-200 border-yellow-300 hover:bg-yellow-300'
    if (score <= 8) return 'bg-lime-200 border-lime-300 hover:bg-lime-300'
    return 'bg-green-200 border-green-300 hover:bg-green-300'
  }

  const getScoreSelectedColor = (score: number) => {
    if (score <= 2) return 'bg-red-300 border-red-500'
    if (score <= 4) return 'bg-orange-300 border-orange-500'
    if (score <= 6) return 'bg-yellow-300 border-yellow-500'
    if (score <= 8) return 'bg-lime-300 border-lime-500'
    return 'bg-green-300 border-green-500'
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 md:py-20">
        <div className="container-custom max-w-4xl">
          
          {/* Notificación */}
          <div className="bg-blue-100 border border-blue-300 text-blue-800 text-center py-3 px-6 rounded-xl mb-8">
            <p className="font-medium">Se ha cancelado tu suscripción.</p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            
            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
              Qué pena que te nos vayas
            </h1>
            
            <p className="text-xl text-gray-600 text-center mb-12">
              En una escala del 0 al 10, ¿cuál es tu grado de satisfacción con MindMetric?
            </p>

            {/* Escala de Satisfacción */}
            <div className="border-2 border-gray-300 rounded-2xl p-8 md:p-12 mb-8">
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreSelect(score)}
                    className={`
                      w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center
                      text-2xl md:text-3xl font-bold transition-all transform hover:scale-110
                      ${selectedScore === score 
                        ? `${getScoreSelectedColor(score)} scale-110 shadow-lg ring-4 ring-${score <= 2 ? 'red' : score <= 4 ? 'orange' : score <= 6 ? 'yellow' : score <= 8 ? 'lime' : 'green'}-400`
                        : getScoreColor(score)
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Gran insatisfacción</span>
                <span>Gran satisfacción</span>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-4">
              <button
                onClick={handleContinue}
                disabled={submitting || selectedScore === null}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-5 px-8 rounded-xl font-bold text-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  'Continuar'
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={submitting}
                className="w-full text-[#07C59A] hover:text-[#069e7b] font-semibold text-lg transition disabled:opacity-50"
              >
                Omitir
              </button>
            </div>

            {/* Mensaje de agradecimiento */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                💙 Tu opinión nos ayuda a mejorar el servicio para futuros usuarios
              </p>
            </div>

          </div>

          {/* Nota final */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Tus respuestas son anónimas y solo se usan para mejorar nuestro servicio
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

