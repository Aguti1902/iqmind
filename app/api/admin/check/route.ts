import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Verificar si el usuario actual es administrador
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación mediante token en cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ 
        isAdmin: false,
        message: 'No autenticado' 
      }, { status: 200 })
    }

    const userData = verifyToken(token)
    
    if (!userData) {
      return NextResponse.json({ 
        isAdmin: false,
        message: 'Token inválido' 
      }, { status: 200 })
    }

    // Verificar si es administrador
    const isAdmin = await db.isAdmin(userData.email)

    return NextResponse.json({ 
      isAdmin,
      email: userData.email 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error verificando admin:', error)
    return NextResponse.json({ 
      isAdmin: false,
      error: 'Error verificando permisos' 
    }, { status: 500 })
  }
}

