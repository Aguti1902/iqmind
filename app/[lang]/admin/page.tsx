'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaCog, FaSave, FaSync, FaCreditCard, FaDollarSign, FaToggleOn, FaToggleOff, FaShieldAlt, FaKey, FaLock, FaExclamationTriangle, FaChartLine, FaUsers, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaDownload, FaRobot } from 'react-icons/fa'
import MinimalHeader from '@/components/MinimalHeader'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Config {
  payment_mode: string
  // Stripe credentials
  stripe_test_publishable_key: string
  stripe_test_secret_key: string
  stripe_test_webhook_secret: string
  stripe_live_publishable_key: string
  stripe_live_secret_key: string
  stripe_live_webhook_secret: string
  stripe_test_price_id_quincenal: string
  stripe_test_price_id_mensual: string
  stripe_live_price_id_quincenal: string
  stripe_live_price_id_mensual: string
  // Pricing
  subscription_price: string
  trial_days: string
  initial_payment: string
  admin_emails: string
}

interface DashboardData {
  kpis: {
    activeSubscriptions: number
    trialingSubscriptions: number
    cancelationsThisMonth: number
    refundsThisMonth: number
    mrr: number
    totalRevenue: number
    totalRefunded: number
    conversionRate: number
    churnRate: number
  }
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number; transactions: number }>
  }
  tables: {
    recentTransactions: Array<any>
    activeSubscriptions: Array<any>
  }
  aiMetrics: {
    totalRequests: number
    refundApproved: number
    refundDenied: number
    cancelationsProcessed: number
    avgResponseTime: number
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [config, setConfig] = useState<Config>({
    payment_mode: 'test',
    // Stripe
    stripe_test_publishable_key: '',
    stripe_test_secret_key: '',
    stripe_test_webhook_secret: '',
    stripe_live_publishable_key: '',
    stripe_live_secret_key: '',
    stripe_live_webhook_secret: '',
    stripe_test_price_id_quincenal: '',
    stripe_test_price_id_mensual: '',
    stripe_live_price_id_quincenal: '',
    stripe_live_price_id_mensual: '',
    // Pricing
    subscription_price: '9.99',
    trial_days: '2',
    initial_payment: '0.50',
    admin_emails: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payment' | 'pricing' | 'admins'>('dashboard')
  const [deploying, setDeploying] = useState(false)
  const [needsManualDeploy, setNeedsManualDeploy] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdmin && activeTab === 'dashboard') {
      loadDashboardData()
    }
  }, [isAdmin, activeTab])

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

  const loadDashboardData = async () => {
    setLoadingDashboard(true)
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      
      if (data.success && data.data) {
        setDashboardData(data.data)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error cargando datos del dashboard' })
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      setMessage({ type: 'error', text: 'Error cargando datos del dashboard' })
    } finally {
      setLoadingDashboard(false)
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#07C59A] mx-auto mb-4"></div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-[#07C59A] to-[#069e7b] rounded-xl flex items-center justify-center">
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

          {/* Proveedor de Pago y Modo - Destacado */}
          <div className="mb-8 space-y-4">
            {/* Banner de Stripe */}
            <div className="p-6 rounded-2xl shadow-lg bg-blue-50 border-4 border-blue-400">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-500">
                  <FaCreditCard className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Proveedor de Pago</h3>
                  <p className="text-lg font-semibold text-blue-800">💳 Stripe</p>
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
            <div className="flex border-b overflow-x-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'dashboard' 
                    ? 'bg-[#07C59A] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaChartLine />
                  Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'payment' 
                    ? 'bg-[#07C59A] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaKey />
                  Credenciales
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'pricing' 
                    ? 'bg-[#07C59A] text-white' 
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
                    ? 'bg-[#07C59A] text-white' 
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
              {/* Tab: Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <FaChartLine className="text-[#07C59A]" />
                      Dashboard de Métricas
                    </h2>
                    <button
                      onClick={loadDashboardData}
                      disabled={loadingDashboard}
                      className="px-4 py-2 bg-[#07C59A] text-white rounded-lg hover:bg-[#069e7b] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaSync className={loadingDashboard ? 'animate-spin' : ''} />
                      Actualizar
                    </button>
                  </div>

                  {loadingDashboard ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#07C59A] mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando métricas...</p>
                    </div>
                  ) : dashboardData ? (
                    <>
                      {/* KPI Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Suscripciones Activas */}
                        <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                              <FaCheckCircle className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              Activas
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">{dashboardData.kpis.activeSubscriptions}</p>
                          <p className="text-sm text-gray-600">Suscripciones Activas</p>
                        </div>

                        {/* En Trial */}
                        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                              <FaUsers className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                              Trial
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">{dashboardData.kpis.trialingSubscriptions}</p>
                          <p className="text-sm text-gray-600">En Período de Prueba</p>
                        </div>

                        {/* Cancelaciones */}
                        <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                              <FaTimesCircle className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                              Este mes
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">{dashboardData.kpis.cancelationsThisMonth}</p>
                          <p className="text-sm text-gray-600">Cancelaciones</p>
                          <p className="text-xs text-orange-600 mt-1">Churn: {dashboardData.kpis.churnRate}%</p>
                        </div>

                        {/* MRR */}
                        <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                              <FaMoneyBillWave className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                              MRR
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">€{dashboardData.kpis.mrr.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Ingresos Recurrentes Mensuales</p>
                        </div>

                        {/* Ingresos Totales */}
                        <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                              <FaDollarSign className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              Total
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">€{dashboardData.kpis.totalRevenue.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Ingresos Totales</p>
                        </div>

                        {/* Reembolsos */}
                        <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                              <FaTimesCircle className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                              Este mes
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">{dashboardData.kpis.refundsThisMonth}</p>
                          <p className="text-sm text-gray-600">Reembolsos Procesados</p>
                          <p className="text-xs text-red-600 mt-1">Total: €{dashboardData.kpis.totalRefunded.toFixed(2)}</p>
                        </div>

                        {/* Tasa de Conversión */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                              <FaChartLine className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                              Conversión
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">{dashboardData.kpis.conversionRate.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">Trial → Pago</p>
                        </div>

                        {/* Agente IA */}
                        <div className="bg-gradient-to-br from-cyan-50 to-white border-2 border-cyan-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                              <FaRobot className="text-2xl text-white" />
                            </div>
                            <span className="text-sm font-semibold text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full">
                              IA
                            </span>
                          </div>
                          <p className="text-4xl font-bold text-gray-900 mb-1">{dashboardData.aiMetrics.cancelationsProcessed}</p>
                          <p className="text-sm text-gray-600">Cancelaciones Automáticas</p>
                        </div>
                      </div>

                      {/* Gráfico de Ingresos Mensuales */}
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <FaChartLine className="text-[#07C59A]" />
                          Ingresos Mensuales (Últimos 12 meses)
                        </h3>
                        <div className="w-full h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.charts.monthlyRevenue}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ingresos']}
                                labelStyle={{ color: '#000' }}
                              />
                              <Legend />
                              <Bar dataKey="revenue" fill="#07C59A" name="Ingresos (€)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Transacciones Recientes */}
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaCreditCard className="text-[#07C59A]" />
                            Transacciones Recientes
                          </h3>
                          <button
                            onClick={() => {
                              const csv = [
                                ['ID', 'Email', 'Monto', 'Fecha', 'Estado'].join(','),
                                ...dashboardData.tables.recentTransactions.map((t: any) => 
                                  [t.id, t.customer_email, t.amount, new Date(t.created).toLocaleDateString(), t.status].join(',')
                                )
                              ].join('\n')
                              const blob = new Blob([csv], { type: 'text/csv' })
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'transacciones.csv'
                              a.click()
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                          >
                            <FaDownload />
                            Exportar CSV
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {dashboardData.tables.recentTransactions.map((transaction: any) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{transaction.id.substring(0, 20)}...</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.customer_email}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">€{transaction.amount.toFixed(2)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.created).toLocaleDateString('es-ES')}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {transaction.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Suscripciones Activas */}
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <FaUsers className="text-[#07C59A]" />
                          Suscripciones Activas (Top 10)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin del Período</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {dashboardData.tables.activeSubscriptions.map((subscription: any) => (
                                <tr key={subscription.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{subscription.id.substring(0, 20)}...</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {subscription.status === 'trialing' ? 'Trial' : 'Activa'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subscription.plan}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">€{subscription.amount.toFixed(2)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(subscription.current_period_end).toLocaleDateString('es-ES')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <FaChartLine className="text-6xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No hay datos disponibles</p>
                      <button
                        onClick={loadDashboardData}
                        className="px-6 py-3 bg-[#07C59A] text-white rounded-lg hover:bg-[#069e7b] transition-colors"
                      >
                        Cargar Datos
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Credenciales de Pago */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaKey className="text-[#07C59A]" />
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Webhook Secret (Test)
                        </label>
                        <input
                          type="password"
                          value={config.stripe_test_webhook_secret}
                          onChange={(e) => setConfig({...config, stripe_test_webhook_secret: e.target.value})}
                          placeholder="whsec_test_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          🔒 Necesaria para verificar webhooks de Stripe
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price ID Quincenal (Test) - €9.99 cada 2 semanas
                        </label>
                        <input
                          type="text"
                          value={config.stripe_test_price_id_quincenal}
                          onChange={(e) => setConfig({...config, stripe_test_price_id_quincenal: e.target.value})}
                          placeholder="price_test_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          💳 Plan quincenal (cada 2 semanas)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price ID Mensual (Test) - €19.99 al mes
                        </label>
                        <input
                          type="text"
                          value={config.stripe_test_price_id_mensual}
                          onChange={(e) => setConfig({...config, stripe_test_price_id_mensual: e.target.value})}
                          placeholder="price_test_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          💳 Plan mensual
                        </p>
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Webhook Secret (Live)
                        </label>
                        <input
                          type="password"
                          value={config.stripe_live_webhook_secret}
                          onChange={(e) => setConfig({...config, stripe_live_webhook_secret: e.target.value})}
                          placeholder="whsec_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          🔒 Necesaria para verificar webhooks de Stripe
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price ID Quincenal (Live) - €9.99 cada 2 semanas
                        </label>
                        <input
                          type="text"
                          value={config.stripe_live_price_id_quincenal}
                          onChange={(e) => setConfig({...config, stripe_live_price_id_quincenal: e.target.value})}
                          placeholder="price_live_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          💳 Plan quincenal (cada 2 semanas)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price ID Mensual (Live) - €19.99 al mes
                        </label>
                        <input
                          type="text"
                          value={config.stripe_live_price_id_mensual}
                          onChange={(e) => setConfig({...config, stripe_live_price_id_mensual: e.target.value})}
                          placeholder="price_live_..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          💳 Plan mensual
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Precios y Textos */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaDollarSign className="text-[#07C59A]" />
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none text-2xl font-bold text-center"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none text-2xl font-bold text-center"
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none text-2xl font-bold text-center"
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
                    <FaShieldAlt className="text-[#07C59A]" />
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#07C59A] focus:outline-none font-mono text-sm"
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
                className="w-full bg-gradient-to-r from-[#07C59A] to-[#069e7b] hover:from-[#069e7b] hover:to-[#04775c] text-white px-8 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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

