'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface User {
  id: string
  email: string
  userName: string
  iq?: number
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired'
  subscriptionId?: string
  trialEndDate?: string
  accessUntil?: string
  createdAt: string
  lastLogin?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string || 'es'

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')

    if (!token || !userData) {
      router.push(`/${lang}/login`)
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push(`/${lang}/login`)
    } finally {
      setLoading(false)
    }
  }, [router, lang])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    router.push(`/${lang}/login`)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setPasswordLoading(true)
    setPasswordMessage('')

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordMessage('Contraseña cambiada exitosamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowChangePassword(false)
      } else {
        setPasswordMessage(data.error || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      setPasswordMessage('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'trial': return 'Prueba Gratuita'
      case 'active': return 'Activa'
      case 'cancelled': return 'Cancelada'
      case 'expired': return 'Expirada'
      default: return status
    }
  }

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Hola, {user.userName}! 👋
                </h1>
                <p className="text-gray-600">
                  Bienvenido a tu dashboard personal de IQmind
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información del Usuario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resultado del Test */}
              {user.iq && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    🧠 Tu Resultado de CI
                  </h2>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary-600 mb-2">
                      {user.iq}
                    </div>
                    <p className="text-gray-600">
                      Puntuación de Coeficiente Intelectual
                    </p>
                  </div>
                </div>
              )}

              {/* Estado de Suscripción */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📋 Estado de Suscripción
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionStatusColor(user.subscriptionStatus)}`}>
                      {getSubscriptionStatusText(user.subscriptionStatus)}
                    </span>
                  </div>
                  
                  {user.trialEndDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trial termina:</span>
                      <span className="text-gray-900">
                        {new Date(user.trialEndDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                  
                  {user.accessUntil && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Acceso hasta:</span>
                      <span className="text-gray-900">
                        {new Date(user.accessUntil).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Cuenta */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  👤 Información de la Cuenta
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="text-gray-900">{user.userName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Miembro desde:</span>
                    <span className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  
                  {user.lastLogin && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Último acceso:</span>
                      <span className="text-gray-900">
                        {new Date(user.lastLogin).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              {/* Cambiar Contraseña */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔒 Seguridad
                </h3>
                
                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Cambiar Contraseña
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar contraseña
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {passwordMessage && (
                      <div className={`text-sm ${
                        passwordMessage.includes('exitosamente') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {passwordMessage}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {passwordLoading ? 'Cambiando...' : 'Cambiar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false)
                          setCurrentPassword('')
                          setNewPassword('')
                          setConfirmPassword('')
                          setPasswordMessage('')
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ⚡ Acciones Rápidas
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push(`/${lang}/resultado`)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Ver Resultado Completo
                  </button>
                  <button 
                    onClick={() => router.push(`/${lang}/cancelar-suscripcion`)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Gestionar Suscripción
                  </button>
                  <button 
                    onClick={() => router.push(`/${lang}/contacto`)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Contactar Soporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

