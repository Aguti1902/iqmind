import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener toda la configuración (desde variables de entorno + base de datos)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación mediante token en cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userData = verifyToken(token)
    
    if (!userData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar si es administrador
    const isAdmin = await db.isAdmin(userData.email)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener configuración de la base de datos
    const dbConfig = await db.getAllConfig()

    // Determinar el modo actual (desde BD o desde las variables que están activas)
    const currentMode = dbConfig.stripe_mode || 'test'
    
    // Combinar con variables de entorno
    // Las variables de entorno actuales reflejan el modo activo en Vercel
    const config = {
      stripe_mode: currentMode,
      // Si el modo es test, las variables actuales son de test
      stripe_test_publishable_key: currentMode === 'test' 
        ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || dbConfig.stripe_test_publishable_key || '')
        : (dbConfig.stripe_test_publishable_key || ''),
      stripe_test_secret_key: currentMode === 'test'
        ? (process.env.STRIPE_SECRET_KEY || dbConfig.stripe_test_secret_key || '')
        : (dbConfig.stripe_test_secret_key || ''),
      stripe_test_webhook_secret: currentMode === 'test'
        ? (process.env.STRIPE_WEBHOOK_SECRET || dbConfig.stripe_test_webhook_secret || '')
        : (dbConfig.stripe_test_webhook_secret || ''),
      stripe_test_price_id: currentMode === 'test'
        ? (process.env.STRIPE_PRICE_ID || dbConfig.stripe_test_price_id || '')
        : (dbConfig.stripe_test_price_id || ''),
      // Si el modo es production, las variables actuales son de production
      stripe_live_publishable_key: currentMode === 'production'
        ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || dbConfig.stripe_live_publishable_key || '')
        : (dbConfig.stripe_live_publishable_key || ''),
      stripe_live_secret_key: currentMode === 'production'
        ? (process.env.STRIPE_SECRET_KEY || dbConfig.stripe_live_secret_key || '')
        : (dbConfig.stripe_live_secret_key || ''),
      stripe_live_webhook_secret: currentMode === 'production'
        ? (process.env.STRIPE_WEBHOOK_SECRET || dbConfig.stripe_live_webhook_secret || '')
        : (dbConfig.stripe_live_webhook_secret || ''),
      stripe_live_price_id: currentMode === 'production'
        ? (process.env.STRIPE_PRICE_ID || dbConfig.stripe_live_price_id || '')
        : (dbConfig.stripe_live_price_id || ''),
      subscription_price: dbConfig.subscription_price || '9.99',
      trial_days: '2', // Valor correcto: 2 días
      initial_payment: dbConfig.initial_payment || '0.50',
      admin_emails: dbConfig.admin_emails || ''
    }

    return NextResponse.json({ 
      config,
      source: 'Variables de entorno actuales de Vercel'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error obteniendo configuración:', error)
    return NextResponse.json({ 
      error: 'Error obteniendo configuración',
      details: error.message 
    }, { status: 500 })
  }
}

// POST - Actualizar configuración y variables de entorno en Vercel
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación mediante token en cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userData = verifyToken(token)
    
    if (!userData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar si es administrador
    const isAdmin = await db.isAdmin(userData.email)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { config } = body

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Configuración inválida' }, { status: 400 })
    }

    // Actualizar configuración en base de datos
    await db.setMultipleConfig(config, userData.email)

    // Intentar actualizar variables de entorno en Vercel
    const vercelToken = process.env.VERCEL_TOKEN
    const vercelProjectId = process.env.VERCEL_PROJECT_ID
    
    let vercelUpdateStatus = 'No configurado (actualizado solo en BD)'
    
    if (vercelToken && vercelProjectId) {
      try {
        // Mapear configuración a variables de entorno de Vercel
        const envVars = [
          { 
            key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 
            value: config.stripe_mode === 'test' ? config.stripe_test_publishable_key : config.stripe_live_publishable_key 
          },
          { 
            key: 'STRIPE_SECRET_KEY', 
            value: config.stripe_mode === 'test' ? config.stripe_test_secret_key : config.stripe_live_secret_key 
          },
          { 
            key: 'STRIPE_WEBHOOK_SECRET', 
            value: config.stripe_mode === 'test' ? config.stripe_test_webhook_secret : config.stripe_live_webhook_secret 
          },
          { 
            key: 'STRIPE_PRICE_ID', 
            value: config.stripe_mode === 'test' ? config.stripe_test_price_id : config.stripe_live_price_id 
          },
        ]

        // Actualizar cada variable de entorno en Vercel
        for (const envVar of envVars) {
          if (envVar.value) {
            await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env/${envVar.key}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                value: envVar.value,
                target: ['production', 'preview', 'development']
              })
            })
          }
        }

        // Trigger redeploy en Vercel
        const deployResponse = await fetch(`https://api.vercel.com/v13/deployments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: vercelProjectId,
            gitSource: {
              type: 'github',
              ref: 'main'
            }
          })
        })

        if (deployResponse.ok) {
          vercelUpdateStatus = '✅ Variables de entorno actualizadas en Vercel y redeploy iniciado'
        } else {
          vercelUpdateStatus = '⚠️ Actualizado en BD, pero hubo un problema con Vercel'
        }
      } catch (vercelError) {
        console.error('Error actualizando Vercel:', vercelError)
        vercelUpdateStatus = '⚠️ Actualizado en BD, pero fallo al actualizar Vercel'
      }
    }

    // Obtener configuración actualizada
    const updatedConfig = await db.getAllConfig()

    return NextResponse.json({ 
      success: true,
      message: 'Configuración actualizada exitosamente',
      vercelStatus: vercelUpdateStatus,
      config: updatedConfig,
      note: vercelToken ? 'Los cambios se aplicarán en ~2 minutos (redeploy en progreso)' : 'Configura VERCEL_TOKEN y VERCEL_PROJECT_ID para actualizaciones automáticas'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error actualizando configuración:', error)
    return NextResponse.json({ 
      error: 'Error actualizando configuración',
      details: error.message 
    }, { status: 500 })
  }
}

