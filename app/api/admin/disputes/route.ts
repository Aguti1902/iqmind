import { NextRequest, NextResponse } from 'next/server'
import { calculateDisputeStats, fetchDisputesFromFastSpring } from '@/lib/dispute-monitor'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'

/**
 * API para obtener estadísticas y lista de disputas
 * Solo accesible para administradores
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación (obtener email del usuario logueado)
    // En tu caso, podrías usar cookies o headers
    const userEmail = request.headers.get('x-user-email')
    
    // Verificar si es admin
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

    // Obtener período de la query
    const { searchParams } = new URL(request.url)
    const periodDays = parseInt(searchParams.get('days') || '30')

    console.log(`📊 [DISPUTES API] Obteniendo stats de ${periodDays} días...`)

    // Calcular estadísticas
    const stats = await calculateDisputeStats(periodDays)

    // Obtener lista de disputas
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    const disputes = await fetchDisputesFromFastSpring(startDate)

    console.log(`✅ [DISPUTES API] Stats: ${stats.totalDisputes} disputas, ratio: ${stats.disputeRatio.toFixed(2)}%`)

    return NextResponse.json({
      success: true,
      stats,
      disputes: disputes.map((d: any) => ({
        id: d.id,
        order: d.order || d.reference,
        customerEmail: d.customer?.email || 'N/A',
        amount: d.total || 0,
        currency: d.currency || 'EUR',
        reason: d.reason || 'No especificada',
        status: d.status || 'open',
        createdAt: d.created,
        resolvedAt: d.resolved
      }))
    })

  } catch (error: any) {
    console.error('❌ [DISPUTES API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error obteniendo disputas' },
      { status: 500 }
    )
  }
}

/**
 * Forzar check manual de disputas
 */
export async function POST(request: NextRequest) {
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

    console.log('🔄 [DISPUTES API] Forzando check manual de disputas...')

    const { checkForNewDisputes } = await import('@/lib/dispute-monitor')
    await checkForNewDisputes()

    return NextResponse.json({
      success: true,
      message: 'Check de disputas completado'
    })

  } catch (error: any) {
    console.error('❌ [DISPUTES API] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

