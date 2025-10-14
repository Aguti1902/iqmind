import { NextRequest, NextResponse } from 'next/server'

// Este sería un endpoint para guardar resultados en una base de datos
// Por ahora, lo dejamos como simulación

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, iq, correctAnswers, transactionId, completedAt } = body

    // Validación básica
    if (!email || !iq || !transactionId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Aquí normalmente guardarías en una base de datos
    // Por ejemplo: MongoDB, PostgreSQL, etc.
    
    // Simulación de guardado
    console.log('Guardando resultado:', {
      email,
      iq,
      correctAnswers,
      transactionId,
      completedAt,
      savedAt: new Date().toISOString()
    })

    // En producción, aquí también podrías:
    // 1. Enviar un email con el resultado
    // 2. Generar el certificado PDF
    // 3. Añadir al sistema de CRM
    // 4. Enviar evento a analytics

    return NextResponse.json({
      success: true,
      message: 'Resultado guardado correctamente'
    })

  } catch (error) {
    console.error('Error al guardar resultado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

