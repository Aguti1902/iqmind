import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const authData = requireAuth(token)
    
    if (!authData) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      iq, 
      correctAnswers, 
      timeElapsed, 
      answers, 
      categoryScores 
    } = body

    if (!iq || correctAnswers === undefined || !timeElapsed || !answers) {
      return NextResponse.json({ 
        error: 'Datos del test requeridos: iq, correctAnswers, timeElapsed, answers' 
      }, { status: 400 })
    }

    // Obtener usuario
    const user = await db.getUserById(authData.userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear resultado del test
    const testResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      iq,
      correctAnswers,
      timeElapsed,
      answers,
      categoryScores: categoryScores || {},
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    // Guardar en la base de datos del usuario
    const updatedUser = await db.updateUser(user.id, {
      iq, // Actualizar IQ más reciente
      testResults: [...(user.testResults || []), testResult]
    })

    if (!updatedUser) {
      return NextResponse.json({ error: 'Error guardando resultado' }, { status: 500 })
    }

    console.log(`✅ Resultado de test guardado para usuario ${user.email}:`, {
      iq,
      correctAnswers,
      timeElapsed
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Resultado guardado correctamente',
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
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
