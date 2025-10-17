import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ 
    success: true,
    message: 'Sesión cerrada exitosamente' 
  })

  // Eliminar la cookie de autenticación
  response.cookies.delete('auth_token')

  return response
}

