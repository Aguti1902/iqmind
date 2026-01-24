import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

/**
 * Cron Job para cobrar suscripciones vencidas
 * 
 * Configurar en Vercel:
 * - Path: /api/cron/charge-subscriptions
 * - Schedule: 0 */6 * * * (cada 6 horas)
 * 
 * Agregar variable de entorno:
 * CRON_SECRET=tu_secret_aleatorio
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación del cron
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET) {
      console.error('❌ CRON_SECRET no configurado')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== expectedAuth) {
      console.error('❌ Autenticación de cron inválida')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Iniciando cobro de suscripciones...')

    const now = new Date()
    const results = {
      checked: 0,
      charged: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // 1. Buscar usuarios con trial vencido
    console.log('📋 Buscando usuarios con trial vencido...')
    
    const usersWithExpiredTrial = await db.query(`
      SELECT 
        id, 
        email, 
        subscription_id as "subscriptionId",
        trial_end_date as "trialEndDate"
      FROM users
      WHERE subscription_status = 'trial'
        AND trial_end_date <= $1
        AND subscription_id IS NOT NULL
    `, [now.toISOString()])

    console.log(`📊 Encontrados ${usersWithExpiredTrial.length} usuarios con trial vencido`)

    // 2. Cobrar a cada usuario
    for (const user of usersWithExpiredTrial) {
      results.checked++

      try {
        console.log(`💳 Procesando cobro para: ${user.email}`)

        // Llamar al endpoint de pago recurrente
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sipay/recurring-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: 9.99,
            description: 'Suscripción mensual MindMetric Premium'
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          results.charged++
          console.log(`✅ Cobro exitoso: ${user.email} - ${data.transactionId}`)
        } else {
          results.failed++
          const errorMsg = `${user.email}: ${data.error || 'Unknown error'}`
          results.errors.push(errorMsg)
          console.error(`❌ Cobro fallido: ${errorMsg}`)
        }
      } catch (error: any) {
        results.failed++
        const errorMsg = `${user.email}: ${error.message}`
        results.errors.push(errorMsg)
        console.error(`❌ Error procesando ${user.email}:`, error)
      }
    }

    // 3. Buscar usuarios con suscripción activa que necesitan renovación
    console.log('📋 Buscando suscripciones activas a renovar...')

    const usersToRenew = await db.query(`
      SELECT 
        id, 
        email, 
        subscription_id as "subscriptionId",
        access_until as "accessUntil"
      FROM users
      WHERE subscription_status = 'active'
        AND access_until <= $1
        AND subscription_id IS NOT NULL
    `, [now.toISOString()])

    console.log(`📊 Encontrados ${usersToRenew.length} usuarios a renovar`)

    // 4. Renovar cada suscripción
    for (const user of usersToRenew) {
      results.checked++

      try {
        console.log(`🔄 Renovando suscripción: ${user.email}`)

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sipay/recurring-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: 9.99,
            description: 'Renovación mensual MindMetric Premium'
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          results.charged++
          console.log(`✅ Renovación exitosa: ${user.email} - ${data.transactionId}`)
        } else {
          results.failed++
          const errorMsg = `${user.email}: ${data.error || 'Unknown error'}`
          results.errors.push(errorMsg)
          console.error(`❌ Renovación fallida: ${errorMsg}`)
        }
      } catch (error: any) {
        results.failed++
        const errorMsg = `${user.email}: ${error.message}`
        results.errors.push(errorMsg)
        console.error(`❌ Error renovando ${user.email}:`, error)
      }
    }

    // 5. Resumen
    console.log('📊 Resumen del cron job:')
    console.log(`   ✅ Cobrados: ${results.charged}`)
    console.log(`   ❌ Fallidos: ${results.failed}`)
    console.log(`   ⏭️  Omitidos: ${results.skipped}`)
    console.log(`   📋 Total revisados: ${results.checked}`)

    return NextResponse.json({
      success: true,
      summary: {
        checked: results.checked,
        charged: results.charged,
        failed: results.failed,
        skipped: results.skipped,
      },
      errors: results.errors,
      timestamp: now.toISOString(),
    })

  } catch (error: any) {
    console.error('❌ Error en cron job:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Error en cron job',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

