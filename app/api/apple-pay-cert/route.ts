import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const certPath = join(process.cwd(), 'public', '.well-known', 'apple-pay-cert-mindmetric.txt')
    const content = readFileSync(certPath, 'utf-8')

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new NextResponse('Certificate not found', { status: 404 })
  }
}
