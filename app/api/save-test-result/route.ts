import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      iq, 
      correctAnswers, 
      totalQuestions, 
      timeElapsed, 
      answers, 
      categoryScores,
      email  // Permitir email como alternativa al token
    } = body

    if (!iq || !correctAnswers || !totalQuestions || !timeElapsed || !answers) {
      return NextResponse.json({ 
        error: 'Datos del test requeridos' 
      }, { status: 400 })
    }

    // Intentar obtener usuario por token O por email
    let user = null
    
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (token) {
      // Usuario autenticado con token
      const decodedToken = verifyToken(token)
      if (decodedToken && decodedToken.userId) {
        user = await db.getUserById(decodedToken.userId)
        console.log('💾 Guardando resultado de test para usuario autenticado:', decodedToken.userId)
      }
    } else if (email) {
      // Usuario NO autenticado, buscar/crear por email
      console.log('💾 Guardando resultado de test para email:', email)
      user = await db.getUserByEmail(email)
      
      if (!user) {
        // Crear usuario temporal
        console.log('👤 Creando usuario temporal para email:', email)
        user = await db.createUser({
          email: email,
          name: 'Usuario',
          password: '', // Sin password por ahora
        })
      }
    } else {
      return NextResponse.json({ 
        error: 'Se requiere token de autenticación o email' 
      }, { status: 401 })
    }

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