'use client'

import { useEffect, useState } from 'react'
import { FaSearch, FaFilter, FaSync, FaBrain, FaUser, FaChartPie } from 'react-icons/fa'

const TEST_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  iq: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  personality: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  adhd: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  anxiety: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  depression: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  eq: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
}

export default function PurchasesTab() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)
  const [recoverResult, setRecoverResult] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [testTypeFilter, setTestTypeFilter] = useState('all')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)

  useEffect(() => {
    loadPurchases(true)
  }, [search, testTypeFilter])

  useEffect(() => {
    const interval = setInterval(() => loadPurchases(), 60000)
    return () => clearInterval(interval)
  }, [search, testTypeFilter])

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastUpdate.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [lastUpdate])

  const loadPurchases = async (autoRecover = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ _: Date.now().toString() })
      if (search) params.append('search', search)
      if (testTypeFilter !== 'all') params.append('test_type', testTypeFilter)

      const res = await fetch(`/api/admin/purchases?${params}`)
      const data = await res.json()

      if (data.success) {
        setPurchases(data.data)
        setStats(data.stats)
        setTotalRevenue(data.totalRevenue)
        setLastUpdate(new Date())
        setSecondsSinceUpdate(0)

        // Auto-recuperar si no hay compras (puede haber un fallo de registro)
        if (autoRecover && data.data.length === 0) {
          recoverPurchases(false)
        }
      }
    } catch (err) {
      console.error('Error loading purchases:', err)
    } finally {
      setLoading(false)
    }
  }

  const recoverPurchases = async (showFeedback = true) => {
    setRecovering(true)
    setRecoverResult(null)
    try {
      const res = await fetch('/api/admin/recover-purchases')
      const data = await res.json()
      if (data.success) {
        const msg = data.recovered > 0
          ? `✅ ${data.recovered} compra(s) recuperada(s) correctamente`
          : '✅ Tabla sincronizada — no había compras pendientes de recuperar'
        if (showFeedback) setRecoverResult(msg)
        await loadPurchases(false)
      } else {
        if (showFeedback) setRecoverResult(`❌ Error: ${data.error}`)
      }
    } catch (err) {
      if (showFeedback) setRecoverResult('❌ Error de conexión al recuperar compras')
    } finally {
      setRecovering(false)
    }
  }

  const formatTimeSince = (s: number) => {
    if (s < 60) return `hace ${s}s`
    return `hace ${Math.floor(s / 60)}m`
  }

  const getTypeBadge = (testType: string, label: string) => {
    const colors = TEST_TYPE_COLORS[testType] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
        {label}
      </span>
    )
  }

  const iqCount = purchases.filter(p => p.testType === 'iq').length
  const personalityCount = purchases.filter(p => p.testType === 'personality').length
  const otherCount = purchases.filter(p => p.testType !== 'iq' && p.testType !== 'personality').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
          <p className="text-gray-600 mt-1">Historial de pagos realizados por tipo de test</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Última actualización: {formatTimeSince(secondsSinceUpdate)} · Auto-refresh cada 60s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => recoverPurchases(true)}
            disabled={recovering || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <FaSync className={recovering ? 'animate-spin' : ''} />
            Recuperar compras
          </button>
          <button
            onClick={() => loadPurchases(false)}
            disabled={loading}
            className="px-4 py-2 bg-[#07C59A] text-white rounded-lg hover:bg-[#069e7b] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>
      {recoverResult && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${recoverResult.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {recoverResult}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-sm text-gray-500 mb-1">Total Compras</p>
          <p className="text-3xl font-black text-gray-900">{purchases.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><FaBrain className="text-blue-500" /> Test IQ</p>
          <p className="text-3xl font-black text-blue-600">{iqCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><FaUser className="text-purple-500" /> Personalidad</p>
          <p className="text-3xl font-black text-purple-600">{personalityCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-[#07C59A]">
          <p className="text-sm text-gray-500 mb-1">Ingresos Totales</p>
          <p className="text-3xl font-black text-[#07C59A]">€{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Desglose por tipo */}
      {stats.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartPie className="text-[#07C59A]" /> Desglose por tipo de test
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map(s => {
              const colors = TEST_TYPE_COLORS[s.testType] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' }
              return (
                <div key={s.testType} className={`rounded-lg p-4 ${colors.bg}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${colors.text} mb-1`}>{s.testTypeLabel}</p>
                  <p className={`text-2xl font-black ${colors.text}`}>{s.count}</p>
                  <p className={`text-xs ${colors.text} opacity-75`}>€{s.total.toFixed(2)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email, nombre o ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07C59A] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={testTypeFilter}
              onChange={e => setTestTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07C59A] focus:border-transparent appearance-none"
            >
              <option value="all">Todos los tipos</option>
              <option value="iq">Test de IQ</option>
              <option value="personality">Test de Personalidad</option>
              <option value="adhd">Test TDAH</option>
              <option value="anxiety">Test de Ansiedad</option>
              <option value="depression">Test de Depresión</option>
              <option value="eq">Test de IE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#07C59A]" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-16">
            <FaBrain className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron compras</p>
            <p className="text-gray-400 text-sm mt-1">Las compras aparecerán aquí cuando los usuarios realicen pagos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Test</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transacción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map(purchase => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{purchase.name}</p>
                      <p className="text-xs text-gray-500">{purchase.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(purchase.testType, purchase.testTypeLabel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        €{purchase.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{purchase.currency}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                      {purchase.transactionId
                        ? `${purchase.transactionId.substring(0, 20)}…`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
