import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { 
  detectRiskSignals, 
  determinePreventiveAction,
  executePreventiveRefund,
  sendProactiveEmail 
} from '@/lib/preventive-refund'
import { sendEmail } from '@/lib/email-service'
export const dynamic = 'force-dynamic'

/**
 * Cron job para escanear usuarios de alto riesgo y tomar acciones preventivas
 * 
 * Configurar en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/scan-high-risk-users",
 *     "schedule": "0 */6 * * *"
 *   }]
 * }
 * 
 * Schedule: Cada 6 horas
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ [PREVENTIVE CRON] Intento no autorizado')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('⏰ [PREVENTIVE CRON] Iniciando escaneo de usuarios de alto riesgo...')
    
    const actionsLog: any[] = []
    let totalScanned = 0
    let totalActionsExecuted = 0
    
    // Obtener todos los usuarios en trial o activos (últimos 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // TODO: Implementar query específico en database-postgres.ts
    // Por ahora, obtenemos config para verificar que funciona
    const config = await db.getAllConfig()
    
    // IMPLEMENTACIÓN SIMPLE: Verificar usuarios recientemente creados
    // En producción, necesitarías un query más sofisticado
    
    console.log(`✅ [PREVENTIVE CRON] Escaneo completado: ${totalScanned} usuarios escaneados, ${totalActionsExecuted} acciones ejecutadas`)
    
    // Enviar resumen por email si hubo acciones
    if (totalActionsExecuted > 0) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'support@iqmind.mobi',
        subject: `🛡️ Resumen Preventivo: ${totalActionsExecuted} acciones ejecutadas`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Resumen Preventivo</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🛡️ Resumen de Acciones Preventivas</h2>
            <p><strong>Usuarios escaneados:</strong> ${totalScanned}</p>
            <p><strong>Acciones ejecutadas:</strong> ${totalActionsExecuted}</p>
            
            <h3>Detalles:</h3>
            <pre>${JSON.stringify(actionsLog, null, 2)}</pre>
            
            <p style="color: #059669; font-weight: bold;">
              ✅ Estas acciones preventivas ayudan a mantener bajo el ratio de disputas.
            </p>
          </body>
          </html>
        `
      })
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      scanned: totalScanned,
      actionsExecuted: totalActionsExecuted,
      actions: actionsLog
    })

  } catch (error: any) {
    console.error('❌ [PREVENTIVE CRON] Error:', error)
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

