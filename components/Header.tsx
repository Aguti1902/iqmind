'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import LanguageSelector from './LanguageSelector'
import { useTranslations } from '@/hooks/useTranslations'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, lang } = useTranslations()

  if (!t) return null

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo IQmind */}
          <Link href={`/${lang}`} className="flex items-center">
            <img src="/images/LOGO2.svg" alt="IQmind" className="h-8 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href={`/${lang}/#como-funciona`} className="text-gray-700 hover:text-[#218B8E] transition">
              {t.nav.howItWorks}
            </Link>
            <Link href={`/${lang}/#testimonios`} className="text-gray-700 hover:text-[#218B8E] transition">
              {t.nav.testimonials}
            </Link>
            <Link href={`/${lang}/cancelar-suscripcion`} className="text-gray-700 hover:text-[#218B8E] transition">
              {t.nav.help}
            </Link>
            <LanguageSelector />
            <Link href={`/${lang}/test`} className="bg-[#031C43] hover:bg-[#052547] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              {t.nav.startTest}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              href={`/${lang}/#como-funciona`}
              className="block text-gray-700 hover:text-[#218B8E] transition"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              href={`/${lang}/#testimonios`}
              className="block text-gray-700 hover:text-[#218B8E] transition"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.testimonials}
            </Link>
            <Link
              href={`/${lang}/cancelar-suscripcion`}
              className="block text-gray-700 hover:text-[#218B8E] transition"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.help}
            </Link>
            
            {/* Selector de Idiomas en Móvil */}
            <div className="pt-2 pb-2 border-t border-gray-200">
              <LanguageSelector />
            </div>
            
            <Link
              href={`/${lang}/test`}
              className="block bg-[#031C43] hover:bg-[#052547] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.nav.startTest}
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
