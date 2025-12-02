'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa'
import LanguageSelector from './LanguageSelector'
import { useTranslations } from '@/hooks/useTranslations'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { t, lang } = useTranslations()
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('auth_token')
    setIsLoggedIn(!!token)

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.profile-dropdown')) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isProfileMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setIsLoggedIn(false)
    router.push(`/${lang}`)
  }

  if (!t) return null

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo MindMetric */}
          <Link href={`/${lang}`} className="flex items-center">
            <img src="/images/MINDMETRIC/Logo.png" alt="MindMetric" className="h-10 md:h-12 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <LanguageSelector />
            
            {isLoggedIn ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 bg-[#113240] hover:bg-[#052547] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaUser />
                  <span>{t.nav.profile || 'Mi Perfil'}</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <Link
                      href={`/${lang}/cuenta`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t.nav.myAccount || 'Mi Cuenta'}
                    </Link>
                    <Link
                      href={`/${lang}/tests`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t.nav.myTests || 'Mis Tests'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <FaSignOutAlt />
                      {t.nav.logout || 'Cerrar Sesión'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${lang}/test`} className="bg-[#113240] hover:bg-[#052547] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                {t.nav.startTest}
              </Link>
            )}
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
            {/* Selector de Idiomas en Móvil */}
            <div className="pb-2 border-b border-gray-200">
              <LanguageSelector />
            </div>
            
            {isLoggedIn ? (
              <>
                <Link
                  href={`/${lang}/cuenta`}
                  className="block text-gray-700 hover:text-[#07C59A] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.nav.myAccount || 'Mi Cuenta'}
                </Link>
                <Link
                  href={`/${lang}/tests`}
                  className="block text-gray-700 hover:text-[#07C59A] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.nav.myTests || 'Mis Tests'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left text-red-600 hover:text-red-700 transition flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  {t.nav.logout || 'Cerrar Sesión'}
                </button>
              </>
            ) : (
              <Link
                href={`/${lang}/test`}
                className="block bg-[#113240] hover:bg-[#052547] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.startTest}
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
