import { NextRequest, NextResponse } from 'next/server'
import { getSipayClient } from '@/lib/sipay-client'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

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

    console.log('🔄 [confirm-payment] Datos:', { requestId, orderId, email, lang, testType })

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
    let confirmSuccessful = false

    try {
      console.log('📤 [confirm-payment] Confirmando pago con request_id:', requestId)
      const confirmResult = await sipay.confirmPayment(requestId)
      console.log('📥 [confirm-payment] Confirm result:', JSON.stringify(confirmResult))

      transactionId = confirmResult?.payload?.transaction_id || confirmResult?.payload?.id_transaction || null
      cardToken = confirmResult?.payload?.token || confirmResult?.payload?.card_token || null
      confirmSuccessful = true

      console.log('✅ [confirm-payment] Pago CONFIRMADO! transaction_id:', transactionId, 'token:', cardToken)
    } catch (confirmError: any) {
      console.error('❌ [confirm-payment] Error en confirm:', confirmError.message)
      // Si el confirm falla, NO activamos trial
      return NextResponse.redirect(
        `${origin}/${lang}/checkout-payment?error=confirm_failed&email=${encodeURIComponent(email || '')}`
      )
    }

    // Solo activar trial si el confirm fue EXITOSO
    if (confirmSuccessful && email) {
      const user = await db.getUserByEmail(email)
      if (user) {
        const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        
        await db.updateUser(user.id, {
          subscriptionStatus: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          accessUntil: trialEndDate.toISOString(),
          subscriptionId: cardToken || requestId,
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
              testEmail = emailTemplates.paymentSuccess(email, userName, 0.50, lang)
          }
          await sendEmail(testEmail)
          console.log(`📧 [confirm-payment] Email de test ${testType} enviado`)
        } catch (e) {
          console.error('⚠️ [confirm-payment] Error enviando email de test:', e)
        }

        // Email de trial
        try {
          const trialEmail = emailTemplates.trialStarted(email, userName, trialEndFormatted, lang)
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
    const redirectUrl = `${origin}/${lang}/resultado?order_id=${orderId || ''}&payment=success&transaction_id=${transactionId || ''}`
    console.log('🔄 [confirm-payment] Redirigiendo a:', redirectUrl)
    
    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('❌ [confirm-payment] Error general:', error.message, error.stack)
    return NextResponse.redirect(`${origin}/es/checkout-payment?error=confirm_failed`)
  }
}
