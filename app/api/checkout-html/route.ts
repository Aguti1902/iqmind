import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Leer el HTML desde public
    const htmlPath = join(process.cwd(), 'public', 'checkout-sipay.html')
    const htmlContent = readFileSync(htmlPath, 'utf-8')

    // Devolver HTML con headers correctos
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error leyendo checkout HTML:', error)
    return new NextResponse('Error loading checkout', { status: 500 })
  }
}

