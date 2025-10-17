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

    // Actualizar TODA la configuración en base de datos (test y production)
    await db.setMultipleConfig(config, userData.email)

    // Intentar actualizar variables de entorno en Vercel Y hacer deploy
    const vercelToken = process.env.VERCEL_TOKEN
    const vercelProjectId = process.env.VERCEL_PROJECT_ID
    
    let vercelUpdateStatus = '💾 Guardado en BD (Configura VERCEL_TOKEN para auto-deploy)'
    
    if (vercelToken && vercelProjectId) {
      try {
        console.log('🔄 Actualizando variables de entorno en Vercel...')
        
        // Mapear configuración a variables de entorno de Vercel (solo del modo activo)
        const activePublishableKey = config.stripe_mode === 'test' 
          ? config.stripe_test_publishable_key 
          : config.stripe_live_publishable_key
        
        const activeSecretKey = config.stripe_mode === 'test' 
          ? config.stripe_test_secret_key 
          : config.stripe_live_secret_key
        
        const activeWebhookSecret = config.stripe_mode === 'test' 
          ? config.stripe_test_webhook_secret 
          : config.stripe_live_webhook_secret
        
        const activePriceId = config.stripe_mode === 'test' 
          ? config.stripe_test_price_id 
          : config.stripe_live_price_id

        const envVars = [
          { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', value: activePublishableKey },
          { key: 'STRIPE_SECRET_KEY', value: activeSecretKey },
          { key: 'STRIPE_WEBHOOK_SECRET', value: activeWebhookSecret },
          { key: 'STRIPE_PRICE_ID', value: activePriceId },
        ]

        // Actualizar cada variable de entorno en Vercel usando UPSERT
        let updateErrors = 0
        for (const envVar of envVars) {
          if (envVar.value) {
            try {
              // Primero intentar actualizar
              const updateResponse = await fetch(
                `https://api.vercel.com/v9/projects/${vercelProjectId}/env/${envVar.key}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${vercelToken}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    value: envVar.value,
                    target: ['production']
                  })
                }
              )

              // Si no existe, crear
              if (!updateResponse.ok && updateResponse.status === 404) {
                await fetch(
                  `https://api.vercel.com/v10/projects/${vercelProjectId}/env`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${vercelToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      key: envVar.key,
                      value: envVar.value,
                      target: ['production'],
                      type: 'encrypted'
                    })
                  }
                )
              }
              
              console.log(`✅ Variable ${envVar.key} actualizada`)
            } catch (varError) {
              console.error(`Error actualizando ${envVar.key}:`, varError)
              updateErrors++
            }
          }
        }

        // Trigger redeploy en Vercel
        console.log('🚀 Iniciando redeploy en Vercel...')
        const deployResponse = await fetch(
          `https://api.vercel.com/v13/deployments`,
          {
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
              },
              target: 'production'
            })
          }
        )

        if (deployResponse.ok) {
          const deployData = await deployResponse.json()
          console.log('✅ Deploy iniciado:', deployData.id)
          vercelUpdateStatus = `✅ Variables actualizadas en Vercel (${updateErrors > 0 ? 'con algunos errores' : 'exitosamente'}) y redeploy iniciado`
        } else {
          const errorText = await deployResponse.text()
          console.error('Error en deploy:', errorText)
          vercelUpdateStatus = '⚠️ Variables actualizadas pero hubo un problema iniciando el deploy'
        }
      } catch (vercelError: any) {
        console.error('Error actualizando Vercel:', vercelError)
        vercelUpdateStatus = `⚠️ Guardado en BD, pero error con Vercel: ${vercelError.message}`
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

