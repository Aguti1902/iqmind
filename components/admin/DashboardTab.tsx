'use client'

import { useEffect, useState } from 'react'
import { FaSync, FaShoppingCart, FaEuroSign, FaUndo, FaUsers, FaClock, FaCheckCircle, FaBrain, FaUser } from 'react-icons/fa'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts'

const TEST_LABELS: Record<string, string> = {
  iq: 'Test IQ',
  personality: 'Personalidad',
  adhd: 'TDAH',
  anxiety: 'Ansiedad',
  depression: 'Depresión',
  eq: 'IE',
}

const TEST_COLORS: Record<string, string> = {
  iq: '#3B82F6',
  personality: '#8B5CF6',
  adhd: '#F97316',
  anxiety: '#EAB308',
  depression: '#EF4444',
  eq: '#10B981',
}

export default function DashboardTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [secondsSince, setSecondsSince] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSince(Math.floor((Date.now() - lastUpdate.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [lastUpdate])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dashboard?_=' + Date.now())
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setLastUpdate(new Date())
        setSecondsSince(0)
      }
    } catch (e) {
      console.error('Error cargando dashboard:', e)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (s: number) => s < 60 ? `hace ${s}s` : `hace ${Math.floor(s / 60)}m`

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#07C59A] mx-auto mb-4" />
          <p className="text-gray-600">Cargando métricas reales de Sipay...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { kpis, charts, tables } = data

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Datos reales de Sipay · Últimas 2 semanas</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Última actualización: {fmt(secondsSince)} · Auto-refresh cada 60s
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-[#07C59A] text-white rounded-lg hover:bg-[#069e7b] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          Actualizar Ahora
        </button>
      </div>

      {/* ── Sipay: últimas 2 semanas ── */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Sipay — Últimas 2 semanas</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-[#07C59A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Compras</p>
              <p className="text-3xl font-black text-gray-900">{kpis.purchases2w}</p>
            </div>
            <FaShoppingCart className="text-3xl text-[#07C59A] opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-3xl font-black text-gray-900">€{kpis.revenue2w.toFixed(2)}</p>
            </div>
            <FaEuroSign className="text-3xl text-green-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Reembolsos</p>
              <p className="text-3xl font-black text-gray-900">{kpis.refunds2w}</p>
              {kpis.refundedAmount2w > 0 && (
                <p className="text-xs text-orange-500">€{kpis.refundedAmount2w.toFixed(2)}</p>
              )}
            </div>
            <FaUndo className="text-3xl text-orange-400 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cancelaciones</p>
              <p className="text-3xl font-black text-gray-900">{kpis.cancelations2w}</p>
            </div>
            <FaClock className="text-3xl text-red-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* ── Totales históricos ── */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Sipay — Totales históricos</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Compras</p>
              <p className="text-3xl font-black text-gray-900">{kpis.totalPurchases}</p>
            </div>
            <FaShoppingCart className="text-3xl text-blue-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos Totales</p>
              <p className="text-3xl font-black text-gray-900">€{kpis.totalRevenue.toFixed(2)}</p>
            </div>
            <FaEuroSign className="text-3xl text-purple-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Compradores Únicos</p>
              <p className="text-3xl font-black text-gray-900">{kpis.uniqueBuyers}</p>
            </div>
            <FaUsers className="text-3xl text-cyan-500 opacity-30" />
          </div>
        </div>
      </div>

      {/* ── Suscripciones reales ── */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Suscripciones activas</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Activas (acceso vigente)</p>
              <p className="text-3xl font-black text-gray-900">{kpis.activeSubscriptions}</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En Trial (período activo)</p>
              <p className="text-3xl font-black text-gray-900">{kpis.trialingSubscriptions}</p>
            </div>
            <FaClock className="text-3xl text-blue-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico diario compras + ingresos */}
        <div className="bg-white rounded-xl p-6 shadow lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Compras e Ingresos diarios (últimas 2 semanas)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={charts.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `€${v}`} />
                <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                <Tooltip formatter={(v: number, name: string) => name === 'Ingresos (€)' ? `€${v.toFixed(2)}` : v} />
                <Legend />
                <Bar yAxisId="right" dataKey="purchases" name="Compras" fill="#07C59A" opacity={0.8} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Ingresos (€)" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desglose por tipo */}
        {charts.typeBreakdown.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Por tipo de test (últimas 2 semanas)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.typeBreakdown.map((t: any) => ({
                  name: TEST_LABELS[t.testType] || t.testType,
                  Compras: t.count,
                  Ingresos: t.revenue,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Compras" fill="#07C59A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── Transacciones recientes ── */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaShoppingCart className="text-[#07C59A]" />
          Compras recientes (últimas 2 semanas)
        </h3>
        {tables.recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay compras en las últimas 2 semanas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Test</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tables.recentTransactions.map((t: any, i: number) => (
                  <tr key={`${t.id}-${i}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{t.customer_email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        t.test_type === 'iq' ? 'bg-blue-100 text-blue-800' :
                        t.test_type === 'personality' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.description}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">€{t.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(t.created).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        t.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                        t.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status === 'succeeded' ? 'Completado' : t.status === 'refunded' ? 'Reembolsado' : t.status}
                      </span>
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
