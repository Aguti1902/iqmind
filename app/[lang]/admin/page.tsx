'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaCog, FaSave, FaSync, FaCreditCard, FaDollarSign, FaToggleOn, FaToggleOff, FaShieldAlt, FaKey, FaLock, FaExclamationTriangle } from 'react-icons/fa'
import MinimalHeader from '@/components/MinimalHeader'

interface Config {
  stripe_mode: string
  stripe_test_publishable_key: string
  stripe_test_secret_key: string
  stripe_live_publishable_key: string
  stripe_live_secret_key: string
  stripe_test_price_id: string
  stripe_live_price_id: string
  subscription_price: string
  trial_days: string
  initial_payment: string
  admin_emails: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [config, setConfig] = useState<Config>({
    stripe_mode: 'test',
    stripe_test_publishable_key: '',
    stripe_test_secret_key: '',
    stripe_live_publishable_key: '',
    stripe_live_secret_key: '',
    stripe_test_price_id: '',
    stripe_live_price_id: '',
    subscription_price: '9.99',
    trial_days: '7',
    initial_payment: '0.50',
    admin_emails: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'stripe' | 'pricing' | 'admins'>('stripe')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      
      if (!data.isAdmin) {
        // Si no es admin, redirigir al login
        router.push('/es/login')
        return
      }
      
      setIsAdmin(true)
      setUserEmail(data.email || '')
      loadConfig()
    } catch (error) {
      console.error('Error verificando admin:', error)
      router.push('/es/login')
    }
  }

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config')
      const data = await response.json()
      
