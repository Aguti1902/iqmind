import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

async function ensurePurchasesTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(255),
      order_id VARCHAR(255),
      user_email VARCHAR(255) NOT NULL,
      user_name VARCHAR(255),
      test_type VARCHAR(50) NOT NULL DEFAULT 'iq',
      amount DECIMAL(10,2) NOT NULL DEFAULT 0.90,
      currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)
}

async function recordPurchase(pool: Pool, data: {
  transactionId: string | null
  orderId: string | null
  email: string
  userName: string
  testType: string
}) {
  await ensurePurchasesTable(pool)
  await pool.query(
    `INSERT INTO purchases (transaction_id, order_id, user_email, user_name, test_type, amount, currency, status)
     VALUES ($1, $2, $3, $4, $5, 0.90, 'EUR', 'completed')`,
    [data.transactionId, data.orderId, data.email, data.userName, data.testType]
  )
}

/**
 * PASO 2: Confirmar pago después de 3DS
 * 
 * Sipay redirige aquí después de que el usuario complete la autenticación 3DS.
 * Este endpoint:
 * 1. Llama a /all-in-one/confirm para capturar los fondos
 * 2. Solo si el confirm es exitoso: activa el trial del usuario
 * 3. Envía emails
 * 4. Redirige al usuario a la página de resultados
 * 
 * URL esperada de Sipay: /api/sipay/confirm-payment?order_id=xxx&email=xxx&lang=es&test_type=iq&request_id=xxx
 */
