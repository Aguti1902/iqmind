'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaTag, FaCrown, FaStar } from 'react-icons/fa'

interface SubscriptionCancelFlowProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onAcceptDiscount?: () => void
  loading?: boolean
  success?: boolean
  error?: string
}

type FlowStep = 'upsell' | 'confirm' | 'success'

export default function SubscriptionCancelFlow({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onAcceptDiscount,
  loading = false,
  success = false,
  error
}: SubscriptionCancelFlowProps) {
  const [step, setStep] = useState<FlowStep>('upsell')
  const [countdown, setCountdown] = useState(5)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (success) {
      setStep('success')
      setCountdown(5)
    }
  }, [success])

  // Countdown para redirección a Trustpilot
  useEffect(() => {
    if (step === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (step === 'success' && countdown === 0) {
      handleRedirectToTrustpilot()
    }
  }, [step, countdown])

  const handleRedirectToTrustpilot = () => {
    setRedirecting(true)
    // Abrir Trustpilot en nueva pestaña
    window.open('https://www.trustpilot.com/evaluate/mindmetric.io', '_blank')
    // Cerrar el modal después de un breve delay
    setTimeout(() => {
      onClose()
      setStep('upsell')
      setRedirecting(false)
    }, 1000)
  }

  const handleContinueToCancel = () => {
    setStep('confirm')
  }

  const handleAcceptDiscount = () => {
    if (onAcceptDiscount) {
      onAcceptDiscount()
    }
    onClose()
    setStep('upsell')
  }

  const handleConfirmCancel = () => {
    onConfirm()
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('upsell')
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all animate-fadeIn">
        
        {/* PASO 1: UPSELL - Oferta con descuento */}
        {step === 'upsell' && (
          <>
            {/* Header con diseño atractivo */}
            <div className="relative bg-gradient-to-r from-[#113240] to-[#1a4a5e] rounded-t-2xl p-6 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-[#07C59A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaCrown className="text-4xl text-yellow-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  ¡Espera! Tenemos una oferta especial para ti
                </h3>
                <p className="text-sm opacity-90">
                  No queremos que te vayas sin ofrecerte lo mejor
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Banner OFERTA LIMITADA - Fuera de la card */}
              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-2 px-4 rounded-lg mb-4 shadow-lg animate-pulse">
                <p className="text-sm font-bold tracking-wide">
                  ⚡ ¡OFERTA LIMITADA! ⚡
                </p>
              </div>

              {/* Oferta destacada */}
              <div className="bg-gradient-to-br from-[#07C59A]/10 to-[#07C59A]/20 border-2 border-[#07C59A] rounded-xl p-6 mb-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#07C59A] rounded-full flex items-center justify-center shadow-lg">
                    <FaTag className="text-2xl text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#113240]">
                      50% de descuento
                    </h4>
                    <p className="text-sm text-gray-700">
                      Por los próximos 3 meses
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-[#07C59A]/30">
                    <p className="text-xs text-gray-600 mb-1">Plan Quincenal</p>
                    <p className="text-lg font-bold text-[#113240]">
                      <span className="line-through text-gray-400 text-sm">9,99€</span> 
                      <span className="text-[#07C59A] ml-1">4,99€</span>
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-[#07C59A]/30">
                    <p className="text-xs text-gray-600 mb-1">Plan Mensual</p>
                    <p className="text-lg font-bold text-[#113240]">
                      <span className="line-through text-gray-400 text-sm">19,99€</span> 
                      <span className="text-[#07C59A] ml-1">9,99€</span>
                    </p>
                  </div>
                </div>

                <div className="bg-[#113240] rounded-lg p-3">
                  <p className="text-xs text-white text-center font-semibold">
                    💎 Mantén todos tus beneficios premium por solo la mitad del precio
                  </p>
                </div>
              </div>

              {/* Beneficios que perderá */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2 text-base">
                  <FaExclamationTriangle className="text-xl" />
                  Si cancelas ahora perderás:
                </h4>
                <ul className="text-sm text-red-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <span>Tests ilimitados de CI, personalidad y habilidades cognitivas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <span>Análisis detallado y seguimiento de tu evolución</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <span>Certificados oficiales descargables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <span>Dashboard avanzado con gráficos de progreso</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleAcceptDiscount}
                  className="w-full bg-gradient-to-r from-[#07C59A] to-[#069e7b] hover:from-[#069e7b] hover:to-[#058f6e] text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105"
                >
                  <FaStar className="text-yellow-300" />
                  ¡Quiero el 50% de descuento!
                </button>
                
                <button
                  onClick={handleContinueToCancel}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition text-sm"
                >
                  No gracias, continuar con la cancelación
                </button>
              </div>

              <p className="text-xs text-[#113240] text-center mt-4 bg-[#07C59A]/10 py-2 rounded-lg">
                🔒 El descuento se aplicará automáticamente en tu próxima factura
              </p>
            </div>
          </>
        )}

        {/* PASO 2: CONFIRMACIÓN - Última oportunidad */}
        {step === 'confirm' && !success && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  ¿Estás completamente seguro?
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Esta es tu última oportunidad para mantener tu suscripción premium.
              </p>
              
              <div className="bg-[#07C59A]/10 border-2 border-[#07C59A] rounded-lg p-4 mb-4">
                <h4 className="font-bold text-[#113240] mb-2 flex items-center gap-2">
                  💡 ¿Sabías que...?
                </h4>
                <p className="text-sm text-gray-700">
                  El 87% de nuestros usuarios que cancelaron su suscripción volvieron a activarla después, 
                  pero perdieron su historial y estadísticas acumuladas.
                </p>
              </div>

              <div className="bg-[#113240]/5 border border-[#113240]/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-[#113240] mb-1 flex items-center gap-2">
                  ℹ️ Información importante:
                </h4>
                <p className="text-sm text-gray-700">
                  Mantendrás acceso hasta el final de tu período de facturación actual. 
                  No se realizarán más cobros después de esa fecha.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#07C59A] to-[#069e7b] hover:from-[#069e7b] hover:to-[#058f6e] text-white py-3 px-6 rounded-lg font-semibold transition disabled:opacity-50 shadow-md"
                >
                  Mantener mi Premium
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cancelando...
                    </>
                  ) : (
                    'Sí, Cancelar Definitivamente'
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* PASO 3: ÉXITO - Gracias + Redirección a Trustpilot */}
        {step === 'success' && (
          <>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600 text-4xl" />
              </div>
              
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Suscripción Cancelada
              </h4>
              
              <p className="text-gray-600 mb-6">
                Tu suscripción premium ha sido cancelada exitosamente. 
                Mantendrás acceso hasta el final de tu período de facturación actual.
              </p>

              <div className="bg-[#07C59A]/10 border-2 border-[#07C59A] rounded-xl p-6 mb-6">
                <h5 className="font-bold text-[#113240] mb-3 text-lg">
                  🌟 Tu opinión es muy importante para nosotros
                </h5>
                <p className="text-sm text-gray-700 mb-4">
                  Nos encantaría saber qué podemos mejorar. ¿Nos dejas una reseña en Trustpilot?
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4 border border-[#07C59A]/30">
                  <img 
                    src="https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg" 
                    alt="Trustpilot" 
                    className="h-8 mx-auto mb-2"
                  />
                  <p className="text-xs text-gray-600">
                    Redirigiendo automáticamente en <span className="font-bold text-[#07C59A]">{countdown}s</span>...
                  </p>
                </div>

                <button
                  onClick={handleRedirectToTrustpilot}
                  disabled={redirecting}
                  className="w-full bg-gradient-to-r from-[#113240] to-[#1a4a5e] hover:from-[#1a4a5e] hover:to-[#113240] text-white py-3 px-6 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {redirecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Redirigiendo...
                    </>
                  ) : (
                    <>
                      <FaStar className="text-[#07C59A]" />
                      Dejar Reseña Ahora
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

