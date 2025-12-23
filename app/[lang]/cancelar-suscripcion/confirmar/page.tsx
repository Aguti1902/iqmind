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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 md:py-10">
        <div className="container-custom max-w-6xl px-4">
          
          {/* Header compacto */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaExclamationTriangle className="text-3xl text-red-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¿Estás completamente seguro?
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Esta es tu última oportunidad para mantener tu suscripción premium
            </p>
          </div>

          {/* Card Principal con Grid */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              
              {/* COLUMNA IZQUIERDA: Estadística e Info */}
              <div className="space-y-4">
                
                {/* Estadística impactante */}
                <div className="bg-[#07C59A]/10 border-2 border-[#07C59A] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaChartLine className="text-3xl text-[#07C59A] flex-shrink-0" />
                    <div>
                      <p className="text-4xl font-bold text-[#113240]">87%</p>
                      <p className="text-xs text-gray-600">de nuestros usuarios</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Que cancelaron su suscripción <strong>volvieron a activarla después</strong>, 
                    pero perdieron su historial y estadísticas acumuladas.
                  </p>
                </div>

                {/* Información importante */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                  <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                    ℹ️ Información importante
                  </h3>
                  <ul className="space-y-1.5 text-blue-800 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Mantendrás acceso hasta el final de tu período actual</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>No se realizarán más cobros después</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Tu historial se mantendrá por 30 días</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Después de 30 días, tus datos serán eliminados</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* COLUMNA DERECHA: Lo que perderás */}
              <div className="space-y-4">
                
                {/* Lo que perderás */}
                <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">
                    📊 Perderás acceso permanente a:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 bg-white rounded-lg">
                      <span className="text-xl flex-shrink-0">🧠</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Tests Ilimitados</p>
                        <p className="text-xs text-gray-600">CI, Personalidad, TDAH, Ansiedad</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-white rounded-lg">
                      <span className="text-xl flex-shrink-0">📈</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Análisis Avanzado</p>
                        <p className="text-xs text-gray-600">Seguimiento de evolución</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-white rounded-lg">
                      <span className="text-xl flex-shrink-0">🏆</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Certificados</p>
                        <p className="text-xs text-gray-600">Descargables y compartibles</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-white rounded-lg">
                      <span className="text-xl flex-shrink-0">📊</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Dashboard Premium</p>
                        <p className="text-xs text-gray-600">Gráficos y comparativas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ayuda */}
                <div className="bg-gradient-to-br from-[#07C59A]/10 to-[#07C59A]/5 border border-[#07C59A]/30 rounded-xl p-3 text-center">
                  <p className="text-gray-700 text-xs mb-2">
                    ¿Tienes algún problema con tu suscripción?
                  </p>
                  <a 
                    href={`/${lang}/contacto`}
                    className="text-[#07C59A] hover:text-[#069e7b] font-semibold text-sm underline"
                  >
                    Contacta con soporte →
                  </a>
                </div>

              </div>

            </div>

            {/* Botones de Acción - Full Width abajo */}
            <div className="border-t border-gray-200 p-6 space-y-3">
              <button
                onClick={handleGoBack}
                className="w-full bg-gradient-to-r from-[#07C59A] to-[#069e7b] hover:from-[#069e7b] hover:to-[#058f6e] text-white py-4 px-6 rounded-xl font-bold text-base md:text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FaArrowLeft />
                Volver y Mantener mi Premium
              </button>
              
              <button
                onClick={handleConfirmCancel}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-bold text-base md:text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Cancelando...
                  </>
                ) : (
                  'Sí, Cancelar Definitivamente'
                )}
              </button>

              {/* Nota final */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  💭 Recuerda: Puedes volver en cualquier momento, pero perderás tu historial actual
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

