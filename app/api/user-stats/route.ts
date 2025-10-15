import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const authData = requireAuth(token)
    
    if (!authData) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener usuario
    const user = await db.getUserById(authData.userId)
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
        ? testResults[testResults.length - 1].iq - testResults[0].iq
        : 0,
      lastTestDate: testResults.length > 0 
        ? testResults[testResults.length - 1].completedAt
        : null
    }

    // Datos de evolución para gráficos
    const evolutionData = testResults.map((test, index) => ({
      date: new Date(test.completedAt).toLocaleDateString('es-ES'),
      iq: test.iq,
      correctAnswers: test.correctAnswers,
      testNumber: index + 1
    }))

    return NextResponse.json({
      success: true,
      stats,
      testResults: testResults.map(test => ({
        id: test.id,
        iq: test.iq,
        correctAnswers: test.correctAnswers,
        timeElapsed: test.timeElapsed,
        completedAt: test.completedAt
      })),
      evolutionData
    })

  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
