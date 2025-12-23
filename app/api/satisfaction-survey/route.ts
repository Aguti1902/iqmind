import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/database-postgres'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, score, timestamp } = body

    if (!email || score === undefined) {
      return NextResponse.json(
        { error: 'Email y puntuación requeridos' },
        { status: 400 }
      )
    }

    // Guardar la encuesta en la base de datos
    await db.createSatisfactionSurvey(email, score, timestamp)

    console.log('✅ Encuesta guardada:', { email, score })

    return NextResponse.json({
      success: true,
      message: 'Encuesta guardada exitosamente'
    })

  } catch (error: any) {
    console.error('❌ Error guardando encuesta:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET para obtener todas las encuestas (admin)
export async function GET(request: NextRequest) {
  try {
    // Obtener todas las encuestas
    const surveys = await db.getSatisfactionSurveys()
    const totalSurveys = surveys.length
    const averageScore = surveys.length > 0
      ? parseFloat((surveys.reduce((sum: number, s: any) => sum + s.score, 0) / surveys.length).toFixed(2))
      : 0

    // Distribución por puntuación
    const distribution = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: surveys.filter((s: any) => s.score === i).length
    }))

    // NPS (Net Promoter Score)
    const promoters = surveys.filter((s: any) => s.score >= 9).length
    const passives = surveys.filter((s: any) => s.score >= 7 && s.score <= 8).length
    const detractors = surveys.filter((s: any) => s.score <= 6).length
    const nps = totalSurveys > 0
      ? Math.round(((promoters - detractors) / totalSurveys) * 100)
      : 0

    return NextResponse.json({
      surveys,
      stats: {
        total: totalSurveys,
        average: averageScore,
        distribution,
        nps: {
          score: nps,
          promoters,
          passives,
          detractors
        }
      }
    })

  } catch (error: any) {
    console.error('❌ Error obteniendo encuestas:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

