import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, iq, correctAnswers, timeElapsed, answers, categoryScores } = body

    if (!email || !iq) {
      return NextResponse.json({ 
        error: 'Email e IQ son requeridos' 
      }, { status: 400 })
    }

    console.log('🧪 Simulando webhook para:', { email, iq, correctAnswers })

    // Buscar usuario por email
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 })
    }

    // Crear resultado del test
    const testResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      iq: parseInt(iq),
      correctAnswers: parseInt(correctAnswers || 0),
      timeElapsed: parseInt(timeElapsed || 0),
      answers: answers || [],
      categoryScores: categoryScores || {},
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    // Agregar resultado al usuario
    const updatedTestResults = [...(user.testResults || []), testResult]
    
    // Actualizar usuario con el resultado del test
    const updatedUser = await db.updateUser(user.id, {
      testResults: updatedTestResults,
      iq: testResult.iq, // Actualizar IQ más reciente
      updatedAt: new Date().toISOString()
    })

    console.log(`✅ Resultado del test guardado: IQ ${testResult.iq}, ${testResult.correctAnswers} correctas`)

    return NextResponse.json({
      success: true,
      message: 'Resultado del test guardado exitosamente',
      testResult: {
        id: testResult.id,
        iq: testResult.iq,
        correctAnswers: testResult.correctAnswers,
        timeElapsed: testResult.timeElapsed,
        completedAt: testResult.completedAt
      },
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        userName: updatedUser.userName,
        iq: updatedUser.iq,
        testResultsCount: updatedTestResults.length
      }
    })

  } catch (error: any) {
    console.error('❌ Error simulando webhook:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
