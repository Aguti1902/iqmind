import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, iq, correctAnswers, timeElapsed } = body

    console.log('📊 Agregando resultado de test:', { email, iq, correctAnswers })

    // Buscar usuario por email
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado',
        email 
      }, { status: 404 })
    }

    console.log('👤 Usuario encontrado:', user.email)

    // Crear resultado del test
    const testResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      iq: parseInt(iq),
      correctAnswers: parseInt(correctAnswers || 0),
      timeElapsed: parseInt(timeElapsed || 0),
      answers: Array(20).fill(1), // Respuestas de ejemplo
      categoryScores: {
        logicalReasoning: 80,
        visualPerception: 75,
        patternRecognition: 85,
        abstractThinking: 70,
        workingMemory: 90,
        processingSpeed: 65
      },
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    console.log('💾 Creando resultado:', testResult)

    // Guardar resultado en la base de datos
    await db.createTestResult(testResult)
    
    // Actualizar IQ del usuario
    const updatedUser = await db.updateUser(user.id, {
      iq: testResult.iq,
    })

    if (updatedUser) {
      console.log(`✅ Usuario actualizado:`, {
        id: updatedUser.id,
        email: updatedUser.email,
        iq: updatedUser.iq,
        testResultsCount: updatedUser.testResults?.length || 0
      })
    } else {
      console.error('❌ Error: updatedUser es null')
    }

    return NextResponse.json({
      success: true,
      message: 'Resultado del test agregado exitosamente',
      testResult: {
        id: testResult.id,
        iq: testResult.iq,
        correctAnswers: testResult.correctAnswers,
        timeElapsed: testResult.timeElapsed
      },
      user: updatedUser ? {
        id: updatedUser.id,
        email: updatedUser.email,
        userName: updatedUser.userName,
        iq: updatedUser.iq,
        testResultsCount: updatedUser.testResults?.length || 0
      } : null
    })

  } catch (error: any) {
    console.error('❌ Error agregando resultado de test:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
