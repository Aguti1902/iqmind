'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaCrown, FaTag, FaStar, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa'

export default function OfertaCancelacionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Obtener email del localStorage o sessionStorage
    const email = localStorage.getItem('cancelEmail') || sessionStorage.getItem('userEmail')
    if (!email) {
      // Si no hay email, redirigir al formulario
      router.push(`/${lang}/cancelar-suscripcion`)
      return
    }
    setUserEmail(email)
  }, [router, lang])

  const handleAcceptDiscount = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/apply-retention-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          discountPercent: 50,
          durationMonths: 3
        })
      })

      if (response.ok) {
        // Redirigir a página de éxito con descuento
        router.push(`/${lang}/cancelar-suscripcion/exito?discount=true`)
      } else {
        alert('Error al aplicar el descuento. Por favor, contacta con soporte.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
      setLoading(false)
    }
  }

  const handleRejectOffer = () => {
    // Continuar al siguiente paso (confirmación)
    router.push(`/${lang}/cancelar-suscripcion/confirmar`)
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 md:py-20">
        <div className="container-custom max-w-5xl">
          
          {/* Banner OFERTA LIMITADA */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-3 px-4 rounded-xl mb-8 shadow-lg animate-pulse">
            <p className="text-base md:text-lg font-bold tracking-wide">
              ⚡ ¡OFERTA LIMITADA SOLO HOY! ⚡
            </p>
          </div>

          {/* Header Principal */}
          <div className="bg-gradient-to-r from-[#113240] to-[#1a4a5e] rounded-t-3xl p-8 md:p-12 text-white text-center">
            <div className="w-24 h-24 bg-[#07C59A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FaCrown className="text-5xl text-yellow-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              ¡Espera! Tenemos una oferta especial para ti
            </h1>
            <p className="text-lg opacity-90">
              No queremos que te vayas sin ofrecerte lo mejor
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-b-3xl shadow-2xl p-8 md:p-12">
            
            {/* Oferta Destacada */}
            <div className="bg-gradient-to-br from-[#07C59A]/10 to-[#07C59A]/20 border-3 border-[#07C59A] rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#07C59A] rounded-full flex items-center justify-center shadow-lg">
                  <FaTag className="text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#113240]">
                    50% de descuento
                  </h2>
                  <p className="text-lg text-gray-700">
                    Por los próximos 3 meses
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="text-center p-6 bg-white rounded-xl border-2 border-[#07C59A]/30 shadow-md">
                  <p className="text-sm text-gray-600 mb-2">Plan Quincenal</p>
                  <p className="text-3xl font-bold text-[#113240]">
                    <span className="line-through text-gray-400 text-xl">9,99€</span>
                  </p>
                  <p className="text-4xl font-bold text-[#07C59A] mt-2">4,99€</p>
                  <p className="text-xs text-gray-500 mt-2">cada 2 semanas</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border-2 border-[#07C59A]/30 shadow-md">
                  <p className="text-sm text-gray-600 mb-2">Plan Mensual</p>
                  <p className="text-3xl font-bold text-[#113240]">
                    <span className="line-through text-gray-400 text-xl">19,99€</span>
                  </p>
                  <p className="text-4xl font-bold text-[#07C59A] mt-2">9,99€</p>
                  <p className="text-xs text-gray-500 mt-2">al mes</p>
                </div>
              </div>

              <div className="bg-[#113240] rounded-xl p-4 text-center">
                <p className="text-white font-semibold">
                  💎 Mantén todos tus beneficios premium por solo la mitad del precio
                </p>
              </div>
            </div>

            {/* Beneficios que perderá */}
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-red-800 mb-4 flex items-center gap-3 text-xl">
                <FaExclamationTriangle className="text-2xl" />
                Si cancelas ahora perderás:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-600 font-bold text-xl mt-1">✗</span>
                  <span className="text-red-700">Tests ilimitados de CI, personalidad y habilidades</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600 font-bold text-xl mt-1">✗</span>
                  <span className="text-red-700">Análisis detallado y seguimiento de evolución</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600 font-bold text-xl mt-1">✗</span>
                  <span className="text-red-700">Certificados oficiales descargables</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600 font-bold text-xl mt-1">✗</span>
                  <span className="text-red-700">Dashboard avanzado con gráficos de progreso</span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-4">
              <button
                onClick={handleAcceptDiscount}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#07C59A] to-[#069e7b] hover:from-[#069e7b] hover:to-[#058f6e] text-white py-5 px-8 rounded-xl font-bold text-xl transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Aplicando descuento...
                  </>
                ) : (
                  <>
                    <FaStar className="text-yellow-300 text-2xl" />
                    ¡Quiero el 50% de descuento!
                    <FaStar className="text-yellow-300 text-2xl" />
                  </>
                )}
              </button>
              
              <button
                onClick={handleRejectOffer}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-8 rounded-xl font-semibold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                No gracias, continuar con la cancelación
                <FaArrowRight />
              </button>
            </div>

            {/* Nota informativa */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#113240] bg-[#07C59A]/10 py-3 px-6 rounded-xl inline-block">
                🔒 El descuento se aplicará automáticamente en tu próxima factura
              </p>
            </div>
          </div>

          {/* Testimonios rápidos */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 text-sm italic">
                "El mejor precio que he visto. Vale totalmente la pena."
              </p>
              <p className="text-gray-800 font-semibold mt-2">- María G.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 text-sm italic">
                "Estaba a punto de cancelar, pero esta oferta me convenció."
              </p>
              <p className="text-gray-800 font-semibold mt-2">- Juan L.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-4xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 text-sm italic">
                "Increíble. Me ahorro 30€ en 3 meses. ¡Gracias!"
              </p>
              <p className="text-gray-800 font-semibold mt-2">- Ana P.</p>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

