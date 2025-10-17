import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// GET - Establecer el modo de Stripe (test o production)
// Uso: /api/admin/set-mode?mode=production
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('mode')
    
    if (!mode || (mode !== 'test' && mode !== 'production')) {
      return NextResponse.json({ 
        error: 'Parámetro mode inválido. Usa: test o production',
        usage: 'GET /api/admin/set-mode?mode=production'
      }, { status: 400 })
    }

    // Actualizar el modo en la base de datos
    await db.setConfig('stripe_mode', mode, 'set-mode-endpoint')

    // Verificar que se guardó
    const currentMode = await db.getConfigByKey('stripe_mode')

    return NextResponse.json({ 
      success: true,
      message: `✅ Modo de Stripe configurado correctamente`,
      current_mode: currentMode,
      note: 'Ahora el panel de admin mostrará las credenciales correctas según el modo',
      next_step: 'Recarga el panel de admin para ver los cambios'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error configurando modo:', error)
    return NextResponse.json({ 
      error: 'Error configurando modo',
      details: error.message 
    }, { status: 500 })
  }
}

