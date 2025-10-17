import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Verificar si el usuario actual es administrador
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        isAdmin: false,
        message: 'No autenticado' 
      }, { status: 200 })
    }

    // Verificar si es administrador
    const isAdmin = await db.isAdmin(session.user.email)

    return NextResponse.json({ 
      isAdmin,
      email: session.user.email 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error verificando admin:', error)
    return NextResponse.json({ 
      isAdmin: false,
      error: 'Error verificando permisos' 
    }, { status: 500 })
  }
}

