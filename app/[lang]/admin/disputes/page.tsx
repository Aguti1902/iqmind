'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaExclamationTriangle, FaCheckCircle, FaSync, FaChartLine } from 'react-icons/fa'

interface DisputeStats {
  totalDisputes: number
  openDisputes: number
  totalOrders: number
  disputeRatio: number
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical'
  periodDays: number
}

interface Dispute {
  id: string
  order: string
  customerEmail: string
  amount: number
  currency: string
  reason: string
  status: string
  createdAt: string
  resolvedAt?: string
}

export default function DisputesPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DisputeStats | null>(null)
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [periodDays, setPeriodDays] = useState(30)
  const [userEmail, setUserEmail] = useState('')

  // Verificar autenticación al montar
  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    if (!email) {
      console.warn('No autenticado, redirigiendo a login')
      router.push('/es/login')
      return
    }
    setUserEmail(email)
  }, [])

  useEffect(() => {
    loadDisputes()
  }, [periodDays])

  const loadDisputes = async () => {
    setLoading(true)
    try {
      // Verificar que hay email de usuario
      const email = localStorage.getItem('userEmail')
      if (!email) {
        console.warn('No hay email de usuario, redirigiendo...')
        router.push('/es/login')
        return
      }

      const response = await fetch(`/api/admin/disputes?days=${periodDays}`, {
        headers: {
          'x-user-email': email
        }
      })

      if (response.status === 401 || response.status === 403) {
        console.warn('No autorizado, redirigiendo a login')
        router.push('/es/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setDisputes(data.disputes)
      } else {
        console.error('Error cargando disputas:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error data:', errorData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const forceCheck = async () => {
    setChecking(true)
    try {
      const response = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: {
          'x-user-email': localStorage.getItem('userEmail') || ''
        }
      })

      if (response.ok) {
        await loadDisputes()
        alert('✅ Check de disputas completado')
      } else {
        alert('❌ Error al verificar disputas')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al verificar disputas')
    } finally {
      setChecking(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600'
      case 'danger': return 'bg-orange-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getRiskEmoji = (level: string) => {
    switch (level) {
      case 'critical': return '🔴'
      case 'danger': return '🟠'
      case 'warning': return '🟡'
      default: return '🟢'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando disputas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaExclamationTriangle className="text-red-600" />
              Monitor de Disputas
            </h1>
            <p className="text-gray-600 mt-2">
              Mantén el ratio por debajo del 0.75% para evitar problemas con FastSpring
            </p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
            
            <button
              onClick={forceCheck}
              disabled={checking}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <FaSync className={checking ? 'animate-spin' : ''} />
              {checking ? 'Verificando...' : 'Verificar Ahora'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            {/* Alert Banner si el riesgo es alto */}
            {(stats.riskLevel === 'danger' || stats.riskLevel === 'critical') && (
              <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <FaExclamationTriangle className="text-red-600 text-3xl mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-red-900">
                      ⚠️ ALERTA: Nivel de Riesgo {stats.riskLevel === 'critical' ? 'CRÍTICO' : 'ALTO'}
                    </h3>
                    <p className="text-red-800 mt-2">
                      Tu ratio de disputas está en <strong>{stats.disputeRatio.toFixed(2)}%</strong>.
                      {stats.riskLevel === 'critical' && ' FastSpring puede cerrar tu cuenta si superas el 1%.'}
                    </p>
                    <ul className="mt-4 list-disc list-inside text-red-800 space-y-1">
                      <li>Contacta a los clientes con disputas inmediatamente</li>
                      <li>Ofrece reembolsos antes de que escalen</li>
                      <li>Revisa la descripción del producto y políticas</li>
                      <li>Mejora la comunicación post-compra</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Órdenes */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">Total Órdenes</h3>
                  <FaChartLine className="text-purple-500 text-xl" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-gray-500 mt-2">Últimos {stats.periodDays} días</p>
              </div>

              {/* Total Disputas */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">Total Disputas</h3>
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
                <p className="text-4xl font-bold text-red-600">{stats.totalDisputes}</p>
                <p className="text-sm text-gray-500 mt-2">Últimos {stats.periodDays} días</p>
              </div>

              {/* Disputas Abiertas */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">Disputas Abiertas</h3>
                  <FaSync className="text-orange-500 text-xl" />
                </div>
                <p className="text-4xl font-bold text-orange-600">{stats.openDisputes}</p>
                <p className="text-sm text-gray-500 mt-2">Requieren atención</p>
              </div>

              {/* Ratio de Disputas */}
              <div className={`rounded-xl shadow-lg p-6 text-white ${
                stats.riskLevel === 'critical' ? 'bg-gradient-to-br from-red-600 to-red-800' :
                stats.riskLevel === 'danger' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                stats.riskLevel === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                'bg-gradient-to-br from-green-500 to-green-700'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold opacity-90">Ratio de Disputas</h3>
                  <span className="text-2xl">{getRiskEmoji(stats.riskLevel)}</span>
                </div>
                <p className="text-4xl font-bold">{stats.disputeRatio.toFixed(2)}%</p>
                <p className="text-sm opacity-90 mt-2 uppercase font-semibold">{stats.riskLevel}</p>
              </div>
            </div>
          </>
        )}

        {/* Lista de Disputas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lista de Disputas</h2>
          
          {disputes.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Sin Disputas!
              </h3>
              <p className="text-gray-600">
                No se encontraron disputas en los últimos {periodDays} días. ¡Excelente trabajo!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Orden</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Monto</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Razón</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute) => (
                    <tr key={dispute.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{dispute.order}</td>
                      <td className="py-3 px-4">{dispute.customerEmail}</td>
                      <td className="py-3 px-4 font-semibold">
                        {dispute.amount.toFixed(2)} {dispute.currency}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{dispute.reason}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          dispute.status === 'open' ? 'bg-red-100 text-red-800' :
                          dispute.status === 'won' ? 'bg-green-100 text-green-800' :
                          dispute.status === 'lost' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dispute.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(dispute.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📊 Cómo Mantener un Ratio Saludable
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>✅ <strong>Descripción clara:</strong> Explica bien qué es el servicio y qué incluye</li>
            <li>✅ <strong>Trial transparente:</strong> Deja claro que después del trial se cobra €9.99/mes</li>
            <li>✅ <strong>Cancelación fácil:</strong> Permite cancelar en 2 clicks desde la cuenta</li>
            <li>✅ <strong>Soporte rápido:</strong> Responde en menos de 24 horas</li>
            <li>✅ <strong>Reembolsos preventivos:</strong> Ofrece reembolso antes de que escale a disputa</li>
            <li>✅ <strong>Email de bienvenida:</strong> Explica cómo funciona el servicio y cómo cancelar</li>
          </ul>
        </div>

      </div>
    </div>
  )
}

