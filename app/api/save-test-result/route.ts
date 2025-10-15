import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decodedToken = verifyToken(token)
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      iq, 
      correctAnswers, 
      totalQuestions, 
      timeElapsed, 
      answers, 
      categoryScores 
    } = body

    if (!iq || !correctAnswers || !totalQuestions || !timeElapsed || !answers) {
      return NextResponse.json({ 
        error: 'Datos del test requeridos' 
      }, { status: 400 })
    }

    console.log('💾 Guardando resultado de test para usuario:', decodedToken.userId)

    // Obtener usuario
    const user = await db.getUserById(decodedToken.userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear resultado del test
    const testResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      iq: parseInt(iq),
      correctAnswers: parseInt(correctAnswers),
      timeElapsed: parseInt(timeElapsed),
      answers: answers,
      categoryScores: categoryScores || {},
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    // Guardar resultado en la base de datos
    await db.createTestResult(testResult)
    
    // Actualizar IQ del usuario
    await db.updateUser(user.id, {
      iq: testResult.iq,
    })

    console.log(`✅ Resultado guardado: IQ ${testResult.iq}, ${testResult.correctAnswers}/${totalQuestions} correctas`)

    return NextResponse.json({
      success: true,
      message: 'Resultado del test guardado exitosamente',
      testResult: {
        id: testResult.id,
        iq: testResult.iq,
        correctAnswers: testResult.correctAnswers,
        timeElapsed: testResult.timeElapsed,
        completedAt: testResult.completedAt
      }
    })

  } catch (error: any) {
    console.error('❌ Error guardando resultado de test:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}