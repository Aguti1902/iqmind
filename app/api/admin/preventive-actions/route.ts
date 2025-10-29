import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { detectRiskSignals, determinePreventiveAction } from '@/lib/preventive-refund'
export const dynamic = 'force-dynamic'

/**
 * API para ver acciones preventivas tomadas o sugeridas
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const userEmail = request.headers.get('x-user-email')
    
    if (userEmail) {
      const isAdmin = await db.isAdmin(userEmail)
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Por ahora, retornamos ejemplo
    // En producción, esto vendría de una tabla en BD
    
    return NextResponse.json({
      success: true,
      actions: [
        {
          id: 'prev_1',
          timestamp: new Date().toISOString(),
          action: 'auto_refund',
          userEmail: 'example@tempmail.com',
          reason: 'Email temporal + sin uso en 7 días',
          status: 'executed',
          amount: 0.50
        }
      ],
      stats: {
        totalActions: 0,
        autoRefunds: 0,
        proactiveEmails: 0,
        flaggedForReview: 0
      }
    })

  } catch (error: any) {
    console.error('❌ [PREVENTIVE API] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Ejecutar acción preventiva manual
 */
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (userEmail) {
      const isAdmin = await db.isAdmin(userEmail)
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, action } = body

    console.log(`🔄 [PREVENTIVE API] Ejecutando acción manual: ${action} para usuario ${userId}`)

    // Detectar señales de riesgo
    const signals = await detectRiskSignals(userId)
    
    // Determinar acción
    const preventiveAction = await determinePreventiveAction(signals)
    
    return NextResponse.json({
      success: true,
      signals,
      suggestedAction: preventiveAction
    })

  } catch (error: any) {
    console.error('❌ [PREVENTIVE API] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

