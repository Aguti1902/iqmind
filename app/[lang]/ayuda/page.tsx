'use client'

import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaQuestionCircle, FaCreditCard, FaFileAlt, FaHeadset, FaChevronRight, FaCrown, FaSync, FaEnvelope, FaBan } from 'react-icons/fa'

export default function AyudaPage() {
  const { lang } = useParams()
  const router = useRouter()

  const categories = [
    {
      icon: <FaCrown className="text-3xl" />,
      title: 'Gestión de suscripciones',
      description: 'Administra tu plan premium, renovaciones y cancelaciones',
      color: 'from-purple-500 to-purple-700',
      links: [
        { title: 'Cancelar tu suscripción', href: '#cancelar' },
        { title: '¿Mi suscripción se renueva automáticamente?', href: '#renovacion' },
        { title: 'Actualizar dirección de correo electrónico', href: '#email' }
      ]
    },
    {
      icon: <FaCreditCard className="text-3xl" />,
      title: 'Facturación y pagos',
      description: 'Información sobre reembolsos, cargos y métodos de pago',
      color: 'from-blue-500 to-blue-700',
      links: [
        { title: '¿Dónde está mi reembolso?', href: `/${lang}/reembolso` },
        { title: 'No autoricé una suscripción o cargo recurrente', href: '#cargo' },
        { title: 'No estaba al tanto de los cargos', href: '#cargos-info' }
      ]
    },
    {
      icon: <FaFileAlt className="text-3xl" />,
      title: 'Legal y políticas',
      description: 'Consulta nuestros términos, privacidad y políticas',
      color: 'from-gray-600 to-gray-800',
      links: [
        { title: 'Política de privacidad', href: `/${lang}/privacidad` },
        { title: 'Términos y condiciones', href: `/${lang}/terminos` },
        { title: 'Política de cookies', href: `/${lang}/privacidad#cookies` },
        { title: 'Política de reembolso', href: `/${lang}/reembolso` }
      ]
    },
    {
      icon: <FaHeadset className="text-3xl" />,
      title: 'Conéctate con el soporte de MindMetric',
      description: 'Nuestro equipo está aquí para ayudarte',
      color: 'from-[#07C59A] to-[#069e7b]',
      links: [
        { title: 'Contacta con el soporte de MindMetric', href: `/${lang}/contacto` }
      ]
    }
  ]

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      // Scroll to section
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(href)
    }
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container-custom max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
              <FaQuestionCircle className="text-5xl text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Centro de ayuda MindMetric
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra respuestas rápidas a tus preguntas o contacta con nuestro equipo de soporte
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                  <div className="flex items-center gap-4 mb-3">
                    {category.icon}
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                  </div>
                  <p className="text-white/90">{category.description}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {category.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <button
                          onClick={() => handleNavigation(link.href)}
                          className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                            {link.title}
                          </span>
                          <FaChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed FAQ Sections */}
          <div className="space-y-12">
            {/* Gestión de Suscripciones */}
            <section id="cancelar" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaBan className="text-2xl text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Cancelar tu suscripción
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Puedes cancelar tu suscripción en cualquier momento desde tu cuenta. Una vez cancelada, 
                    mantendrás acceso a las funciones premium hasta el final de tu período de facturación actual.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4">Pasos para cancelar:</h3>
                  <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                    <li>Inicia sesión en tu cuenta de MindMetric</li>
                    <li>Ve a <strong>Perfil</strong> o <strong>Mi Cuenta</strong></li>
                    <li>Busca la sección <strong>"Suscripción Premium"</strong></li>
                    <li>Haz clic en <strong>"Gestionar Suscripción"</strong></li>
                    <li>Selecciona <strong>"Cancelar Suscripción"</strong></li>
                    <li>Confirma la cancelación</li>
                  </ol>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-6 rounded-r-lg">
                    <p className="font-semibold text-blue-900 mb-2">💡 Consejo:</p>
                    <p className="text-blue-800">
                      No olvides cancelar antes de que finalice tu período de prueba si no deseas continuar 
                      con la suscripción. No se realizarán cargos si cancelas durante el período de prueba.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => router.push(`/${lang}/cuenta`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                      Ir a Mi Cuenta
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Renovación Automática */}
            <section id="renovacion" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaSync className="text-2xl text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    ¿Mi suscripción se renueva automáticamente?
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Sí, tu suscripción a MindMetric se renueva automáticamente al final de cada período de facturación 
                    para asegurar que no pierdas acceso a tus funciones premium.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4">Detalles de la renovación:</h3>
                  <ul className="list-disc pl-6 space-y-3 text-gray-700">
                    <li>
                      <strong>Plan Quincenal:</strong> Se renueva automáticamente cada 2 semanas por €14.99
                    </li>
                    <li>
                      <strong>Plan Mensual:</strong> Se renueva automáticamente cada mes por €29.99
                    </li>
                    <li>
                      Recibirás un correo electrónico de confirmación después de cada cargo
                    </li>
                    <li>
                      Puedes cancelar en cualquier momento para evitar futuros cargos
                    </li>
                  </ul>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-6 rounded-r-lg">
                    <p className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</p>
                    <p className="text-yellow-800">
                      Si cancelas tu suscripción, seguirás teniendo acceso a las funciones premium hasta el 
                      final del período por el que ya has pagado. No se realizarán más cargos después de la cancelación.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Actualizar Email */}
            <section id="email" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaEnvelope className="text-2xl text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Actualizar dirección de correo electrónico
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Actualmente, el cambio de correo electrónico debe realizarse contactando con nuestro equipo de soporte.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4">Para actualizar tu email:</h3>
                  <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                    <li>Contacta con nuestro equipo de soporte</li>
                    <li>Proporciona tu correo electrónico actual y el nuevo</li>
                    <li>Verifica tu identidad (te solicitaremos información de tu cuenta)</li>
                    <li>Recibirás un correo de confirmación en tu nueva dirección</li>
                  </ol>

                  <div className="mt-6">
                    <button
                      onClick={() => router.push(`/${lang}/contacto`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                      Contactar Soporte
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Cargo no autorizado */}
            <section id="cargo" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FaCreditCard className="text-2xl text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    No autoricé una suscripción o cargo recurrente
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Si ves un cargo en tu tarjeta que no reconoces, aquí te explicamos qué hacer:
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4">Pasos a seguir:</h3>
                  <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                    <li>
                      <strong>Verifica el cargo:</strong> Revisa tu historial de pagos en tu cuenta de MindMetric
                    </li>
                    <li>
                      <strong>Revisa tu email:</strong> Busca confirmaciones de pago en tu correo
                    </li>
                    <li>
                      <strong>Contacta con soporte:</strong> Si no reconoces el cargo, contáctanos inmediatamente
                    </li>
                    <li>
                      <strong>Proporciona detalles:</strong> Incluye la fecha, monto y los últimos 4 dígitos de tu tarjeta
                    </li>
                  </ol>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6 mt-6 rounded-r-lg">
                    <p className="font-semibold text-red-900 mb-2">🚨 Acción inmediata:</p>
                    <p className="text-red-800 mb-4">
                      Si crees que hay actividad fraudulenta en tu cuenta, contáctanos de inmediato. 
                      Investigaremos y tomaremos las medidas necesarias.
                    </p>
                    <button
                      onClick={() => router.push(`/${lang}/contacto`)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition"
                    >
                      Contactar Urgentemente
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Información sobre cargos */}
            <section id="cargos-info" className="scroll-mt-20">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FaCreditCard className="text-2xl text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    No estaba al tanto de los cargos
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Entendemos que a veces los cargos pueden ser inesperados. Aquí te explicamos cómo funcionan:
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4">Información importante:</h3>
                  <ul className="list-disc pl-6 space-y-3 text-gray-700">
                    <li>
                      Al suscribirte, aceptas los <a href={`/${lang}/terminos`} className="text-blue-600 underline">términos y condiciones</a> 
                      que incluyen información sobre renovación automática
                    </li>
                    <li>
                      Enviamos recordatorios por correo electrónico antes de cada cargo
                    </li>
                    <li>
                      El primer cargo incluye un período de prueba de 7 días
                    </li>
                    <li>
                      Puedes revisar el historial completo de cargos en tu cuenta
                    </li>
                  </ul>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-6 rounded-r-lg">
                    <p className="font-semibold text-blue-900 mb-2">💡 Para el futuro:</p>
                    <p className="text-blue-800">
                      Te recomendamos agregar nuestro email (support@mindmetric.io) a tu lista de contactos 
                      para no perderte ninguna notificación importante sobre tu suscripción.
                    </p>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">¿Necesitas un reembolso?</h3>
                  <p className="text-gray-700 mb-4">
                    Consulta nuestra <a href={`/${lang}/reembolso`} className="text-blue-600 underline font-semibold">política de reembolso</a> 
                    para ver si cumples los requisitos.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-[#113240] to-[#052547] rounded-2xl shadow-2xl p-12 text-center text-white">
            <FaHeadset className="text-6xl mx-auto mb-6 text-[#07C59A]" />
            <h2 className="text-4xl font-bold mb-4">
              ¿Aún necesitas ayuda?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta o problema.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(`/${lang}/contacto`)}
                className="bg-[#07C59A] hover:bg-[#069e7b] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                Contactar Soporte
              </button>
              <button
                onClick={() => router.push(`/${lang}/cuenta`)}
                className="bg-white text-[#113240] hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                Ver Mi Cuenta
              </button>
            </div>
            <p className="mt-6 text-sm opacity-75">
              Email: <a href="mailto:support@mindmetric.io" className="underline">support@mindmetric.io</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