export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://mindmetric.io'
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Log ALL query parameters to understand what Sipay sends
    const allParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      allParams[key] = value
    })
    console.log('🔄 [confirm-payment] TODOS los parámetros recibidos:', JSON.stringify(allParams))

    const requestId = searchParams.get('request_id')
    const orderId = searchParams.get('order_id')
    const email = searchParams.get('email')
    const lang = searchParams.get('lang') || 'es'
    const testType = searchParams.get('test_type') || 'iq'
    // El tokenId fue generado en process-payment y pasado en la URL para garantizar
    // que guardamos el token correcto aunque Sipay no lo devuelva en el confirm response
    const urlCardTokenId = searchParams.get('card_token_id')

    console.log('🔄 [confirm-payment] Datos:', { requestId, orderId, email, lang, testType, urlCardTokenId })

    // Si hay error de 3DS (Sipay redirigió a url_ko)
    if (searchParams.get('error')) {
      console.error('❌ [confirm-payment] 3DS falló:', searchParams.get('error'))
      return NextResponse.redirect(
        `${origin}/${lang}/checkout-payment?error=3ds_failed&email=${encodeURIComponent(email || '')}`
      )
    }

    if (!requestId) {
      console.error('❌ [confirm-payment] No hay request_id en el callback de Sipay. Params:', allParams)
      // Redirigir con error claro
      return NextResponse.redirect(
        `${origin}/${lang}/checkout-payment?error=no_request_id&email=${encodeURIComponent(email || '')}`
      )
    }

    // Llamar a /all-in-one/confirm para capturar fondos
    const sipay = getSipayClient()
    let transactionId: string | null = null
    let cardToken: string | null = null
    let cofId: string | null = null
    let confirmSuccessful = false

    try {
      console.log('📤 [confirm-payment] Confirmando pago con request_id:', requestId)
      const confirmResult = await sipay.confirmPayment(requestId)
      console.log('📥 [confirm-payment] Confirm result:', JSON.stringify(confirmResult))

      transactionId = confirmResult?.payload?.transaction_id || confirmResult?.payload?.id_transaction || null
      // Prioridad: 1) tokenId de la URL (el que enviamos a Sipay), 2) lo que Sipay devuelva
      cardToken = urlCardTokenId || confirmResult?.payload?.token || confirmResult?.payload?.card_token || null
      // cof_id: obligatorio para futuros cobros MIT bajo PSD2 — guardar junto al token
      cofId = confirmResult?.payload?.cof_id || null
      confirmSuccessful = true

      console.log('✅ [confirm-payment] Pago CONFIRMADO! transaction_id:', transactionId, 'cardToken:', cardToken, 'cof_id:', cofId, '(fuente:', urlCardTokenId ? 'URL' : 'Sipay response', ')')
    } catch (confirmError: any) {
      console.error('❌ [confirm-payment] Error en confirm:', confirmError.message)
      // Si el confirm falla, NO activamos trial
      return NextResponse.redirect(
        `${origin}/${lang}/checkout-payment?error=confirm_failed&email=${encodeURIComponent(email || '')}`
      )
    }

    // Solo activar trial si el confirm fue EXITOSO
    if (confirmSuccessful && email) {
      // Registrar compra en la tabla purchases
      const purchasePool = getPool()
      try {
        const user0 = await db.getUserByEmail(email)
        await recordPurchase(purchasePool, {
          transactionId,
          orderId: orderId || null,
          email,
          userName: user0?.userName || email.split('@')[0],
          testType,
        })
        console.log('✅ [confirm-payment] Compra registrada en purchases:', { email, testType, transactionId })
      } catch (purchaseErr) {
        console.error('⚠️ [confirm-payment] Error registrando compra:', purchaseErr)
      } finally {
        await purchasePool.end().catch(() => {})
      }

      const user = await db.getUserByEmail(email)
      if (user) {
        const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        
        await db.updateUser(user.id, {
          subscriptionStatus: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          accessUntil: trialEndDate.toISOString(),
          // Guardamos token|cofId para poder hacer cobros MIT correctamente
          subscriptionId: cofId ? `${cardToken || requestId}|${cofId}` : (cardToken || requestId),
        })
        console.log('✅ [confirm-payment] Trial activado para:', email, 'hasta:', trialEndDate.toISOString())

        const userName = user.userName || email.split('@')[0]
        const trialEndFormatted = trialEndDate.toLocaleDateString(
          lang === 'es' ? 'es-ES' : 'en-US',
          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        )

        // Email de pago exitoso / test específico
        try {
          let testEmail
          switch (testType) {
            case 'personality':
              testEmail = emailTemplates.personalityTestResult(email, userName, lang)
              break
            case 'adhd':
              testEmail = emailTemplates.adhdTestResult(email, userName, lang)
              break
            case 'anxiety':
              testEmail = emailTemplates.anxietyTestResult(email, userName, lang)
              break
            case 'depression':
              testEmail = emailTemplates.depressionTestResult(email, userName, lang)
              break
            case 'eq':
              testEmail = emailTemplates.eqTestResult(email, userName, lang)
              break
            default:
              testEmail = emailTemplates.paymentSuccess(email, userName, 0.90, lang)
          }
          await sendEmail(testEmail)
          console.log(`📧 [confirm-payment] Email de test ${testType} enviado`)
        } catch (e) {
          console.error('⚠️ [confirm-payment] Error enviando email de test:', e)
        }

        // Email de trial
        try {
          const trialEmail = emailTemplates.trialStarted(email, userName, trialEndFormatted, lang, user.iq)
          await sendEmail(trialEmail)
          console.log('📧 [confirm-payment] Email de trial enviado')
        } catch (e) {
          console.error('⚠️ [confirm-payment] Error enviando email de trial:', e)
        }
      } else {
        console.error('⚠️ [confirm-payment] Usuario no encontrado:', email)
      }
    }

    // Redirigir al usuario a la página de resultados
    // Para tests no-IQ, ir directamente a su página de resultados específica
    let redirectUrl: string
    if (testType && testType !== 'iq') {
      redirectUrl = `${origin}/${lang}/tests/${testType}/results?payment=success&transaction_id=${transactionId || ''}`
    } else {
      redirectUrl = `${origin}/${lang}/resultado?order_id=${orderId || ''}&payment=success&transaction_id=${transactionId || ''}`
    }
    console.log('🔄 [confirm-payment] Redirigiendo a:', redirectUrl)
    
    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('❌ [confirm-payment] Error general:', error.message, error.stack)
    return NextResponse.redirect(`${origin}/es/checkout-payment?error=confirm_failed`)
  }
}
