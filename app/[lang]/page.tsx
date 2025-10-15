'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { FaBrain, FaChartLine, FaCertificate, FaUserFriends, FaLock, FaCheckCircle } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function Home() {
  const { t, loading, lang } = useTranslations()

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#218B8E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                {t.hero.title} <span className="text-[#218B8E]">{t.hero.titleHighlight}</span>
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
                    <FaCheckCircle className="text-[#218B8E]" />
                    <span>{t.hero.secure}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#218B8E]" />
                    <span>{t.hero.validated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#218B8E]" />
                    <span>{t.hero.instant}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  {/* Card con efecto glassmorphism */}
                  <div className="bg-gradient-to-br from-[#218B8E]/10 to-[#031C43]/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                    {/* Stats destacadas */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-white/90 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-4xl font-bold text-[#218B8E] mb-2">100K+</div>
                        <div className="text-sm text-gray-600">Usuarios</div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-4xl font-bold text-[#031C43] mb-2">20</div>
                        <div className="text-sm text-gray-600">Preguntas</div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-4">
                      <div className="bg-white/90 rounded-xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#218B8E] to-[#1a6f72] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaBrain className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.hero.questions}</h3>
                          <p className="text-gray-600 text-sm">{t.hero.questionsDesc}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/90 rounded-xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#218B8E] to-[#1a6f72] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaChartLine className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.hero.analysis}</h3>
                          <p className="text-gray-600 text-sm">{t.hero.analysisDesc}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/90 rounded-xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#218B8E] to-[#1a6f72] rounded-xl flex items-center justify-center flex-shrink-0">
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
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#218B8E]/20 to-[#031C43]/20 rounded-full blur-3xl -z-10"></div>
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
                <div className="w-20 h-20 bg-[#218B8E] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-4">{t.howItWorks.step1}</h3>
                <p className="text-gray-600">
                  {t.howItWorks.step1Desc}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#218B8E] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-4">{t.howItWorks.step2}</h3>
                <p className="text-gray-600">
                  {t.howItWorks.step2Desc}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#218B8E] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
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
                <FaBrain className="text-4xl text-[#218B8E] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.validated}</h3>
                <p className="text-gray-600">
                  {t.features.validatedDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaUserFriends className="text-4xl text-[#218B8E] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.users}</h3>
                <p className="text-gray-600">
                  {t.features.usersDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaLock className="text-4xl text-[#218B8E] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.secure}</h3>
                <p className="text-gray-600">
                  {t.features.secureDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaChartLine className="text-4xl text-[#218B8E] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.analysis}</h3>
                <p className="text-gray-600">
                  {t.features.analysisDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaCertificate className="text-4xl text-[#218B8E] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.certificate}</h3>
                <p className="text-gray-600">
                  {t.features.certificateDesc}
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <FaCheckCircle className="text-4xl text-[#218B8E] mb-4" />
                <h3 className="text-xl font-semibold mb-3">{t.features.instant}</h3>
                <p className="text-gray-600">
                  {t.features.instantDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.testimonials.title}
              </h2>
              <p className="text-xl text-gray-600">
                {t.testimonials.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                    MG
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{t.test.testimonial1Name}</h4>
                    <div className="text-yellow-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "{t.test.testimonial1Text}"
                </p>
              </div>

              <div className="card">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                    JL
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{t.test.testimonial2Name}</h4>
                    <div className="text-yellow-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "{t.test.testimonial2Text}"
                </p>
              </div>

              <div className="card">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#e6f5f5] rounded-full flex items-center justify-center text-[#218B8E] font-bold">
                    AP
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{t.test.testimonial3Name}</h4>
                    <div className="text-yellow-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "{t.test.testimonial3Text}"
                </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Plan Inicial */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#218B8E]">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.pricing.initialPayment}</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-[#218B8E]">{t.pricing.initialPrice}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{t.pricing.initialDesc}</p>
                  
                  {/* Aviso importante */}
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>{t.notices.importantTitle}</strong> {t.notices.importantMessage}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span className="text-gray-700">{t.pricing.initialFeature1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span className="text-gray-700">{t.pricing.initialFeature2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span className="text-gray-700">{t.pricing.initialFeature3}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span className="text-gray-700">{t.pricing.initialFeature4}</span>
                  </li>
                </ul>

                <Link href={`/${lang}/test`} className="block w-full bg-[#218B8E] hover:bg-[#1a6f72] text-white font-semibold py-4 px-6 rounded-lg text-center transition-all duration-200 shadow-lg hover:shadow-xl">
                  {t.pricing.button}
                </Link>
              </div>

              {/* Plan Premium */}
              <div className="bg-gradient-to-br from-[#031C43] to-[#052547] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{t.pricing.subscription}</h3>
                  
                  {/* Badge debajo del título */}
                  <div className="inline-block bg-[#218B8E] text-white px-4 py-1 rounded-full text-sm font-semibold mb-3">
                    {t.pricing.cancelAnytime}
                  </div>
                  
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">{t.pricing.subscriptionPrice}</span>
                    <span className="text-xl opacity-80">{t.pricing.subscriptionPeriod}</span>
                  </div>
                  <p className="text-white/80 mt-2">{t.pricing.subscriptionDesc}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span>{t.pricing.subscriptionFeature1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span>{t.pricing.subscriptionFeature2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span>{t.pricing.subscriptionFeature3}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaCheckCircle className="text-[#218B8E] flex-shrink-0" />
                    <span>{t.pricing.subscriptionFeature4}</span>
                  </li>
                </ul>

                <Link href={`/${lang}/test`} className="block w-full bg-white text-[#031C43] hover:bg-gray-100 font-semibold py-4 px-6 rounded-lg text-center transition-all duration-200 shadow-lg hover:shadow-xl">
                  {t.pricing.button}
                </Link>
              </div>
            </div>
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
                  <span className="text-[#218B8E] text-2xl flex-shrink-0">?</span>
                  {t.faq.q1}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a1}</p>
              </div>

              {/* Question 2 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#218B8E] text-2xl flex-shrink-0">?</span>
                  {t.faq.q2}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a2}</p>
              </div>

              {/* Question 3 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#218B8E] text-2xl flex-shrink-0">?</span>
                  {t.faq.q3}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a3}</p>
              </div>

              {/* Question 4 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#218B8E] text-2xl flex-shrink-0">?</span>
                  {t.faq.q4}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a4}</p>
              </div>

              {/* Question 5 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#218B8E] text-2xl flex-shrink-0">?</span>
                  {t.faq.q5}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a5}</p>
              </div>

              {/* Question 6 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <span className="text-[#218B8E] text-2xl flex-shrink-0">?</span>
                  {t.faq.q6}
                </h3>
                <p className="text-gray-600 ml-8">{t.faq.a6}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-[#218B8E] to-[#1a6f72] text-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t.cta.subtitle}
            </p>
                <Link href={`/${lang}/test`} className="bg-white text-[#218B8E] hover:bg-gray-100 font-semibold py-4 px-12 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-block">
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

