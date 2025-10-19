// app/api/admin/reset-admin/route.ts
// ENDPOINT TEMPORAL para crear/resetear usuario admin
// Eliminar después de usarlo por seguridad

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email y contraseña son requeridos'
      }, { status: 400 })
    }

    console.log('🔧 Intentando crear/actualizar admin:', email)

    // Verificar si el usuario existe
    const existingUser = await db.getUserByEmail(email)

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    if (existingUser) {
      // Usuario existe, actualizar contraseña
      console.log('👤 Usuario existe, actualizando contraseña...')
      
      await db.updateUser(existingUser.id, {
        password: hashedPassword
      })

      console.log('✅ Contraseña actualizada')
    } else {
      // Usuario no existe, crear nuevo
      console.log('➕ Usuario no existe, creando nuevo...')
      
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      await db.createUser({
        id: userId,
        email: email,
        password: hashedPassword,
        userName: email.split('@')[0],
        iq: 0,
        subscriptionStatus: 'active',
        subscriptionId: undefined,
        trialEndDate: undefined,
        accessUntil: undefined,
        lastLogin: undefined
      })

      console.log('✅ Usuario creado')
    }

    // Añadir el email a la lista de admins
    console.log('🔐 Añadiendo a lista de admins...')
    
    const currentAdmins = await db.getConfigByKey('admin_emails')
    let adminEmails = currentAdmins ? currentAdmins.split(',').map(e => e.trim()).filter(e => e) : []
    
    if (!adminEmails.includes(email)) {
      adminEmails.push(email)
      await db.setConfig('admin_emails', adminEmails.join(','), 'system')
      console.log('✅ Añadido a lista de admins')
    } else {
      console.log('ℹ️ Ya estaba en lista de admins')
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario admin creado/actualizado exitosamente',
      email: email,
      note: 'Ya puedes iniciar sesión con estas credenciales',
      warning: '⚠️ IMPORTANTE: Elimina este endpoint después de usarlo (app/api/admin/reset-admin/route.ts)'
    }, { status: 200 })

  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      error: 'Error creando/actualizando usuario admin',
      details: error.message
    }, { status: 500 })
  }
}

