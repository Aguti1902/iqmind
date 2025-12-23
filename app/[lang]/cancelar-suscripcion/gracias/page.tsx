'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaCheckCircle, FaStar, FaHeart } from 'react-icons/fa'

export default function GraciasCancelacionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const [countdown, setCountdown] = useState(10)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Limpiar localStorage
    localStorage.removeItem('cancelEmail')
    localStorage.removeItem('cancelName')
    localStorage.removeItem('paymentCompleted')
    localStorage.removeItem('subscriptionId')
  }, [])

  // Countdown para redirección automática
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      handleRedirectToTrustpilot()
    }
  }, [countdown])

  const handleRedirectToTrustpilot = () => {
    if (redirecting) return
    
    setRedirecting(true)
    // Abrir Trustpilot en la misma pestaña
    window.location.href = 'https://www.trustpilot.com/evaluate/mindmetric.io'
  }

  const handleGoHome = () => {
    router.push(`/${lang}`)
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 md:py-20">
        <div className="container-custom max-w-4xl">
          
          {/* Card Principal */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            
            {/* Icono de éxito */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Suscripción Cancelada
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Lamentamos verte partir, pero respetamos tu decisión
            </p>

            {/* Información importante */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-bold text-blue-900 text-lg mb-3">
                ℹ️ Información importante:
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Tu suscripción seguirá activa hasta el final del período de facturación actual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>No se realizarán más cobros después de esa fecha</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Tu historial se mantendrá por 30 días por si decides volver</span>
                </li>
              </ul>
            </div>

            {/* Separador */}
            <div className="border-t-2 border-gray-200 my-8"></div>

            {/* Sección Trustpilot */}
            <div className="bg-[#07C59A]/10 border-2 border-[#07C59A] rounded-2xl p-8 mb-8">
              <FaHeart className="text-4xl text-[#07C59A] mx-auto mb-4" />
              
              <h2 className="text-3xl font-bold text-[#113240] mb-4">
                Tu opinión es muy importante para nosotros
              </h2>
              
              <p className="text-lg text-gray-700 mb-6">
                Nos encantaría saber qué podemos mejorar. ¿Nos dejas una reseña en Trustpilot?
                Tu feedback nos ayuda a crear un mejor servicio para futuros usuarios.
              </p>

              {/* Logo Trustpilot */}
              <div className="bg-white rounded-xl p-6 mb-6 max-w-md mx-auto border border-[#07C59A]/30">
                <img 
                  src="https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg" 
                  alt="Trustpilot" 
                  className="h-10 mx-auto mb-3"
                />
                <p className="text-sm text-gray-600">
                  Redirigiendo automáticamente en{' '}
                  <span className="font-bold text-2xl text-[#07C59A]">{countdown}</span>{' '}
                  segundos...
                </p>
                <div className="mt-4 bg-[#07C59A]/20 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#07C59A] h-full transition-all duration-1000"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  onClick={handleRedirectToTrustpilot}
                  disabled={redirecting}
                  className="w-full max-w-md mx-auto bg-gradient-to-r from-[#113240] to-[#1a4a5e] hover:from-[#1a4a5e] hover:to-[#113240] text-white py-4 px-8 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {redirecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Redirigiendo...
                    </>
                  ) : (
                    <>
                      <FaStar className="text-[#07C59A]" />
                      Dejar Reseña en Trustpilot
                    </>
                  )}
                </button>

                <button
                  onClick={handleGoHome}
                  className="text-gray-600 hover:text-gray-800 font-medium transition"
                >
                  Ir al inicio sin dejar reseña
                </button>
              </div>
            </div>

            {/* Mensaje final */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ¿Cambiaste de opinión? Siempre puedes volver
              </p>
              <a 
                href={`/${lang}/pricing`}
                className="text-[#07C59A] hover:text-[#069e7b] font-semibold underline text-lg"
              >
                Ver planes disponibles →
              </a>
            </div>

          </div>

          {/* Testimonios de usuarios satisfechos */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">
              Lo que otros usuarios dicen sobre MindMetric:
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 max-w-xs">
                <div className="text-yellow-400 mb-2">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-gray-600 italic">
                  "Volví después de 2 meses. Ojalá no hubiera cancelado."
                </p>
                <p className="text-xs text-gray-500 mt-2">- Carlos M.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

