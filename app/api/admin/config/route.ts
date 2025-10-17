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
    // Ahora cada campo lee su variable correspondiente (TEST o LIVE)
    const config = {
      stripe_mode: currentMode,
      // Campos TEST siempre leen de variables _TEST
      stripe_test_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || dbConfig.stripe_test_publishable_key || '',
      stripe_test_secret_key: process.env.STRIPE_SECRET_KEY_TEST || dbConfig.stripe_test_secret_key || '',
      stripe_test_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET_TEST || dbConfig.stripe_test_webhook_secret || '',
      stripe_test_price_id: process.env.STRIPE_PRICE_ID_TEST || dbConfig.stripe_test_price_id || '',
      // Campos LIVE siempre leen de variables sin sufijo
      stripe_live_publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || dbConfig.stripe_live_publishable_key || '',
      stripe_live_secret_key: process.env.STRIPE_SECRET_KEY || dbConfig.stripe_live_secret_key || '',
      stripe_live_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || dbConfig.stripe_live_webhook_secret || '',
      stripe_live_price_id: process.env.STRIPE_PRICE_ID || dbConfig.stripe_live_price_id || '',
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

    // Actualizar TODA la configuración en base de datos (test y production)
    await db.setMultipleConfig(config, userData.email)

    console.log('✅ Configuración guardada en BD - TODO se lee de la BD ahora')

    // Trigger redeploy automático en Vercel
    let vercelUpdateStatus = '✅ Configuración guardada.'
    let shouldDeploy = false
    
    const vercelDeployHook = process.env.VERCEL_DEPLOY_HOOK
    
    if (vercelDeployHook) {
      try {
        console.log('🚀 Iniciando redeploy automático en Vercel...')
        const deployResponse = await fetch(vercelDeployHook, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (deployResponse.ok) {
          console.log('✅ Redeploy iniciado exitosamente')
          vercelUpdateStatus = '✅ Configuración guardada. Redeploy iniciado automáticamente (~2 minutos).'
          shouldDeploy = false
        } else {
          console.error('❌ Error en redeploy:', await deployResponse.text())
          vercelUpdateStatus = '✅ Configuración guardada. Usa el botón "🚀 Deploy Manual"'
          shouldDeploy = true
        }
      } catch (error: any) {
        console.error('❌ Error triggering deploy:', error)
        vercelUpdateStatus = '✅ Configuración guardada. Usa el botón "🚀 Deploy Manual"'
        shouldDeploy = true
      }
    } else {
      console.log('⚠️ VERCEL_DEPLOY_HOOK no configurado')
      vercelUpdateStatus = '✅ Configuración guardada. Los cambios de credenciales se aplican inmediatamente. Para cambios de precios/días, usa el botón "🚀 Deploy Manual"'
      shouldDeploy = true
    }

    // Obtener configuración actualizada
    const updatedConfig = await db.getAllConfig()

    return NextResponse.json({ 
      success: true,
      message: 'Configuración actualizada exitosamente',
      vercelStatus: vercelUpdateStatus,
      needsManualDeploy: shouldDeploy,
      config: updatedConfig,
      note: shouldDeploy 
        ? 'Haz click en "🚀 Deploy Manual" para aplicar los cambios en producción'
        : 'Los cambios se aplicarán en ~2 minutos (redeploy en progreso)'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error actualizando configuración:', error)
    return NextResponse.json({ 
      error: 'Error actualizando configuración',
      details: error.message 
    }, { status: 500 })
  }
}

