import { NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import bcrypt from 'bcryptjs'

/**
 * Endpoint para crear un usuario administrador
 * 
 * Crea un usuario con credenciales predefinidas y lo añade a la lista de admins
 * 
 * Credenciales generadas:
 * - Email: admin@mindmetric.io
 * - Password: Admin2024!MindMetric
 */
export async function POST() {
  try {
    // Credenciales del administrador
    const adminEmail = 'admin@mindmetric.io'
    const adminPassword = 'Admin2024!MindMetric'
    const adminName = 'Administrador'

    console.log('🔐 Creando usuario administrador...')

    // 1. Verificar si el usuario ya existe
    const existingUser = await db.getUserByEmail(adminEmail)
    
    if (existingUser) {
      console.log('⚠️ El usuario administrador ya existe')
      return NextResponse.json({
        success: false,
        message: 'El usuario administrador ya existe',
        credentials: {
          email: adminEmail,
          password: adminPassword,
          note: 'Usa estas credenciales para iniciar sesión'
        }
      }, { status: 200 })
    }

    // 2. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // 3. Crear el usuario
    const user = await db.createUser({
      email: adminEmail,
      password: hashedPassword,
      userName: adminName,
      subscriptionStatus: 'active', // Usuario activo sin restricciones
      iq: 0
    })

    console.log('✅ Usuario administrador creado:', user.id)

    // 4. Añadir email a la lista de administradores
    const currentAdmins = await db.getConfigByKey('admin_emails')
    const adminsList = currentAdmins || ''
    
    // Añadir el nuevo admin si no está ya en la lista
    if (!adminsList.includes(adminEmail)) {
      const newAdminsList = adminsList 
        ? `${adminsList},${adminEmail}` 
        : adminEmail

      await db.updateConfig('admin_emails', newAdminsList, 'system')
      console.log('✅ Email añadido a la lista de administradores')
    }

    // 5. Retornar credenciales
    return NextResponse.json({
      success: true,
      message: 'Usuario administrador creado exitosamente',
      credentials: {
        email: adminEmail,
        password: adminPassword,
        note: 'Guarda estas credenciales en un lugar seguro. Podrás cambiar la contraseña después de iniciar sesión.'
      },
      accessUrl: {
        login: '/es/login',
        admin: '/es/admin'
      }
    })

  } catch (error: any) {
    console.error('❌ Error creando usuario administrador:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

