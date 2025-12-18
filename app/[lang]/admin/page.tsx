'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaSync, FaShieldAlt, FaChartLine, FaUsers, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaDownload, FaRobot, FaCreditCard, FaDollarSign } from 'react-icons/fa'
import MinimalHeader from '@/components/MinimalHeader'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardKPIs {
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

interface DashboardData {
  kpis: DashboardKPIs
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  
  const router = useRouter()

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
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoadingDashboard(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MinimalHeader email={userEmail} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#07C59A] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <MinimalHeader email={userEmail} />
      
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#07C59A] to-[#069e7b] rounded-xl flex items-center justify-center">
                <FaShieldAlt className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">Métricas y estadísticas del negocio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#07C59A] text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaChartLine className="text-2xl" />
                  <h1 className="text-xl font-semibold">Dashboard de Métricas</h1>
                </div>
                <button
                  onClick={loadDashboardData}
                  disabled={loadingDashboard}
                  className="px-4 py-2 bg-white text-[#07C59A] rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSync className={loadingDashboard ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="p-8">
              {loadingDashboard ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#07C59A] mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando métricas...</p>
                </div>
              ) : dashboardData ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    </div>

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
                      <p className="text-sm text-gray-600">Ingresos Mensuales Recurrentes</p>
                    </div>
                  </div>

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
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="revenue" fill="#07C59A" name="Ingresos (€)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
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
  )
}
