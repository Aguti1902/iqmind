'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaCog, FaSave, FaSync, FaCreditCard, FaDollarSign, FaToggleOn, FaToggleOff, FaShieldAlt, FaKey, FaLock, FaExclamationTriangle, FaChartLine, FaUsers, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaDownload, FaRobot } from 'react-icons/fa'
import MinimalHeader from '@/components/MinimalHeader'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
  const [userEmail, setUserEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin])

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      
      if (!data.isAdmin) {
        router.push('/es/login')
        return
      }
      
      setIsAdmin(true)
      setUserEmail(data.email || '')
      setLoading(false)
    } catch (error) {
      console.error('Error verificando admin:', error)
      router.push('/es/login')
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

          {/* Dashboard */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#07C59A] text-white px-6 py-4">
              <div className="flex items-center gap-3">
                <FaChartLine className="text-2xl" />
                <h1 className="text-xl font-semibold">Dashboard de Métricas</h1>
              </div>
            </div>

            <div className="p-8">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
