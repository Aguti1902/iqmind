'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { FaBrain, FaChartLine, FaCertificate, FaUserFriends, FaLock, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Home() {
  const { t, loading, lang } = useTranslations()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Auto-play carrousel (avanza de 3 en 3)
  useEffect(() => {
    if (!t?.testimonials?.reviews || t?.testimonials?.reviews?.length === 0) return
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => {
        const totalReviews = t?.testimonials?.reviews?.length || 1
        const maxIndex = Math.max(0, totalReviews - 3)
        return prev >= maxIndex ? 0 : Math.min(maxIndex, prev + 3)
      })
    }, 5000) // Cambia cada 5 segundos
    return () => clearInterval(timer)
  }, [t?.testimonials?.reviews])

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#07C59A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-white py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fadeIn">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {t.hero.title} <span className="text-[#07C59A]">{t.hero.titleHighlight}</span>
              </h1>
                <p className="text-xl text-gray-600 mb-8">
                  {t.hero.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                          <Link href={`/${loading ? 'es' : (t ? lang : 'es')}/test`} className="btn-primary text-center text-lg">
                            {t.hero.cta}
                          </Link>
                          <a href={`/${loading ? 'es' : (t ? lang : 'es')}#como-funciona`} className="btn-secondary text-center text-lg">
                            {t.hero.ctaSecondary}
                          </a>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#07C59A]" />
                    <span>{t.hero.secure}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#07C59A]" />
                    <span>{t.hero.validated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#07C59A]" />
                    <span>{t.hero.instant}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  {/* Card con efecto glassmorphism */}
                  <div className="bg-gradient-to-br from-[#07C59A]/10 to-[#113240]/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                    {/* Stats destacadas */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-white/90 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-4xl font-bold text-[#07C59A] mb-2">100K+</div>
                        <div className="text-sm text-gray-600">Usuarios</div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-4xl font-bold text-[#113240] mb-2">20</div>
                        <div className="text-sm text-gray-600">Preguntas</div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-4">
                      <div className="bg-white/90 rounded-xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#07C59A] to-[#069e7b] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaBrain className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.hero.questions}</h3>
                          <p className="text-gray-600 text-sm">{t.hero.questionsDesc}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/90 rounded-xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#07C59A] to-[#069e7b] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaChartLine className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.hero.analysis}</h3>
                          <p className="text-gray-600 text-sm">{t.hero.analysisDesc}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/90 rounded-xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#07C59A] to-[#069e7b] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaCertificate className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.hero.certificate}</h3>
                          <p className="text-gray-600 text-sm">{t.hero.certificateDesc}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Elemento decorativo */}
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#07C59A]/20 to-[#113240]/20 rounded-full blur-3xl -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo Funciona */}
        <section id="como-funciona" className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.howItWorks.title}
              </h2>
              <p className="text-xl text-gray-600">
                {t.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#07C59A] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-4">{t.howItWorks.step1}</h3>
                <p className="text-gray-600">
                  {t.howItWorks.step1Desc}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#07C59A] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-4">{t.howItWorks.step2}</h3>
                <p className="text-gray-600">
                  {t.howItWorks.step2Desc}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#07C59A] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-2xl font-semibold mb-4">{t.howItWorks.step3}</h3>
                <p className="text-gray-600">
                  {t.howItWorks.step3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.features.title}
              </h2>
              <p className="text-xl text-gray-600">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card hover:shadow-xl transition-shadow">
                <FaBrain className="text-4xl text-[#07C59A] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.validated}</h3>
                <p className="text-gray-600">
                  {t.features.validatedDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaUserFriends className="text-4xl text-[#07C59A] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.users}</h3>
                <p className="text-gray-600">
                  {t.features.usersDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaLock className="text-4xl text-[#07C59A] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.secure}</h3>
                <p className="text-gray-600">
                  {t.features.secureDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaChartLine className="text-4xl text-[#07C59A] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.analysis}</h3>
                <p className="text-gray-600">
                  {t.features.analysisDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaCertificate className="text-4xl text-[#07C59A] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.certificate}</h3>
                <p className="text-gray-600">
                  {t.features.certificateDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaCheckCircle className="text-4xl text-[#07C59A] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.instant}</h3>
                <p className="text-gray-600">
                  {t.features.instantDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios - Carrousel */}
        <section id="testimonios" className="py-20 bg-white">
          <div className="container-custom max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.testimonials.title}
              </h2>
              <p className="text-xl text-gray-600">
                {t.testimonials.subtitle}
              </p>
            </div>

            {/* Carrousel Container */}
            <div className="relative px-16">
              <div className="overflow-hidden py-4">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * (100 / 3)}%)` }}
                >
                  {t?.testimonials?.reviews?.map((review: any, index: number) => (
                    <div key={index} className="w-1/3 flex-shrink-0 px-3">
                      <div className="bg-white rounded-2xl shadow-xl p-6 h-full border border-gray-100">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#07C59A] to-[#069e7b] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {review.initials}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-bold text-base text-gray-900">{review.name}</h4>
                            <div className="text-yellow-400 text-sm">★★★★★</div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm italic">
                          "{review.text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => {
                  const totalReviews = t?.testimonials?.reviews?.length || 1
                  const maxIndex = Math.max(0, totalReviews - 3)
                  setCurrentTestimonial((prev) => (prev === 0 ? maxIndex : Math.max(0, prev - 3)))
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white hover:bg-[#07C59A] text-gray-800 hover:text-white p-4 rounded-full shadow-lg transition-all duration-300 z-10"
                aria-label="Anterior"
              >
                <FaChevronLeft className="text-xl" />
              </button>
              <button
                onClick={() => {
                  const totalReviews = t?.testimonials?.reviews?.length || 1
                  const maxIndex = Math.max(0, totalReviews - 3)
                  setCurrentTestimonial((prev) => (prev >= maxIndex ? 0 : Math.min(maxIndex, prev + 3)))
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-[#07C59A] text-gray-800 hover:text-white p-4 rounded-full shadow-lg transition-all duration-300 z-10"
                aria-label="Siguiente"
              >
                <FaChevronRight className="text-xl" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil((t?.testimonials?.reviews?.length || 0) / 3) }).map((_, groupIndex) => (
                  <button
                    key={groupIndex}
                    onClick={() => setCurrentTestimonial(groupIndex * 3)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      Math.floor(currentTestimonial / 3) === groupIndex
                        ? 'bg-[#07C59A] w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Ir a grupo ${groupIndex + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Precios */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.pricing.title}
              </h2>
              <p className="text-xl text-gray-600">
                {t.pricing.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Plan Quincenal */}
              <div className="group relative bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:border-[#07C59A] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t.pricing?.quincenal?.title}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold text-gray-900 leading-none">€{t.pricing?.quincenal?.price}</span>
                    <span className="text-gray-500 text-lg font-normal ml-1">{t.pricing?.quincenal?.period}</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 flex-1">
                  {t.pricing?.quincenal?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-[#07C59A] flex-shrink-0 mt-1" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/${lang}/test`} className="block w-full bg-[#113240] hover:bg-[#052547] text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl mt-auto">
                  {t.pricing?.button}
                </Link>
              </div>

              {/* Plan Mensual - Destacado */}
              <div className="group relative bg-gradient-to-br from-[#113240] via-[#0d2838] to-[#052547] rounded-2xl shadow-2xl p-8 text-white overflow-hidden border-2 border-[#07C59A] transform hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_70px_rgba(7,197,154,0.3)] flex flex-col">
                {/* Badge Recomendado */}
                <div className="absolute top-3 right-3">
                  <div className="bg-[#07C59A] text-white px-4 py-1 rounded-full font-bold text-xs tracking-wide shadow-lg">
                    {t.pricing?.mensual?.badge}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 right-10 w-32 h-32 bg-[#07C59A] rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#07C59A] rounded-full opacity-10 blur-3xl"></div>
                
                <div className="relative z-10 mb-6">
                  <h3 className="text-xl font-bold mb-4">{t.pricing?.mensual?.title}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold leading-none">€{t.pricing?.mensual?.price}</span>
                    <span className="text-white/70 text-lg font-normal ml-1">{t.pricing?.mensual?.period}</span>
                  </div>
                </div>
                
                <div className="relative z-10 space-y-3 mb-8 flex-1">
                  {t.pricing?.mensual?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-[#07C59A] flex-shrink-0 mt-1" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/${lang}/test`} className="relative z-10 block w-full bg-[#07C59A] hover:bg-[#069e7b] text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 shadow-2xl shadow-[#07C59A]/30 hover:shadow-[#07C59A]/50 mt-auto">
                  {t.pricing?.button}
                </Link>
              </div>
            </div>

            {/* Nota inferior */}
            <p className="text-center text-sm text-gray-600 mt-8">
              {t.pricing?.note}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="container-custom max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.faq.title}
              </h2>
              <p className="text-xl text-gray-600">
                {t.faq.subtitle}
              </p>
            </div>

            <div className="space-y-6">
              {/* Question 1 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#07C59A] text-2xl flex-shrink-0">?</span>
                  {t.faq.q1}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a1}</p>
              </div>

              {/* Question 2 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#07C59A] text-2xl flex-shrink-0">?</span>
                  {t.faq.q2}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a2}</p>
              </div>

              {/* Question 3 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#07C59A] text-2xl flex-shrink-0">?</span>
                  {t.faq.q3}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a3}</p>
              </div>

              {/* Question 4 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#07C59A] text-2xl flex-shrink-0">?</span>
                  {t.faq.q4}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a4}</p>
              </div>

              {/* Question 5 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#07C59A] text-2xl flex-shrink-0">?</span>
                  {t.faq.q5}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a5}</p>
              </div>

              {/* Question 6 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#07C59A] text-2xl flex-shrink-0">?</span>
                  {t.faq.q6}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a6}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Datos de interés - IQ Statistics */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container-custom max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.interestData?.title}
              </h2>
              <p className="text-xl text-gray-600">
                {t.interestData?.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* CI promedio por edad */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.interestData?.ageChart}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { age: '< 18 años', iq: 95 },
                    { age: '18-39 años', iq: 105 },
                    { age: '40-59 años', iq: 98 },
                    { age: '60-79 años', iq: 90 },
                    { age: '+80 años', iq: 80 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="age" 
                      tick={{ fill: '#374151', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 120]}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="iq" 
                      fill="#07C59A"
                      radius={[8, 8, 0, 0]}
                      name="CI promedio"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* CI promedio por país */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.interestData?.countryChart}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { country: 'China', flag: '🇨🇳', iq: 105 },
                    { country: 'Estonia', flag: '🇪🇪', iq: 100 },
                    { country: 'Reino Unido', flag: '🇬🇧', iq: 99 },
                    { country: 'Australia', flag: '🇦🇺', iq: 99 },
                    { country: 'Canadá', flag: '🇨🇦', iq: 99 },
                    { country: 'EE. UU.', flag: '🇺🇸', iq: 97 },
                    { country: 'Ucrania', flag: '🇺🇦', iq: 92 },
                    { country: 'Argentina', flag: '🇦🇷', iq: 86 }
                  ].map((item) => (
                    <div key={item.country} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.flag}</span>
                        <span className="font-semibold text-gray-900 text-sm">{item.country}</span>
                      </div>
                      <div className="text-2xl font-bold text-[#07C59A]">
                        {item.iq}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nota informativa */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg max-w-4xl mx-auto">
              <p className="text-sm text-blue-800">
                <strong>📊 </strong>{t.interestData?.note}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-[#07C59A] to-[#069e7b] text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t.cta.subtitle}
            </p>
                <Link href={`/${lang}/test`} className="bg-white text-[#07C59A] hover:bg-gray-100 font-semibold py-4 px-12 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-block">
                  {t.cta.button}
                </Link>
            <p className="mt-6 text-sm opacity-75">
              {t.cta.details}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

