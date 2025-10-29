'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaCog, FaSave, FaSync, FaCreditCard, FaDollarSign, FaToggleOn, FaToggleOff, FaShieldAlt, FaKey, FaLock, FaExclamationTriangle } from 'react-icons/fa'
import MinimalHeader from '@/components/MinimalHeader'

interface Config {
  payment_provider: string
  payment_mode: string
  // FastSpring credentials
  fastspring_storefront: string
  fastspring_api_username: string
  fastspring_api_password: string
  fastspring_webhook_secret: string
  fastspring_product_path: string
  // Pricing
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
    payment_provider: 'fastspring',
    payment_mode: 'production',
    // FastSpring
    fastspring_storefront: '',
    fastspring_api_username: '',
    fastspring_api_password: '',
    fastspring_webhook_secret: '',
    fastspring_product_path: 'iqmind-premium-access',
    // Pricing
    subscription_price: '9.99',
    trial_days: '2',
    initial_payment: '0.50',
    admin_emails: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'payment' | 'pricing' | 'admins'>('payment')
  const [deploying, setDeploying] = useState(false)
  const [needsManualDeploy, setNeedsManualDeploy] = useState(false)

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
        
        // Detectar si se necesita deploy manual
        if (data.needsManualDeploy) {
          setNeedsManualDeploy(true)
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

  const togglePaymentMode = () => {
    setConfig({
      ...config,
      payment_mode: config.payment_mode === 'test' ? 'production' : 'test'
    })
  }

  // FastSpring es el único proveedor ahora
  // const togglePaymentProvider = () => {
  //   setConfig({
  //     ...config,
  //     payment_provider: 'fastspring'
  //   })
  // }

  const handleDeploy = async () => {
    setDeploying(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/admin/deploy', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: `${data.message}\n\n${data.note || ''}` })
        setNeedsManualDeploy(false)
        setTimeout(() => setMessage(null), 8000)
      } else {
        setMessage({ type: 'error', text: `${data.error}\n\n${data.fallback || ''}` })
      }
    } catch (error) {
      console.error('Error haciendo deploy:', error)
      setMessage({ type: 'error', text: 'Error iniciando deploy. Ve a Vercel Dashboard y haz Redeploy manualmente.' })
    } finally {
      setDeploying(false)
    }
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#218B8E] to-[#1a6f72] rounded-xl flex items-center justify-center">
                  <FaShieldAlt className="text-3xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-gray-600">Gestiona la configuración de tu sitio web</p>
                </div>
              </div>
              <a
                href="/es/admin/disputes"
                className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <FaExclamationTriangle className="text-xl" />
                Monitor de Disputas
              </a>
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

          {/* Proveedor de Pago y Modo - Destacado */}
          <div className="mb-8 space-y-4">
            {/* Proveedor de Pago - FastSpring (Fijo) */}
            <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-4 border-blue-400">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <FaCreditCard className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Proveedor de Pago</h3>
                  <p className="text-lg font-semibold text-blue-800">
                    ⚡ FastSpring (Merchant of Record)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestión automática de impuestos, disputas y compliance global
                  </p>
                </div>
              </div>
            </div>

            {/* Selector de Modo */}
            <div className={`p-6 rounded-2xl shadow-lg ${
              config.payment_mode === 'test' ? 'bg-orange-50 border-4 border-orange-400' : 'bg-green-50 border-4 border-green-400'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    config.payment_mode === 'test' ? 'bg-orange-400' : 'bg-green-500'
                  }`}>
                    <FaCog className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Modo de Operación</h3>
                    <p className={`text-lg font-semibold ${
                      config.payment_mode === 'test' ? 'text-orange-800' : 'text-green-800'
                    }`}>
                      {config.payment_mode === 'test' ? '🧪 Modo Test (Desarrollo)' : '🚀 Modo Producción (Live)'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={togglePaymentMode}
                  className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 ${
                    config.payment_mode === 'test' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {config.payment_mode === 'test' ? <FaToggleOff className="text-2xl" /> : <FaToggleOn className="text-2xl" />}
                  Cambiar a {config.payment_mode === 'test' ? 'Producción' : 'Test'}
                </button>
              </div>
              <div className="mt-4 p-4 bg-white/50 rounded-xl">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-orange-600 mt-1" />
                  <p className="text-sm text-gray-700">
                    <strong>Importante:</strong> En modo test, todas las transacciones serán simuladas. 
                    Cambia a producción solo cuando estés listo para aceptar pagos reales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'payment' 
                    ? 'bg-[#218B8E] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaKey />
                  Credenciales de Pago
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
              {/* Tab: Credenciales de Pago */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaKey className="text-[#218B8E]" />
                    Credenciales de FastSpring
                  </h2>
                  
                  {/* FastSpring Credentials */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ⚡ Credenciales de FastSpring
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Storefront URL
                        </label>
                        <input
                          type="text"
                          value={config.fastspring_storefront}
                          onChange={(e) => setConfig({...config, fastspring_storefront: e.target.value})}
                          placeholder="tu-store.onfastspring.com/popup-storefront"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          🌐 URL de tu storefront en FastSpring
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          API Username
                        </label>
                        <input
                          type="text"
                          value={config.fastspring_api_username}
                          onChange={(e) => setConfig({...config, fastspring_api_username: e.target.value})}
                          placeholder="tu_api_username"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          🔑 Username de API (FastSpring Dashboard → Integrations → API Credentials)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          API Password
                        </label>
                        <input
                          type="password"
                          value={config.fastspring_api_password}
                          onChange={(e) => setConfig({...config, fastspring_api_password: e.target.value})}
                          placeholder="••••••••••••••••"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          🔒 Password de API (se guarda encriptado)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Webhook Secret (Opcional)
                        </label>
                        <input
                          type="password"
                          value={config.fastspring_webhook_secret}
                          onChange={(e) => setConfig({...config, fastspring_webhook_secret: e.target.value})}
                          placeholder="webhook_secret_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          🔐 Para verificar webhooks con HMAC (opcional pero recomendado)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Product Path
                        </label>
                        <input
                          type="text"
                          value={config.fastspring_product_path}
                          onChange={(e) => setConfig({...config, fastspring_product_path: e.target.value})}
                          placeholder="iqmind-premium-access"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#218B8E] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          📦 Path del producto en FastSpring (debe coincidir con el producto creado)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información de configuración */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="text-blue-600 mt-1 text-xl flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-blue-900 mb-2">Cómo Obtener tus Credenciales</h4>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                          <li><strong>Storefront URL:</strong> FastSpring Dashboard → Storefronts → Tu storefront → Copy URL</li>
                          <li><strong>API Credentials:</strong> FastSpring Dashboard → Integrations → API Credentials → Create New</li>
                          <li><strong>Product Path:</strong> FastSpring Dashboard → Products → Ver el "Product Path" de tu producto</li>
                          <li><strong>Webhook Secret:</strong> FastSpring Dashboard → Integrations → Webhooks → Enable HMAC</li>
                        </ul>
                        <div className="mt-4 p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-700">
                            💡 <strong>Tip:</strong> Asegúrate de configurar el webhook en FastSpring apuntando a:<br/>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://iqmind.mobi/api/fastspring-webhook</code>
                          </p>
                        </div>
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
                          Asegúrate de que coincidan con los precios configurados en tu producto de FastSpring.
                        </p>
                        <p className="text-sm text-blue-800 mt-2">
                          <strong>Configuración en FastSpring:</strong><br/>
                          - Setup Fee: €{config.initial_payment}<br/>
                          - Trial: {config.trial_days} días<br/>
                          - Recurring: €{config.subscription_price}/mes
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

          {/* Botones de acción - Fijo en la parte inferior */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <div className="space-y-4">
              {/* Botón de Guardar */}
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

              {/* Botón de Deploy Manual (solo se muestra si es necesario) */}
              {needsManualDeploy && (
                <button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
                >
                  {deploying ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Desplegando...
                    </>
                  ) : (
                    <>
                      <FaSync className="text-2xl" />
                      🚀 Deploy Manual - Aplicar Cambios
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

