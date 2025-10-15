import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
// Array para almacenar logs (en producción usarías una base de datos)
let webhookLogs: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    let filteredLogs = webhookLogs
    
    if (email) {
      filteredLogs = webhookLogs.filter(log => 
        log.email === email || 
        log.data?.email === email ||
        log.paymentIntent?.metadata?.email === email
      )
    }
    
    return NextResponse.json({
      success: true,
      totalLogs: webhookLogs.length,
      filteredLogs: filteredLogs.length,
      logs: filteredLogs.slice(-20) // Últimos 20 logs
    })
    
  } catch (error: any) {
    console.error('❌ Error obteniendo logs:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Agregar log con timestamp
    const log = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...body
    }
    
    webhookLogs.push(log)
    
    // Mantener solo los últimos 100 logs
    if (webhookLogs.length > 100) {
      webhookLogs = webhookLogs.slice(-100)
    }
    
    console.log('📝 Log agregado:', log)
    
    return NextResponse.json({ success: true, logId: log.id })
    
  } catch (error: any) {
    console.error('❌ Error agregando log:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 })
  }
}
