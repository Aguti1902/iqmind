'use client'

import Link from 'next/link'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function Footer() {
  const { t, lang } = useTranslations()

  if (!t) return null

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <img src="/images/LOGO2BLANCO.svg" alt="IQmind" className="h-8 w-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {t.footer.description}
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.links}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}`} className="hover:text-primary-400 transition">
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/test`} className="hover:text-primary-400 transition">
                  {t.footer.startTest}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/cancelar-suscripcion`} className="text-red-400 hover:text-red-300 transition">
                  {t.footer.cancelPlan}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contacto`} className="hover:text-primary-400 transition">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/login`} className="hover:text-primary-400 transition">
                  {t.footer.login || 'Iniciar Sesión'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/terminos`} className="hover:text-primary-400 transition">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacidad`} className="hover:text-primary-400 transition">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/reembolso`} className="hover:text-primary-400 transition">
                  {t.footer.refund}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} IQmind. {t.footer.allRightsReserved}.</p>
        </div>
      </div>
    </footer>
  )
}

