import { NextRequest, NextResponse } from 'next/server'
import { sendDailyDisputeReport } from '@/lib/dispute-monitor'
export const dynamic = 'force-dynamic'

/**
 * Cron job para enviar reporte diario de disputas
 * Configurar en Vercel Cron: diario a las 9:00 AM
 * 
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-dispute-report",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ [CRON] Intento no autorizado de acceder al cron')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('⏰ [CRON] Enviando reporte diario de disputas...')
    
    await sendDailyDisputeReport()
    
    console.log('✅ [CRON] Reporte diario enviado')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Daily report sent'
    })

  } catch (error: any) {
    console.error('❌ [CRON] Error enviando reporte:', error)
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

