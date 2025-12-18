import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// Endpoint para que n8n registre logs del agente IA
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validar que tenga los campos mínimos requeridos
    if (!body.requestType || !body.customerEmail || !body.aiDecision) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: requestType, customerEmail, aiDecision' },
        { status: 400 }
      )
    }
    
    // Crear el log
    const log = await db.createAiAgentLog({
      requestType: body.requestType, // 'refund', 'cancellation', 'generic'
      customerEmail: body.customerEmail,
      paymentEmail: body.paymentEmail,
      language: body.language,
      requestReason: body.requestReason,
      aiDecision: body.aiDecision, // 'approved', 'denied', 'cancelled', 'not_found'
      stripeCustomerId: body.stripeCustomerId,
      stripeSubscriptionId: body.stripeSubscriptionId,
      stripeRefundId: body.stripeRefundId,
      amountRefunded: body.amountRefunded,
      processingTime: body.processingTime,
      errorMessage: body.errorMessage,
      rawRequest: body.rawRequest,
      rawResponse: body.rawResponse
    })
    
    return NextResponse.json({
      success: true,
      log_id: log.id,
      message: 'Log registrado correctamente'
    })
    
  } catch (error: any) {
    console.error('Error creando log del agente IA:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error registrando log',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Endpoint para obtener logs (opcional, para debugging)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const logs = await db.getAiAgentLogs(limit, offset)
    
    return NextResponse.json({
      success: true,
      logs,
      count: logs.length
    })
    
  } catch (error: any) {
    console.error('Error obteniendo logs del agente IA:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo logs',
        details: error.message
      },
      { status: 500 }
    )
  }
}

