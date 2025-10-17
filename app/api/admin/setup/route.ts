import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

// GET - Configurar email de administrador
// Uso: /api/admin/setup?email=tu@email.com
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Falta el parámetro email',
        usage: 'GET /api/admin/setup?email=tu@email.com'
      }, { status: 400 })
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Email inválido',
        email: email
      }, { status: 400 })
    }

    // Obtener configuración actual de admin_emails
    const currentAdmins = await db.getConfigByKey('admin_emails')
    
    let newAdmins = email
    
    // Si ya hay admins, añadir el nuevo separado por coma
    if (currentAdmins && currentAdmins.trim() !== '') {
      const adminList = currentAdmins.split(',').map(e => e.trim())
      
      // Verificar si el email ya existe
      if (adminList.includes(email)) {
        return NextResponse.json({ 
          message: 'Este email ya es administrador',
          email: email,
          current_admins: currentAdmins
        }, { status: 200 })
      }
      
      // Añadir el nuevo email
      adminList.push(email)
      newAdmins = adminList.join(', ')
    }

    // Actualizar configuración
    await db.setConfig('admin_emails', newAdmins, 'setup-endpoint')

    // Verificar que se guardó
    const updatedAdmins = await db.getConfigByKey('admin_emails')

    return NextResponse.json({ 
      success: true,
      message: '✅ Email añadido como administrador exitosamente',
      email: email,
      admin_emails: updatedAdmins,
      next_steps: [
        '1. Inicia sesión en /es/login con este email',
        '2. Ve a /es/admin para acceder al panel',
        '3. ⚠️ IMPORTANTE: Elimina este endpoint después (app/api/admin/setup/route.ts)'
      ]
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error configurando admin:', error)
    return NextResponse.json({ 
      error: 'Error configurando administrador',
      details: error.message 
    }, { status: 500 })
  }
}

// POST - Eliminar este endpoint (auto-destrucción)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    message: '⚠️ Para eliminar este endpoint, borra el archivo: app/api/admin/setup/route.ts',
    security_note: 'Este endpoint debe ser eliminado después de la configuración inicial por razones de seguridad'
  }, { status: 200 })
}

