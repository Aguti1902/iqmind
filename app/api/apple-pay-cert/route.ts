import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const CERTS: Record<string, string> = {
  'mindmetric.io': 'apple-pay-cert-mindmetric.txt',
  'www.mindmetric.io': 'apple-pay-cert-mindmetric.txt',
  'iqmind-git-main-nexgents-projects.vercel.app': 'apple-pay-cert-vercel.txt',
}

const DEFAULT_CERT = 'apple-pay-cert-mindmetric.txt'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host')?.replace(/:\d+$/, '') || ''
  const certFile = CERTS[host] || DEFAULT_CERT

  try {
    const certPath = join(process.cwd(), 'public', '.well-known', certFile)
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
