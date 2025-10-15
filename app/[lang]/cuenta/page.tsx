'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaUser, FaEnvelope, FaCrown, FaCalendar, FaBrain, FaTrophy, FaChartLine, FaClock, FaStar, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'
import { getTestHistory, getTestStatistics, getEvolutionData } from '@/lib/test-history'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function CuentaPage() {
  const router = useRouter()
  const { lang } = useParams()
  const { t, loading: translationsLoading } = useTranslations()
  const [userData, setUserData] = useState({
    email: '',
    userName: '',
    hasSubscription: false
  })
  const [stats, setStats] = useState({
    totalTests: 0,
    averageIQ: 0,
    highestIQ: 0,
    lowestIQ: 0,
    averageCorrect: 0,
    improvement: 0,
    lastTestDate: null as string | null
  })
  const [evolutionData, setEvolutionData] = useState<any[]>([])
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    const paymentCompleted = localStorage.getItem('paymentCompleted')

    if (!email || !paymentCompleted) {
      router.push(`/${lang}`)
      return
    }

    // Cargar historial y estadísticas
    const history = getTestHistory()
    const statistics = getTestStatistics()
    const evolution = getEvolutionData()

    setUserData({
      email: history.email || email,
      userName: history.userName,
      hasSubscription: true // En producción, esto vendría de tu backend
    })

    setStats(statistics)
    setEvolutionData(evolution)
    setTestHistory(history.tests)

    setIsLoading(false)
  }, [router, lang])

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
        setPasswordMessage('✅ Contraseña cambiada exitosamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setShowChangePassword(false)
          setPasswordMessage('')
        }, 2000)
      } else {
        setPasswordMessage(data.error || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      setPasswordMessage('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancelSubscription = () => {
    if (!t) return
    
    const confirmCancel = window.confirm(t.account.cancelConfirm)

    if (confirmCancel) {
      alert(t.account.cancelInstructions)
    }
  }

  const handleViewResult = (testId?: string) => {
    if (testId) {
      localStorage.setItem('viewTestId', testId)
    }
    router.push(`/${lang}/resultado`)
  }

  const handleNewTest = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    // Limpiar solo las respuestas, mantener el historial
    localStorage.removeItem('testResults')
    console.log('Redirigiendo a test-premium...')
    router.push(`/${lang}/test-premium`)
  }

  const getIQCategory = (iq: number) => {
    if (iq < 70) return { label: t?.result?.veryLow || 'Muy Bajo', color: 'text-red-600' }
    if (iq < 85) return { label: t?.result?.low || 'Bajo', color: 'text-orange-600' }
    if (iq < 115) return { label: t?.result?.average || 'Promedio', color: 'text-blue-600' }
    if (iq < 130) return { label: t?.result?.superior || 'Superior', color: 'text-green-600' }
    return { label: t?.result?.verySuperior || 'Muy Superior', color: 'text-purple-600' }
  }

  const getImprovementIcon = () => {
    if (stats.improvement > 0) return <FaArrowUp className="text-green-500" />
    if (stats.improvement < 0) return <FaArrowDown className="text-red-500" />
    return <FaMinus className="text-gray-500" />
  }

  if (isLoading || translationsLoading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t ? t.account.loading : 'Loading...'}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t.account.title}
            </h1>
            <p className="text-gray-600">
              {t.account.welcomeBack}, {userData.userName || t.account.premiumUser}
            </p>
          </div>

          {/* Stats Overview - Grid principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Tests */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaBrain className="text-2xl text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {t.account.total}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalTests}
              </div>
              <p className="text-sm text-gray-600">{t.account.testsCompleted}</p>
            </div>

            {/* Average IQ */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaTrophy className="text-2xl text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  {t.account.average}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.averageIQ}
              </div>
              <p className="text-sm text-gray-600">{t.account.averageIQ}</p>
            </div>

            {/* Highest IQ */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaStar className="text-2xl text-green-600" />
                </div>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {t.account.maximum}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.highestIQ}
              </div>
              <p className="text-sm text-gray-600">{t.account.bestScore}</p>
            </div>

            {/* Improvement */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-2xl text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  {t.account.progress}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.abs(stats.improvement)}
                </div>
                {getImprovementIcon()}
              </div>
              <p className="text-sm text-gray-600">
                {stats.improvement > 0 ? t.account.improvementPoints : stats.improvement < 0 ? t.account.declinePoints : t.account.noChange}
              </p>
            </div>
          </div>

          {/* Evolution Chart */}
          {evolutionData.length > 1 && (
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-3xl text-primary-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t.account.evolutionTitle}</h2>
                  <p className="text-gray-600">{t.account.evolutionSubtitle}</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[70, 150]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="iq" 
                    stroke="#218B8E" 
                    strokeWidth={3}
                    dot={{ fill: '#218B8E', r: 6 }}
                    activeDot={{ r: 8 }}
                    name="CI"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="correctAnswers" 
                    stroke="#031C43" 
                    strokeWidth={2}
                    dot={{ fill: '#031C43', r: 4 }}
                    name="Respuestas Correctas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* User Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-2xl text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{userData.userName}</h3>
                    <p className="text-sm text-gray-600">{t.account.premiumUser}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaEnvelope className="text-xl text-primary-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{t.account.email}</p>
                      <p className="font-medium text-gray-900 text-sm truncate">{userData.email}</p>
                    </div>
                  </div>

                  {stats.lastTestDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FaCalendar className="text-xl text-primary-600" />
                      <div>
                        <p className="text-xs text-gray-500">{t.account.lastTest || 'Último Test'}</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {new Date(stats.lastTestDate).toLocaleDateString(
                            lang === 'es' ? 'es-ES' : 
                            lang === 'en' ? 'en-US' : 
                            lang === 'fr' ? 'fr-FR' : 
                            lang === 'de' ? 'de-DE' : 
                            lang === 'it' ? 'it-IT' : 
                            lang === 'pt' ? 'pt-PT' : 
                            lang === 'sv' ? 'sv-SE' : 'no-NO'
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNewTest}
                  className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <FaBrain />
                  {t.account.takeNewTest}
                </button>
              </div>

              {/* Subscription Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-md p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <FaCrown className="text-3xl text-yellow-300" />
                  <div>
                    <h3 className="text-lg font-bold">{t.account.premium}</h3>
                    <p className="text-sm opacity-90">{t.account.active}</p>
                  </div>
                </div>

                  <ul className="space-y-2 mb-4 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-300">✓</span>
                      {t.account.unlimitedTests}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-300">✓</span>
                      {t.account.detailedStats}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-300">✓</span>
                      {t.account.progressTracking}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-300">✓</span>
                      {t.account.prioritySupport}
                    </li>
                  </ul>

                  <button
                    onClick={handleCancelSubscription}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-semibold transition text-sm"
                  >
                    {t.account.manageSubscription}
                  </button>
              </div>

              {/* Change Password Card */}
              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Seguridad</h3>
                </div>
                
                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold transition"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {passwordMessage && (
                      <div className={`text-sm p-3 rounded-lg ${
                        passwordMessage.includes('✅') 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {passwordMessage}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 font-semibold transition"
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
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Test History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t.account.testHistoryTitle}</h2>
                    <p className="text-gray-600">{t.account.testHistorySubtitle}</p>
                  </div>
                  {testHistory.length > 0 && (
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-semibold text-sm">
                      {testHistory.length} {testHistory.length === 1 ? 'Test' : 'Tests'}
                    </span>
                  )}
                </div>

                {testHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBrain className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      {t.account.noTestsYet}
                    </p>
                    <button
                      onClick={handleNewTest}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      {t.account.startFirstTest}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {testHistory.map((test, index) => {
                      const category = getIQCategory(test.iq)
                      const isLatest = index === 0
                      
                      return (
                        <div 
                          key={test.id} 
                          className={`p-5 rounded-xl border-2 transition hover:shadow-md cursor-pointer ${
                            isLatest 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                          onClick={() => handleViewResult(test.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                isLatest ? 'bg-primary-100' : 'bg-white'
                              }`}>
                                <FaTrophy className={`text-2xl ${
                                  isLatest ? 'text-primary-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-900">
                                    Test #{testHistory.length - index}
                                  </h3>
                                  {isLatest && (
                                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                      {t.account.mostRecent}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {new Date(test.date).toLocaleDateString(
                                    lang === 'es' ? 'es-ES' : 
                                    lang === 'en' ? 'en-US' : 
                                    lang === 'fr' ? 'fr-FR' : 
                                    lang === 'de' ? 'de-DE' : 
                                    lang === 'it' ? 'it-IT' : 
                                    lang === 'pt' ? 'pt-PT' : 
                                    lang === 'sv' ? 'sv-SE' : 'no-NO',
                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t.account.yourIQ}</p>
                              <p className="text-2xl font-bold text-gray-900">{test.iq}</p>
                              <p className={`text-xs font-semibold ${category.color}`}>
                                {category.label}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t.account.correctAnswers}</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {test.correctAnswers}/20
                              </p>
                              <p className="text-xs text-gray-600">
                                {Math.round((test.correctAnswers / 20) * 100)}% {t.account.accuracy}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t.account.time}</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {Math.floor(test.timeElapsed / 60)}'
                              </p>
                              <p className="text-xs text-gray-600">
                                {test.timeElapsed % 60}s
                              </p>
                            </div>
                          </div>

                          {index > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600">{t.account.comparedToPrevious}</span>
                                {test.iq > testHistory[index - 1].iq ? (
                                  <>
                                    <FaArrowUp className="text-green-500" />
                                    <span className="font-semibold text-green-600">
                                      +{test.iq - testHistory[index - 1].iq} {t.account.points}
                                    </span>
                                  </>
                                ) : test.iq < testHistory[index - 1].iq ? (
                                  <>
                                    <FaArrowDown className="text-red-500" />
                                    <span className="font-semibold text-red-600">
                                      {test.iq - testHistory[index - 1].iq} {t.account.points}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <FaMinus className="text-gray-500" />
                                    <span className="font-semibold text-gray-600">
                                      {t.account.noChange}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.account.needHelp}
              </h3>
              <p className="text-gray-600 mb-4">
                {t.account.needHelpDesc}
              </p>
              <button
                onClick={() => router.push(`/${lang}/contacto`)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                {t.account.contact}
              </button>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-2">
                {t.account.wantToImprove}
              </h3>
              <p className="mb-4 opacity-90">
                {t.account.practiceKey}
              </p>
              <button
                onClick={handleNewTest}
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition"
              >
                {t.account.startNow}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
