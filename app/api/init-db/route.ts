import { NextRequest, NextResponse } from 'next/server'
import { initDatabase } from '@/lib/init-db'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando migración de base de datos...')
    
    const result = await initDatabase()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Base de datos inicializada correctamente',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error inicializando base de datos',
        details: result.error
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Error en init-db endpoint:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}

