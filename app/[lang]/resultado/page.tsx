'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getIQCategory, getIQDescription, visualQuestions as questions } from '@/lib/visual-questions'
import { FaFacebook, FaTwitter, FaLinkedin, FaDownload, FaTrophy, FaBrain, FaLightbulb, FaEye, FaSearch, FaBolt, FaChartBar, FaMemory } from 'react-icons/fa'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useTranslations } from '@/hooks/useTranslations'
import { getTestHistory } from '@/lib/test-history'

export default function ResultadoPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [userIQ, setUserIQ] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const paymentCompleted = localStorage.getItem('paymentCompleted')
    if (!paymentCompleted) {
      router.push(`/${lang}/test`)
      return
    }

    // Verificar si se quiere ver un test específico del historial
    const viewTestId = localStorage.getItem('viewTestId')
    
    if (viewTestId) {
      const history = getTestHistory()
      const specificTest = history.tests.find(t => t.id === viewTestId)
      
      if (specificTest) {
        setUserIQ(specificTest.iq)
        setCorrectAnswers(specificTest.correctAnswers)
        setUserEmail(history.email || localStorage.getItem('userEmail') || '')
        setUserName(history.userName || localStorage.getItem('userName') || 'Usuario')
        setIsLoading(false)
        localStorage.removeItem('viewTestId') // Limpiar después de usar
        return
      }
    }

    // Si no, cargar el último test
    const iq = parseInt(localStorage.getItem('userIQ') || '0')
    const correct = parseInt(localStorage.getItem('correctAnswers') || '0')
    const email = localStorage.getItem('userEmail') || ''
    const name = localStorage.getItem('userName') || 'Usuario'

    setUserIQ(iq)
    setCorrectAnswers(correct)
    setUserEmail(email)
    setUserName(name)
    setIsLoading(false)

    // Enviar evento de conversión a analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'purchase', {
        transaction_id: localStorage.getItem('transactionId'),
        value: 0.50,
        currency: 'EUR'
      })
    }

    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Purchase', {
        value: 0.50,
        currency: 'EUR'
      })
    }
  }, [router, lang])

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(`¡Acabo de descubrir que mi CI es ${userIQ}! Descubre el tuyo en IQLevel`)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Mi CI es ${userIQ}! 🧠 Descubre el tuyo en`)}&url=${encodeURIComponent(window.location.origin)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const downloadCertificate = async () => {
    if (!t) return
    
    // Importar jsPDF dinámicamente para evitar problemas con SSR
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    // Colores corporativos
    const greenColor: [number, number, number] = [33, 139, 142] // #218B8E
    const blueColor: [number, number, number] = [3, 28, 67] // #031C43
    
    // Fondo degradado (simulado con rectángulos)
    doc.setFillColor(240, 250, 250)
    doc.rect(0, 0, 297, 210, 'F')
    
    // Borde decorativo
    doc.setLineWidth(2)
    doc.setDrawColor(...greenColor)
    doc.rect(10, 10, 277, 190)
    
    doc.setLineWidth(0.5)
    doc.setDrawColor(...greenColor)
    doc.rect(12, 12, 273, 186)
    
    // Cargar y añadir el logo (solo imagen, sin texto)
    try {
      const logoImg = new Image()
      logoImg.src = '/images/Favicon.png'
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve
        logoImg.onerror = reject
      })
      
      // Añadir logo centrado arriba - más grande
      const logoWidth = 25
      const logoHeight = 25
      doc.addImage(logoImg, 'PNG', 136, 18, logoWidth, logoHeight)
    } catch (error) {
      console.error('Error loading logo:', error)
    }
    
    // Título del certificado (traducido)
    doc.setFontSize(26)
    doc.setTextColor(...blueColor)
    doc.setFont('helvetica', 'bold')
    const certificateTitle = t.certificate?.title || 'INTELLIGENCE CERTIFICATE'
    doc.text(certificateTitle, 148.5, 55, { align: 'center' })
    
    // Línea decorativa
    doc.setLineWidth(0.5)
    doc.setDrawColor(...greenColor)
    doc.line(60, 68, 237, 68)
    
    // Texto "Se certifica que" (traducido)
    doc.setFontSize(14)
    doc.setTextColor(80, 80, 80)
    doc.setFont('helvetica', 'normal')
    const certifyText = t.certificate?.certifies || 'This certifies that'
    doc.text(certifyText, 148.5, 80, { align: 'center' })
    
    // Nombre del usuario
    doc.setFontSize(24)
    doc.setTextColor(...greenColor)
    doc.setFont('helvetica', 'bold')
    doc.text(userName, 148.5, 93, { align: 'center' })
    
    // Texto descriptivo (traducido)
    doc.setFontSize(12)
    doc.setTextColor(80, 80, 80)
    doc.setFont('helvetica', 'normal')
    const completedText = t.certificate?.completed || 'has successfully completed the intelligence test'
    const obtainedText = t.certificate?.obtained || 'obtaining an Intelligence Quotient of'
    doc.text(completedText, 148.5, 103, { align: 'center' })
    doc.text(obtainedText, 148.5, 111, { align: 'center' })
    
    // IQ Score - Grande y destacado
    doc.setFontSize(60)
    doc.setTextColor(...blueColor)
    doc.setFont('helvetica', 'bold')
    doc.text(userIQ.toString(), 148.5, 135, { align: 'center' })
    
    // Categoría (traducido)
    doc.setFontSize(16)
    doc.setTextColor(...greenColor)
    doc.setFont('helvetica', 'bold')
    const categoryLabel = t.certificate?.category || 'Category'
    doc.text(`${categoryLabel}: ${category}`, 148.5, 150, { align: 'center' })
    
    // Estadísticas (traducido)
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    const correctLabel = t.certificate?.correctAnswers || 'correct answers'
    const percentileLabel = t.certificate?.percentile || 'Percentile'
    doc.text(`${correctAnswers}/${questions.length} ${correctLabel} (${percentageCorrect}%)`, 148.5, 160, { align: 'center' })
    doc.text(`${percentileLabel}: ${percentile}`, 148.5, 167, { align: 'center' })
    
    // Fecha (traducido según idioma)
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    const localeMap: { [key: string]: string } = {
      'es': 'es-ES',
      'en': 'en-US',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'sv': 'sv-SE',
      'no': 'no-NO'
    }
    const fecha = new Date().toLocaleDateString(localeMap[lang] || 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const dateLabel = t.certificate?.issueDate || 'Issue date'
    doc.text(`${dateLabel}: ${fecha}`, 148.5, 178, { align: 'center' })
    
    // Línea de firma decorativa
    doc.setLineWidth(0.3)
    doc.setDrawColor(...greenColor)
    doc.line(105, 188, 192, 188)
    
    // Texto de firma
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    const footerText = t.certificate?.footer || 'IQmind - Professional Intelligence Test'
    doc.text(footerText, 148.5, 193, { align: 'center' })
    doc.text('iqmind.io', 148.5, 198, { align: 'center' })
    
    // Guardar el PDF
    const fileName = t.certificate?.fileName || 'Certificate_IQ'
    doc.save(`${fileName}_${userName.replace(/\s+/g, '_')}_${userIQ}.pdf`)
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu resultado...</p>
          </div>
        </div>
      </>
    )
  }

  const category = getIQCategory(userIQ)
  const description = getIQDescription(userIQ)

  // Datos para los gráficos
  const distributionData = t ? [
    { name: `${t.result.veryLow} (<70)`, value: 2.2, color: '#ef4444', range: '<70' },
    { name: `${t.result.low} (70-85)`, value: 13.6, color: '#f97316', range: '70-85' },
    { name: `${t.result.average} (85-115)`, value: 68, color: '#218B8E', range: '85-115' },
    { name: `${t.result.superior} (115-130)`, value: 13.6, color: '#8b5cf6', range: '115-130' },
    { name: `${t.result.verySuperior} (>130)`, value: 2.2, color: '#10b981', range: '>130' }
  ] : []

  // Calcular porcentaje de respuestas correctas
  const percentageCorrect = Math.round((correctAnswers / questions.length) * 100)

  // Categorías cognitivas con puntuaciones simuladas basadas en el rendimiento
  const baseScore = (correctAnswers / questions.length) * 100
  const cognitiveCategories = t ? [
    { name: t.result.logicalReasoning, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'brain' },
    { name: t.result.visualPerception, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'eye' },
    { name: t.result.patternRecognition, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'search' },
    { name: t.result.abstractThinking, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'lightbulb' },
    { name: t.result.workingMemory, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'memory' },
    { name: t.result.processingSpeed, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'bolt' }
  ] : []

  const performanceData = t ? [
    { 
      category: t.result.easyQuestions, 
      correctas: Math.min(7, correctAnswers), 
      incorrectas: Math.max(0, 7 - Math.min(7, correctAnswers)),
      total: 7 
    },
    { 
      category: t.result.mediumQuestions, 
      correctas: Math.max(0, Math.min(7, correctAnswers - 7)), 
      incorrectas: Math.max(0, 7 - Math.max(0, Math.min(7, correctAnswers - 7))),
      total: 7 
    },
    { 
      category: t.result.hardQuestions, 
      correctas: Math.max(0, correctAnswers - 14), 
      incorrectas: Math.max(0, 6 - Math.max(0, correctAnswers - 14)),
      total: 6 
    }
  ] : []

  const COLORS = ['#ef4444', '#f97316', '#218B8E', '#8b5cf6', '#10b981']
  
  // Determinar posición en la curva de distribución
  const getUserPercentile = (iq: number) => {
    if (iq < 70) return 2
    if (iq < 85) return 16
    if (iq < 100) return 50
    if (iq < 115) return 84
    if (iq < 130) return 98
    return 99
  }

  const percentile = getUserPercentile(userIQ)

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12">
        <div className="container-custom max-w-7xl">
          {/* Success Banner - Más compacto */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 mb-6 text-center animate-fadeIn shadow-md">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-900 mb-1">
              {t.result.congratulations}, {userName}!
            </h2>
            <p className="text-green-700 text-sm">
              {t.result.analysisComplete} <strong>{userEmail}</strong>
            </p>
          </div>

          {/* Main IQ Score Card - Hero */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 animate-fadeIn">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-[#218B8E] via-[#1a6f72] to-[#031C43] p-12 text-white text-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="inline-block p-6 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                  <FaBrain className="text-7xl" />
              </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {t.result.yourIQ}
              </h1>
                
                {/* IQ Score - Grande y prominente */}
                <div className="relative inline-block">
                  <div className="text-9xl md:text-[180px] font-black mb-4 leading-none">
                    {userIQ}
                  </div>
                  <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {t.result.topPercent} {100 - percentile}%
                  </div>
                </div>
                
                <div className="text-3xl font-semibold mb-3 bg-white/20 backdrop-blur-sm inline-block px-8 py-3 rounded-full">
                  {category}
                </div>
                
                <div className="flex items-center justify-center gap-3 text-xl mt-6">
                  <FaTrophy className="text-yellow-300 text-2xl" />
                  <span className="font-semibold">{correctAnswers}/{questions.length} {t.result.answersCorrect} ({percentageCorrect}%)</span>
            </div>

                <div className="mt-6 text-lg opacity-90">
                  {t.result.percentileText} <strong>{percentile}</strong> {t.result.ofPopulation}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-8 md:p-12">
              <div className="bg-gradient-to-br from-[#e6f5f5] to-white rounded-2xl p-8 border-2 border-[#218B8E]/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  {t.result.analysisTitle}
              </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                {description}
              </p>
              </div>
            </div>
          </div>

          {/* Cognitive Categories Analysis */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center flex items-center justify-center gap-3">
              <span className="text-4xl">🧠</span>
              {t.result.cognitiveTitle}
            </h2>
            <p className="text-gray-600 text-center mb-8">
              {t.result.cognitiveSubtitle}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cognitiveCategories.map((cat, index) => {
                const IconComponent = cat.icon === 'brain' ? FaBrain :
                                      cat.icon === 'eye' ? FaEye :
                                      cat.icon === 'search' ? FaSearch :
                                      cat.icon === 'lightbulb' ? FaLightbulb :
                                      cat.icon === 'memory' ? FaMemory :
                                      FaBolt;
                
                return (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-100 hover:border-[#218B8E] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="text-4xl text-[#218B8E]" />
                      <span className="text-3xl font-bold text-[#218B8E]">{cat.score}%</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{cat.name}</h4>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#218B8E] to-[#1a6f72] h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${cat.score}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Distribution Chart */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  {t.result.distributionTitle}
                </h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                {t.result.distributionSubtitle}
              </p>
              <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${value}%`}
                    outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              <div className="mt-6 space-y-3 bg-gray-50 rounded-xl p-4">
                  {distributionData.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded ${
                      userIQ >= parseInt(item.range.replace(/[<>]/g, '').split('-')[0] || '0') ? 'bg-[#218B8E]/10 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-gray-700">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {t.result.performanceTitle}
                </h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                {t.result.performanceSubtitle}
              </p>
              <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={performanceData}>
                  <XAxis dataKey="category" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 8]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #218B8E', borderRadius: '8px' }}
                  />
                          <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(value) => value === 'correctas' ? t.result.correct : t.result.incorrect} />
                  <Bar dataKey="correctas" fill="#218B8E" name={t.result.correct} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="incorrectas" fill="#ef4444" name={t.result.incorrect} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              
              {/* Summary */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                    <div className="text-xs text-gray-600">{t.result.correct}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{questions.length - correctAnswers}</div>
                    <div className="text-xs text-gray-600">{t.result.incorrect}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#218B8E]">{percentageCorrect}%</div>
                    <div className="text-xs text-gray-600">{t.result.accuracy}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#031C43] to-[#052547] p-8 text-white text-center">
              <FaDownload className="text-6xl mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">{t.result.certificateTitle}</h2>
              <p className="text-lg opacity-90">{t.result.certificateSubtitle}</p>
            </div>
            <div className="p-8">
              {/* Certificate Preview */}
              <div className="border-4 border-[#218B8E] rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.certificate.title}</h3>
                  <p className="text-gray-600 mb-4">{t.certificate.certifies}</p>
                  <p className="text-3xl font-bold text-[#218B8E] mb-4">{userName}</p>
                  <p className="text-gray-600 mb-2">{t.certificate.completed}</p>
                  <p className="text-gray-600 mb-4">{t.certificate.obtained}</p>
                  <div className="text-6xl font-black text-[#031C43] mb-4">{userIQ}</div>
                  <p className="text-lg font-semibold text-gray-800 mb-6">{t.certificate.category}: {category}</p>
                  <p className="text-sm text-gray-500">
                    {t.certificate.issueDate}: {new Date().toLocaleDateString(
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
              
              <button
                onClick={downloadCertificate}
                className="w-full bg-gradient-to-r from-[#218B8E] to-[#1a6f72] hover:from-[#1a6f72] hover:to-[#145356] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                <FaDownload className="text-2xl" />
                {t.result.downloadCertificate}
              </button>
              </div>
            </div>

            {/* Share Section */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t.result.shareTitle}
              </h2>
              <p className="text-gray-600 text-lg">
                {t.result.shareSubtitle}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={shareOnFacebook}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                <FaFacebook className="text-2xl" />
                  Facebook
                </button>
                <button
                  onClick={shareOnTwitter}
                className="flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                <FaTwitter className="text-2xl" />
                  Twitter
                </button>
                <button
                  onClick={shareOnLinkedIn}
                className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                <FaLinkedin className="text-2xl" />
                  LinkedIn
                </button>
            </div>
          </div>


          {/* Subscription Management */}
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {t.result.manageSubscription}
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              {t.result.manageSubtitle}
            </p>
            <a 
              href={`/${lang}/cuenta`}
              className="inline-block bg-[#031C43] hover:bg-[#052547] text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t.result.goToAccount}
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

