'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslations } from '@/hooks/useTranslations'
import { FaUserCircle, FaEnvelope, FaTimesCircle } from 'react-icons/fa'
// Modal ya no se usa - ahora son páginas independientes

export default function CancelarSuscripcionPage() {
  const { t, loading, lang } = useTranslations()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    reason: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [endDate, setEndDate] = useState('')
  // Estados del modal eliminados - ahora son páginas

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que los campos estén completos
    if (!formData.email || !formData.fullName) {
      setError('Por favor completa todos los campos requeridos')
      return
    }
    
    // Guardar datos en localStorage para el flujo de páginas
    localStorage.setItem('cancelEmail', formData.email)
    localStorage.setItem('cancelName', formData.fullName)
    localStorage.setItem('cancelReason', formData.reason)
    
    // Redirigir a la página de oferta
    router.push(`/${lang}/cancelar-suscripcion/oferta`)
  }

  // Funciones del modal eliminadas - ahora en páginas separadas
  
  const handleConfirmCancel_OLD = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Llamar a la API para cancelar la suscripción en Stripe
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al cancelar la suscripción')
        setIsSubmitting(false)
        return
      }

      // Guardar la fecha de finalización
      const cancelDate = data.subscription?.currentPeriodEnd 
        ? new Date(data.subscription.currentPeriodEnd * 1000).toLocaleDateString('es-ES')
        : new Date().toLocaleDateString('es-ES')
      
      setEndDate(cancelDate)
      setCancelFlowSuccess(true)
      setUserAcceptedDiscount(false) // Explícitamente marcamos que NO aceptó descuento
      setIsSubmitting(false)

      // Limpiar localStorage
      localStorage.removeItem('paymentCompleted')
      localStorage.removeItem('subscriptionId')

      // El modal manejará la redirección a Trustpilot

    } catch (error) {
      console.error('Error al cancelar suscripción:', error)
      setError('Error al procesar la solicitud. Por favor, intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  const handleAcceptDiscount = async () => {
    try {
      const response = await fetch('/api/apply-retention-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          discountPercent: 50,
          durationMonths: 3
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Cerrar el modal y mostrar mensaje de éxito
        setShowCancelFlow(false)
        setIsSubmitted(true)
        setEndDate('') // No hay fecha de cancelación porque mantuvieron la suscripción
        setUserAcceptedDiscount(true) // Explícitamente marcamos que SÍ aceptó descuento
      } else {
        setError(data.error || 'Error al aplicar el descuento')
      }
    } catch (error) {
      console.error('Error aplicando descuento:', error)
      setError('Error de conexión. Por favor intenta de nuevo.')
    }
  }

  const handleCloseCancelFlow = () => {
    setShowCancelFlow(false)
    
    // Si la cancelación fue exitosa (y NO aceptó descuento), marcar como submitted
    // Solo mostrar la página de éxito si realmente canceló
    if (cancelFlowSuccess && !userAcceptedDiscount) {
      // Esperar un momento antes de mostrar la página para que el modal termine de cerrarse
      setTimeout(() => {
        setIsSubmitted(true)
        setCancelFlowSuccess(false)
      }, 300)
    } else if (userAcceptedDiscount) {
      // Si aceptó el descuento, ya está manejado en handleAcceptDiscount
      setCancelFlowSuccess(false)
    } else {
      // Si cerró el modal sin hacer nada, solo resetear
      setCancelFlowSuccess(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (isSubmitted) {
    // Usar la variable explícita para determinar si aceptó el descuento
    const acceptedDiscount = userAcceptedDiscount
    
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-20">
          <div className="container-custom max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <div className={`w-20 h-20 ${acceptedDiscount ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <FaTimesCircle className={`text-4xl ${acceptedDiscount ? 'text-green-600' : 'text-blue-600'}`} />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {acceptedDiscount ? '¡Genial! Descuento Aplicado' : t.cancel.successTitle}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                {acceptedDiscount 
                  ? 'Has aceptado el descuento del 50% durante 3 meses. ¡Gracias por quedarte con nosotros!' 
                  : t.cancel.successMessage
                }
              </p>

              {acceptedDiscount ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 text-left">
                  <p className="text-gray-700 mb-2">
                    <strong>🎉 Tu descuento ha sido aplicado</strong>
                  </p>
                  <p className="text-gray-700">
                    A partir de tu próxima factura, disfrutarás de un 50% de descuento durante 3 meses.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 text-left">
                  <p className="text-gray-700 mb-2">
                    <strong>{t.cancel.successInfo}</strong>
                  </p>
                  {endDate && (
                    <p className="text-gray-700">
                      <strong>Fecha de finalización de tu suscripción:</strong> {endDate}
                    </p>
                  )}
                </div>
              )}

              <a
                href={`/${lang}`}
                className="inline-block bg-[#07C59A] hover:bg-[#069e7b] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
              >
                {t.cancel.backHome}
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTimesCircle className="text-4xl text-red-600" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t.cancel.title}
              </h1>
              
              <p className="text-xl text-gray-600">
                {t.cancel.subtitle}
              </p>
            </div>

            {/* Información importante */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">{t.cancel.beforeCancel}</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• {t.cancel.point1}</li>
                <li>• {t.cancel.point2}</li>
                <li>• {t.cancel.point3}</li>
                <li>• {t.cancel.point4}</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Nombre Completo */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.cancel.fullName} {t.cancel.required}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserCircle className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07C59A] focus:border-transparent"
                    placeholder={t.cancel.fullNamePlaceholder}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.cancel.email} {t.cancel.required}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07C59A] focus:border-transparent"
                    placeholder={t.cancel.emailPlaceholder}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {t.cancel.emailHelper}
                </p>
              </div>

              {/* Motivo (opcional) */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.cancel.reason}
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07C59A] focus:border-transparent"
                  placeholder={t.cancel.reasonPlaceholder}
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.cancel.processing : t.cancel.confirmButton}
                </button>
                
                <a
                  href={`/${lang}`}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg text-center transition-all duration-200"
                >
                  {t.cancel.backButton}
                </a>
              </div>
            </form>

            {/* Ayuda */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-2">
                {t.cancel.helpTitle}
              </p>
              <a href={`/${lang}/contacto`} className="text-[#07C59A] hover:text-[#069e7b] font-medium">
                {t.cancel.contactUs}
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}


