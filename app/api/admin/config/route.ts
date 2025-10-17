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

    // YA NO necesitamos actualizar Vercel - las credenciales se leen de la BD
    let vercelUpdateStatus = '✅ Configuración guardada. Los cambios se aplican inmediatamente.'
    let shouldDeploy = false
    
    if (false) { // Desactivado - ya no usamos Vercel API
      try {
        console.log('🔄 Actualizando variables de entorno en Vercel...')
        
        // Mapear configuración a variables de entorno de Vercel
        // Ahora usamos variables separadas para TEST y PRODUCTION
        const envVars = [
          // Variables de TEST
          { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST', value: config.stripe_test_publishable_key },
          { key: 'STRIPE_SECRET_KEY_TEST', value: config.stripe_test_secret_key },
          { key: 'STRIPE_WEBHOOK_SECRET_TEST', value: config.stripe_test_webhook_secret },
          { key: 'STRIPE_PRICE_ID_TEST', value: config.stripe_test_price_id },
          // Variables de PRODUCTION (sin sufijo _TEST)
          { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', value: config.stripe_live_publishable_key },
          { key: 'STRIPE_SECRET_KEY', value: config.stripe_live_secret_key },
          { key: 'STRIPE_WEBHOOK_SECRET', value: config.stripe_live_webhook_secret },
          { key: 'STRIPE_PRICE_ID', value: config.stripe_live_price_id },
          // Variable para indicar el modo activo
          { key: 'STRIPE_MODE', value: config.stripe_mode },
        ]

        // Paso 1: Obtener todas las variables de entorno existentes
        console.log('📥 Obteniendo variables existentes de Vercel...')
        const getEnvResponse = await fetch(
          `https://api.vercel.com/v9/projects/${vercelProjectId}/env`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        let existingEnvVars: any[] = []
        if (getEnvResponse.ok) {
          const envData = await getEnvResponse.json()
          existingEnvVars = envData.envs || []
          console.log(`✅ Encontradas ${existingEnvVars.length} variables en Vercel`)
        } else {
          console.error('❌ Error obteniendo variables:', await getEnvResponse.text())
        }

        // Paso 2: Actualizar o crear cada variable
        let updateErrors = 0
        for (const envVar of envVars) {
          if (envVar.value) {
            try {
              // Buscar si la variable ya existe
              const existingVar = existingEnvVars.find(v => v.key === envVar.key)
              
              if (existingVar) {
                // Actualizar variable existente usando su ID
                console.log(`🔄 Actualizando ${envVar.key} (ID: ${existingVar.id})...`)
                const updateResponse = await fetch(
                  `https://api.vercel.com/v9/projects/${vercelProjectId}/env/${existingVar.id}`,
                  {
                    method: 'PATCH',
                    headers: {
                      'Authorization': `Bearer ${vercelToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      value: envVar.value,
                      target: ['production', 'preview', 'development']
                    })
                  }
                )

                if (updateResponse.ok) {
                  console.log(`✅ Variable ${envVar.key} actualizada exitosamente`)
                } else {
                  const errorText = await updateResponse.text()
                  console.error(`❌ Error actualizando ${envVar.key}:`, errorText)
                  updateErrors++
                }
              } else {
                // Crear nueva variable
                console.log(`➕ Creando nueva variable ${envVar.key}...`)
                const createResponse = await fetch(
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
                      target: ['production', 'preview', 'development'],
                      type: 'encrypted'
                    })
                  }
                )

                if (createResponse.ok) {
                  console.log(`✅ Variable ${envVar.key} creada exitosamente`)
                } else {
                  const errorText = await createResponse.text()
                  console.error(`❌ Error creando ${envVar.key}:`, errorText)
                  updateErrors++
                }
              }
            } catch (varError) {
              console.error(`❌ Error procesando ${envVar.key}:`, varError)
              updateErrors++
            }
          }
        }

        console.log(`📊 Resumen: ${envVars.length - updateErrors}/${envVars.length} variables actualizadas correctamente`)

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
          shouldDeploy = false // Ya se hizo deploy
          vercelUpdateStatus = `✅ Variables actualizadas y deploy iniciado`
        } else {
          const errorText = await deployResponse.text()
          console.error('Error en deploy:', errorText)
          shouldDeploy = true // Marcar que se necesita deploy manual
          vercelUpdateStatus = '✅ Variables actualizadas. Usa el botón "🚀 Deploy Manual" para aplicar cambios'
        }
      } catch (vercelError: any) {
        console.error('Error actualizando Vercel:', vercelError)
        shouldDeploy = true
        vercelUpdateStatus = `💾 Guardado en BD. ${vercelError.message}. Usa el botón "🚀 Deploy Manual"`
      }
    } else if (vercelDeployHook) {
      // Si no hay token pero hay deploy hook, intentar deploy
      try {
        console.log('🚀 Usando Deploy Hook...')
        const hookResponse = await fetch(vercelDeployHook, { method: 'POST' })
        if (hookResponse.ok) {
          shouldDeploy = false
          vercelUpdateStatus = '✅ Guardado y deploy iniciado automáticamente'
        } else {
          shouldDeploy = true
          vercelUpdateStatus = '💾 Guardado en BD. Usa el botón "🚀 Deploy Manual"'
        }
      } catch (hookError) {
        shouldDeploy = true
        vercelUpdateStatus = '💾 Guardado en BD. Usa el botón "🚀 Deploy Manual"'
      }
    } else {
      shouldDeploy = true
      vercelUpdateStatus = '💾 Guardado en BD. Usa el botón "🚀 Deploy Manual" para aplicar cambios'
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

