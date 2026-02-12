import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint para verificar la configuración de Sipay
 * GET /api/sipay/debug
 */
export async function GET(request: NextRequest) {
  const config = {
    SIPAY_API_KEY: process.env.SIPAY_API_KEY ? '✅ Set (' + process.env.SIPAY_API_KEY + ')' : '❌ Missing',
    SIPAY_API_SECRET: process.env.SIPAY_API_SECRET ? '✅ Set (hidden)' : '❌ Missing',
    SIPAY_RESOURCE: process.env.SIPAY_RESOURCE ? '✅ Set (' + process.env.SIPAY_RESOURCE + ')' : '❌ Missing',
    SIPAY_ENDPOINT: process.env.SIPAY_ENDPOINT || 'https://sandbox.sipay.es (default)',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config,
    notes: [
      'El flujo de pago es: FastPay (tokenización) → process-payment (all-in-one) → 3DS redirect → confirm-payment (confirm)',
      'Sipay debe redirigir a url_ok con request_id después de 3DS',
      'Solo se activa el trial si el confirm es exitoso',
    ]
  })
}
