import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decodedToken = verifyToken(token)
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }

    console.log('📊 Obteniendo estadísticas para usuario:', decodedToken.userId)

    // Obtener usuario
    const user = await db.getUserById(decodedToken.userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const testResults = user.testResults || []

    // Calcular estadísticas
    const stats = {
      totalTests: testResults.length,
      averageIQ: testResults.length > 0 
        ? Math.round(testResults.reduce((sum, test) => sum + test.iq, 0) / testResults.length)
        : 0,
      highestIQ: testResults.length > 0 
        ? Math.max(...testResults.map(test => test.iq))
        : 0,
      lowestIQ: testResults.length > 0 
        ? Math.min(...testResults.map(test => test.iq))
        : 0,
      averageCorrect: testResults.length > 0 
        ? Math.round(testResults.reduce((sum, test) => sum + test.correctAnswers, 0) / testResults.length)
        : 0,
      improvement: testResults.length > 1 
        ? testResults[0].iq - testResults[testResults.length - 1].iq
        : 0,
      lastTestDate: testResults.length > 0 ? testResults[0].completedAt : null
    }

    // Calcular datos de evolución
    const evolutionData = testResults.map((test, index) => ({
      date: new Date(test.completedAt).toLocaleDateString('es-ES'),
      iq: test.iq,
      correctAnswers: test.correctAnswers,
      testNumber: testResults.length - index
    })).reverse()

    console.log(`✅ Estadísticas calculadas: ${stats.totalTests} tests, IQ promedio: ${stats.averageIQ}`)

    return NextResponse.json({
      success: true,
      stats,
      evolutionData,
      testResults: testResults.map(test => ({
        id: test.id,
        iq: test.iq,
        correctAnswers: test.correctAnswers,
        timeElapsed: test.timeElapsed,
        answers: test.answers,
        categoryScores: test.categoryScores,
        completedAt: test.completedAt,
        createdAt: test.createdAt
      }))
    })

  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}