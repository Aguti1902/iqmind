import { NextRequest, NextResponse } from 'next/server'
import { checkForNewDisputes } from '@/lib/dispute-monitor'
export const dynamic = 'force-dynamic'

/**
 * Cron job para verificar disputas automáticamente
 * Configurar en Vercel Cron: cada hora
 * 
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-disputes",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización (Vercel Cron envía un header especial)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ [CRON] Intento no autorizado de acceder al cron')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('⏰ [CRON] Ejecutando check automático de disputas...')
    
    await checkForNewDisputes()
    
    console.log('✅ [CRON] Check de disputas completado')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Dispute check completed'
    })

  } catch (error: any) {
    console.error('❌ [CRON] Error en check de disputas:', error)
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// También permitir POST para compatibilidad
export async function POST(request: NextRequest) {
  return GET(request)
}

