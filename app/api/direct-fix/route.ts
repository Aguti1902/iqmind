import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, iq, correctAnswers, timeElapsed } = body

    console.log('🔧 Arreglo directo para:', { email, iq, correctAnswers })

    // Importar la base de datos directamente
    const { db } = await import('@/lib/database')
    
    // Buscar usuario
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado',
        email 
      }, { status: 404 })
    }

    console.log('👤 Usuario encontrado:', {
      id: user.id,
      email: user.email,
      currentIQ: user.iq,
      currentTestResults: user.testResults?.length || 0
    })

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

    // Obtener test results actuales
    const currentTestResults = user.testResults || []
    console.log('📊 Test results actuales:', currentTestResults.length)
    
    // Guardar resultado en la base de datos
    await db.createTestResult(testResult)
    console.log('📊 Test result creado')
    
    // Actualizar IQ del usuario
    const updatedUser = await db.updateUser(user.id, {
      iq: testResult.iq,
    })

    if (updatedUser) {
      console.log('✅ Usuario actualizado:', {
        id: updatedUser.id,
        email: updatedUser.email,
        iq: updatedUser.iq,
        testResultsCount: updatedUser.testResults?.length || 0
      })
    } else {
      console.error('❌ Error: updatedUser es null')
    }

    // Verificar que se guardó correctamente
    const verifyUser = await db.getUserByEmail(email)
    console.log('🔍 Verificación final:', {
      iq: verifyUser?.iq,
      testResultsCount: verifyUser?.testResults?.length || 0
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario arreglado exitosamente',
      before: {
        iq: user.iq,
        testResultsCount: currentTestResults.length
      },
      after: {
        iq: verifyUser?.iq,
        testResultsCount: verifyUser?.testResults?.length || 0
      },
      testResult: {
        id: testResult.id,
        iq: testResult.iq,
        correctAnswers: testResult.correctAnswers,
        timeElapsed: testResult.timeElapsed
      }
    })

  } catch (error: any) {
    console.error('❌ Error arreglando usuario:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