      if (data.config) {
        setConfig(data.config)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error cargando configuración:', error)
      setMessage({ type: 'error', text: 'Error cargando configuración' })
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        let successMessage = '✅ Configuración guardada exitosamente'
        if (data.vercelStatus) {
          successMessage += `\n\n${data.vercelStatus}`
        }
        if (data.note) {
          successMessage += `\n\n💡 ${data.note}`
        }
        
        setMessage({ type: 'success', text: successMessage })
        setTimeout(() => setMessage(null), 8000) // Más tiempo para leer el mensaje
      } else {
        setMessage({ type: 'error', text: data.error || 'Error guardando configuración' })
      }
    } catch (error) {
      console.error('Error guardando configuración:', error)
      setMessage({ type: 'error', text: 'Error guardando configuración' })
    } finally {
      setSaving(false)
    }
  }

  const toggleStripeMode = () => {
    setConfig({
      ...config,
      stripe_mode: config.stripe_mode === 'test' ? 'production' : 'test'
    })
  }

  if (loading) {
    return (
      <>
        <MinimalHeader email={userEmail} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#218B8E] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando panel de administración...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MinimalHeader email={userEmail} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#218B8E] to-[#1a6f72] rounded-xl flex items-center justify-center">
                <FaShieldAlt className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">Gestiona la configuración de tu sitio web</p>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' ? 'bg-green-50 border-2 border-green-300 text-green-800' : 'bg-red-50 border-2 border-red-300 text-red-800'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
                <div className="flex-1">
                  {message.text.split('\n').map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-semibold' : 'text-sm mt-1'}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modo Stripe - Destacado */}
          <div className={`mb-8 p-6 rounded-2xl shadow-lg ${
            config.stripe_mode === 'test' ? 'bg-yellow-50 border-4 border-yellow-400' : 'bg-green-50 border-4 border-green-400'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  config.stripe_mode === 'test' ? 'bg-yellow-400' : 'bg-green-500'
                }`}>
                  <FaCreditCard className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Modo de Stripe</h3>
                  <p className={`text-lg font-semibold ${
                    config.stripe_mode === 'test' ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {config.stripe_mode === 'test' ? '🧪 Modo Test (Desarrollo)' : '🚀 Modo Producción (Live)'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleStripeMode}
                className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 ${
                  config.stripe_mode === 'test' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {config.stripe_mode === 'test' ? <FaToggleOff className="text-2xl" /> : <FaToggleOn className="text-2xl" />}
                Cambiar a {config.stripe_mode === 'test' ? 'Producción' : 'Test'}
              </button>
            </div>
            <div className="mt-4 p-4 bg-white/50 rounded-xl">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-600 mt-1" />
                <p className="text-sm text-gray-700">
                  <strong>Importante:</strong> En modo test, todas las transacciones serán simuladas. 
                  Cambia a producción solo cuando estés listo para aceptar pagos reales.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('stripe')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'stripe' 
                    ? 'bg-[#218B8E] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaKey />
                  Credenciales Stripe
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'pricing' 
                    ? 'bg-[#218B8E] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaDollarSign />
                  Precios y Textos
                </div>
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'admins' 
                    ? 'bg-[#218B8E] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaShieldAlt />
                  Administradores
                </div>
              </button>
            </div>

            <div className="p-8">
              {/* Tab: Credenciales Stripe */}
              {activeTab === 'stripe' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaKey className="text-[#218B8E]" />
                    Credenciales de Stripe
                  </h2>
                  
                  {/* Claves de Test */}
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🧪 Claves de Test (Desarrollo)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Publishable Key (Test)
                        </label>
                        <input
                          type="text"
                          value={config.stripe_test_publishable_key}
                          onChange={(e) => setConfig({...config, stripe_test_publishable_key: e.target.value})}
                          placeholder="pk_test_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Secret Key (Test)
                        </label>
                        <input
                          type="password"
                          value={config.stripe_test_secret_key}
                          onChange={(e) => setConfig({...config, stripe_test_secret_key: e.target.value})}
                          placeholder="sk_test_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price ID (Test)
                        </label>
                        <input
                          type="text"
                          value={config.stripe_test_price_id}
                          onChange={(e) => setConfig({...config, stripe_test_price_id: e.target.value})}
                          placeholder="price_test_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Claves de Producción */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🚀 Claves de Producción (Live)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Publishable Key (Live)
                        </label>
                        <input
                          type="text"
                          value={config.stripe_live_publishable_key}
                          onChange={(e) => setConfig({...config, stripe_live_publishable_key: e.target.value})}
                          placeholder="pk_live_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Secret Key (Live)
                        </label>
                        <input
                          type="password"
                          value={config.stripe_live_secret_key}
                          onChange={(e) => setConfig({...config, stripe_live_secret_key: e.target.value})}
                          placeholder="sk_live_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price ID (Live)
                        </label>
                        <input
                          type="text"
                          value={config.stripe_live_price_id}
                          onChange={(e) => setConfig({...config, stripe_live_price_id: e.target.value})}
                          placeholder="price_live_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Precios y Textos */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaDollarSign className="text-[#218B8E]" />
                    Configuración de Precios
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pago Inicial (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.initial_payment}
                        onChange={(e) => setConfig({...config, initial_payment: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none text-2xl font-bold text-center"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Cobro único para ver resultados
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Suscripción Mensual (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.subscription_price}
                        onChange={(e) => setConfig({...config, subscription_price: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none text-2xl font-bold text-center"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Cobro mensual recurrente
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Días de Prueba
                      </label>
                      <input
                        type="number"
                        value={config.trial_days}
                        onChange={(e) => setConfig({...config, trial_days: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none text-2xl font-bold text-center"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Período de prueba gratuita
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="text-blue-600 mt-1 text-xl" />
                      <div>
                        <h4 className="font-bold text-blue-900 mb-2">Nota Importante</h4>
                        <p className="text-sm text-blue-800">
                          Los precios aquí configurados se muestran en la interfaz de usuario. 
                          Asegúrate de que coincidan con los precios configurados en tu cuenta de Stripe.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Administradores */}
              {activeTab === 'admins' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaShieldAlt className="text-[#218B8E]" />
                    Gestión de Administradores
                  </h2>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Emails de Administradores
                    </label>
                    <textarea
                      value={config.admin_emails}
                      onChange={(e) => setConfig({...config, admin_emails: e.target.value})}
                      placeholder="admin@ejemplo.com, otro@ejemplo.com"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Separa múltiples emails con comas. Estos usuarios tendrán acceso al panel de administración.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <FaLock className="text-yellow-600 mt-1 text-xl" />
                      <div>
                        <h4 className="font-bold text-yellow-900 mb-2">Seguridad</h4>
                        <p className="text-sm text-yellow-800">
                          Solo los usuarios con emails en esta lista podrán acceder al panel de administración.
                          Asegúrate de incluir tu propio email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de Guardar - Fijo en la parte inferior */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#218B8E] to-[#1a6f72] hover:from-[#1a6f72] hover:to-[#145356] text-white px-8 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Guardando cambios...
                </>
              ) : (
                <>
                  <FaSave className="text-2xl" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

