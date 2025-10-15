import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Test Apple Pay endpoint',
    timestamp: new Date().toISOString(),
  })
}

