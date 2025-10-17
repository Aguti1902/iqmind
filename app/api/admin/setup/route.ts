import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { hashPassword, generateRandomPassword } from '@/lib/auth'

// GET - Configurar email de administrador y crear usuario
// Uso: /api/admin/setup?email=tu@email.com&password=tuPassword123
// O sin password para generar una automáticamente: /api/admin/setup?email=tu@email.com
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const customPassword = searchParams.get('password')
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Falta el parámetro email',
        usage: 'GET /api/admin/setup?email=tu@email.com&password=tuPassword (opcional)'
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

    // Generar o usar la contraseña proporcionada
    const password = customPassword || generateRandomPassword()
    const hashedPassword = await hashPassword(password)

    // Verificar si el usuario ya existe
    let user = await db.getUserByEmail(email)
    let userAction = ''

    if (user) {
      // Usuario existe, actualizar contraseña
      await db.updateUser(user.id, {
        password: hashedPassword
      })
      userAction = '🔄 Usuario actualizado con nueva contraseña'
    } else {
      // Crear nuevo usuario
      user = await db.createUser({
        email: email,
        userName: 'Administrador',
        password: hashedPassword,
        subscriptionStatus: 'active',
        iq: 0
      })
      userAction = '✅ Nuevo usuario creado'
    }

    // Obtener configuración actual de admin_emails
    const currentAdmins = await db.getConfigByKey('admin_emails')
    
    let newAdmins = email
    let adminAction = ''
    
    // Si ya hay admins, añadir el nuevo separado por coma
    if (currentAdmins && currentAdmins.trim() !== '') {
      const adminList = currentAdmins.split(',').map(e => e.trim())
      
      // Verificar si el email ya existe
      if (adminList.includes(email)) {
        adminAction = '📋 Email ya estaba en lista de administradores'
        newAdmins = currentAdmins
      } else {
        // Añadir el nuevo email
        adminList.push(email)
        newAdmins = adminList.join(', ')
        adminAction = '✅ Email añadido a lista de administradores'
      }
    } else {
      adminAction = '✅ Email configurado como primer administrador'
    }

    // Actualizar configuración
    await db.setConfig('admin_emails', newAdmins, 'setup-endpoint')

    // Verificar que se guardó
    const updatedAdmins = await db.getConfigByKey('admin_emails')

    return NextResponse.json({ 
      success: true,
      message: '🎉 Configuración de administrador completada',
      actions: [userAction, adminAction],
      credentials: {
        email: email,
        password: customPassword ? '(la que proporcionaste)' : password,
        note: customPassword ? 'Usa la contraseña que proporcionaste' : '⚠️ GUARDA ESTA CONTRASEÑA - No la verás de nuevo'
      },
      admin_emails: updatedAdmins,
      next_steps: [
        `1. ${customPassword ? 'Usa tu contraseña' : 'GUARDA la contraseña mostrada arriba'}`,
        '2. Ve a https://iqmind.mobi/es/login',
        `3. Inicia sesión con: ${email}`,
        '4. Ve a https://iqmind.mobi/es/admin',
        '5. ⚠️ IMPORTANTE: Elimina este endpoint después (app/api/admin/setup/route.ts)'
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

