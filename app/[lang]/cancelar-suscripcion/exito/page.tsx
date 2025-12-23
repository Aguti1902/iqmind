'use client'

import { useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaCheckCircle, FaTag, FaHome } from 'react-icons/fa'

export default function ExitoCancelacionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const searchParams = useSearchParams()
  const hasDiscount = searchParams.get('discount') === 'true'

  useEffect(() => {
    // Limpiar localStorage
    localStorage.removeItem('cancelEmail')
    localStorage.removeItem('cancelName')
    localStorage.removeItem('cancelReason')
  }, [])

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
              ¡Genial! Descuento Aplicado
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Has aceptado el descuento del 50% durante 3 meses.<br />
              ¡Gracias por quedarte con nosotros!
            </p>

            {/* Información del descuento */}
            <div className="bg-gradient-to-br from-[#07C59A]/10 to-[#07C59A]/20 border-2 border-[#07C59A] rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
              <FaTag className="text-5xl text-[#07C59A] mx-auto mb-4" />
              
              <h2 className="text-3xl font-bold text-[#113240] mb-4">
                Tu descuento ha sido aplicado
              </h2>
              
              <div className="bg-white rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plan Quincenal</p>
                    <p className="text-3xl font-bold text-[#113240]">
                      <span className="line-through text-gray-400 text-xl">9,99€</span>
                      {' → '}
                      <span className="text-[#07C59A]">4,99€</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ahorro: 15€ en 3 meses</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plan Mensual</p>
                    <p className="text-3xl font-bold text-[#113240]">
                      <span className="line-through text-gray-400 text-xl">19,99€</span>
                      {' → '}
                      <span className="text-[#07C59A]">9,99€</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ahorro: 30€ en 3 meses</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-[#07C59A] text-xl">✓</span>
                  <p className="text-gray-700">
                    <strong>A partir de tu próxima factura</strong>, disfrutarás del 50% de descuento
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#07C59A] text-xl">✓</span>
                  <p className="text-gray-700">
                    El descuento se aplicará <strong>automáticamente durante los próximos 3 meses</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#07C59A] text-xl">✓</span>
                  <p className="text-gray-700">
                    Después de 3 meses, el precio volverá al normal (<strong>puedes cancelar antes</strong>)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#07C59A] text-xl">✓</span>
                  <p className="text-gray-700">
                    Mantén <strong>todos tus beneficios premium</strong> sin restricciones
                  </p>
                </div>
              </div>
            </div>

            {/* Email de confirmación */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="font-bold text-blue-900 text-lg mb-2">
                📧 Confirmación por email
              </h3>
              <p className="text-blue-800">
                Te hemos enviado un email con todos los detalles de tu descuento. 
                Revisa tu bandeja de entrada (y spam por si acaso).
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-4">
              <button
                onClick={() => router.push(`/${lang}/cuenta`)}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-[#07C59A] to-[#069e7b] hover:from-[#069e7b] hover:to-[#058f6e] text-white py-4 px-8 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                Ver Mi Cuenta
              </button>

              <button
                onClick={() => router.push(`/${lang}`)}
                className="text-gray-600 hover:text-gray-800 font-medium transition flex items-center justify-center gap-2"
              >
                <FaHome />
                Volver al Inicio
              </button>
            </div>

            {/* Mensaje de agradecimiento */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <p className="text-gray-600 text-lg">
                💚 Gracias por confiar en MindMetric y por quedarte con nosotros
              </p>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

