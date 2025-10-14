import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', '.well-known', 'apple-developer-merchantid-domain-association')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Error reading Apple Pay domain association file:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}

export const dynamic = 'force-static'
export const revalidate = 86400 // 24 hours

