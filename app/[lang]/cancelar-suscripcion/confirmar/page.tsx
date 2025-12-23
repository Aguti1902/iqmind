'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaExclamationTriangle, FaChartLine, FaArrowLeft } from 'react-icons/fa'

export default function ConfirmarCancelacionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('cancelEmail')
    const name = localStorage.getItem('cancelName')
    
    if (!email) {
      router.push(`/${lang}/cancelar-suscripcion`)
      return
    }
    
    setUserEmail(email)
    setUserName(name || '')
  }, [router, lang])

  const handleConfirmCancel = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          fullName: userName
        })
      })

      if (response.ok) {
        // Redirigir a la encuesta de satisfacción
        router.push(`/${lang}/cancelar-suscripcion/encuesta`)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al cancelar la suscripción')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push(`/${lang}/cancelar-suscripcion/oferta`)
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 md:py-20">
        <div className="container-custom max-w-4xl">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaExclamationTriangle className="text-5xl text-red-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Estás completamente seguro?
            </h1>
            <p className="text-xl text-gray-600">
              Esta es tu última oportunidad para mantener tu suscripción premium
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            
            {/* Estadística impactante */}
            <div className="bg-[#07C59A]/10 border-2 border-[#07C59A] rounded-2xl p-8 mb-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <FaChartLine className="text-4xl text-[#07C59A]" />
                <div className="text-left">
                  <p className="text-5xl font-bold text-[#113240]">87%</p>
                  <p className="text-sm text-gray-600">de nuestros usuarios</p>
                </div>
              </div>
              <p className="text-lg text-gray-700">
                Que cancelaron su suscripción <strong>volvieron a activarla después</strong>, 
                pero perdieron su historial y estadísticas acumuladas.
              </p>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-blue-900 text-xl mb-3 flex items-center gap-2">
                ℹ️ Información importante
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Mantendrás acceso hasta el final de tu período de facturación actual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>No se realizarán más cobros después de esa fecha</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Tu historial de tests se mantendrá por 30 días</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Después de 30 días, todos tus datos serán eliminados permanentemente</span>
                </li>
              </ul>
            </div>

            {/* Lo que perderás - Detallado */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 text-xl mb-4">
                📊 Perderás acceso permanente a:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <p className="font-semibold text-gray-900">Tests Ilimitados</p>
                    <p className="text-sm text-gray-600">CI, Personalidad, TDAH, Ansiedad, Depresión</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-semibold text-gray-900">Análisis Avanzado</p>
                    <p className="text-sm text-gray-600">Seguimiento de evolución y estadísticas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold text-gray-900">Certificados</p>
                    <p className="text-sm text-gray-600">Descargables y compartibles profesionales</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-gray-900">Dashboard Premium</p>
                    <p className="text-sm text-gray-600">Gráficos interactivos y comparativas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-4">
              <button
                onClick={handleGoBack}
                className="w-full bg-gradient-to-r from-[#07C59A] to-[#069e7b] hover:from-[#069e7b] hover:to-[#058f6e] text-white py-5 px-8 rounded-xl font-bold text-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <FaArrowLeft />
                Volver y Mantener mi Premium
              </button>
              
              <button
                onClick={handleConfirmCancel}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-5 px-8 rounded-xl font-bold text-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Cancelando...
                  </>
                ) : (
                  'Sí, Cancelar Definitivamente'
                )}
              </button>
            </div>

            {/* Nota final */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                💭 Recuerda: Puedes volver en cualquier momento, pero perderás tu historial actual
              </p>
            </div>
          </div>

          {/* Ayuda */}
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              ¿Tienes algún problema con tu suscripción?
            </p>
            <a 
              href={`/${lang}/contacto`}
              className="text-[#07C59A] hover:text-[#069e7b] font-semibold underline"
            >
              Contacta con nuestro equipo de soporte →
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

