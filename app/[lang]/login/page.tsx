'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')
  
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string || 'es'
  const { t } = useTranslations()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
        // Redirigir al dashboard
        router.push(`/${lang}/dashboard`)
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setForgotPasswordMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setForgotPasswordMessage('Se ha enviado un enlace de recuperación a tu email.')
        setShowForgotPassword(false)
        setForgotPasswordEmail('')
      } else {
        setForgotPasswordMessage(data.error || 'Error al enviar el email de recuperación.')
      }
    } catch (error) {
      setForgotPasswordMessage('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  if (!t) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.login?.title || 'Iniciar Sesión'}
            </h1>
            <p className="text-gray-600">
              {t.login?.subtitle || 'Accede a tu dashboard personal'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {forgotPasswordMessage && (
            <div className={`border px-4 py-3 rounded mb-4 ${
              forgotPasswordMessage.includes('enviado') 
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {forgotPasswordMessage}
            </div>
          )}

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.login?.email || 'Email'}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.login?.emailPlaceholder || 'tu@email.com'}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.login?.password || 'Contraseña'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.login?.passwordPlaceholder || 'Tu contraseña'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.login?.loggingIn || 'Iniciando sesión...'}
                  </div>
                ) : (
                  t.login?.loginButton || 'Iniciar Sesión'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  {t.login?.forgotPassword || '¿Has olvidado tu contraseña?'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.login?.forgotEmailLabel || 'Email'}
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.login?.emailPlaceholder || 'tu@email.com'}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotPasswordLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t.login?.sending || 'Enviando...'}
                    </div>
                  ) : (
                    t.login?.sendReset || 'Enviar enlace'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordEmail('')
                    setForgotPasswordMessage('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {t.login?.cancel || 'Cancelar'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t.login?.noAccount || '¿No tienes cuenta?'}{' '}
              <span className="text-primary-600">
                {t.login?.contactSupport || 'Contacta con soporte'}
              </span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
