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
 * 2. Activa el trial del usuario
 * 3. Envía emails
 * 4. Redirige al usuario a la página de resultados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('request_id') // Sipay añade esto automáticamente
    const orderId = searchParams.get('order_id')
    const email = searchParams.get('email')
    const lang = searchParams.get('lang') || 'es'
    const testType = searchParams.get('test_type') || 'iq'
    const error = searchParams.get('error') // Si viene con error

    console.log('🔄 Confirm payment:', { requestId, orderId, email, error })

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://mindmetric.io'

    // Si hay error de 3DS, redirigir al checkout
    if (error) {
      console.error('❌ 3DS falló:', error)
      return NextResponse.redirect(`${origin}/${lang}/checkout-payment?error=3ds_failed`)
    }

    if (!requestId) {
      console.error('❌ No request_id en callback')
      return NextResponse.redirect(`${origin}/${lang}/checkout-payment?error=no_request_id`)
    }

    // Llamar a /all-in-one/confirm para capturar fondos
    const sipay = getSipayClient()
    let transactionId = null
    let cardToken = null

    try {
      console.log('📤 Confirmando pago con request_id:', requestId)
      const confirmResult = await sipay.confirmPayment(requestId)
      console.log('📥 Confirm result:', JSON.stringify(confirmResult))

      transactionId = confirmResult?.payload?.transaction_id
      cardToken = confirmResult?.payload?.token

      console.log('✅ Pago confirmado! transaction_id:', transactionId, 'token:', cardToken)
    } catch (confirmError: any) {
      console.error('⚠️ Error en confirm:', confirmError.message)
      // Continuamos igualmente para activar el trial
    }

    // Activar trial del usuario
    if (email) {
      const user = await db.getUserByEmail(email)
      if (user) {
        const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        
        await db.updateUser(user.id, {
          subscriptionStatus: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          subscriptionId: cardToken || requestId,
        })
        console.log('✅ Trial activado para:', email)

        // Enviar emails
        const userName = (user as any).name || email.split('@')[0]
        const trialEndFormatted = trialEndDate.toLocaleDateString(
          lang === 'es' ? 'es-ES' : 'en-US',
          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        )

        // Email según tipo de test
        try {
          const testResults = await db.getTestResultsByUserId(user.id)
          const userIQ = testResults?.[0]?.iq || 100

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
              testEmail = emailTemplates.paymentSuccess(email, userName, userIQ, lang)
          }
          await sendEmail(testEmail)
          console.log(`📧 Email de test ${testType} enviado`)
        } catch (e) {
          console.error('⚠️ Error enviando email de test:', e)
        }

        // Email de trial
        try {
          const trialEmail = emailTemplates.trialStarted(email, userName, trialEndFormatted, lang)
          await sendEmail(trialEmail)
          console.log('📧 Email de trial enviado')
        } catch (e) {
          console.error('⚠️ Error enviando email de trial:', e)
        }
      }
    }

    // Redirigir al usuario a la página de resultados
    const redirectUrl = `${origin}/${lang}/resultado?order_id=${orderId || ''}&payment=success&transaction_id=${transactionId || ''}`
    console.log('🔄 Redirigiendo a:', redirectUrl)
    
    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('❌ Error en confirm-payment:', error.message)
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://mindmetric.io'
    return NextResponse.redirect(`${origin}/es/checkout-payment?error=confirm_failed`)
  }
}
