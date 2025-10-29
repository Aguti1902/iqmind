import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateUser } from '@/lib/auth'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, reference, email, userName, userIQ, lang, testData } = body

    console.log('📦 Procesando orden de FastSpring:', { orderId, reference, email, userName, userIQ })

    if (!orderId && !reference) {
      console.error('❌ Falta orderId o reference')
      return NextResponse.json({ error: 'Order ID o Reference requerido' }, { status: 400 })
    }

    if (!email) {
      console.error('❌ Falta email')
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // OPCIONAL: Verificar orden con API de FastSpring
    // Esto es recomendable pero no estrictamente necesario si confías en los webhooks
    const fsUsername = process.env.FASTSPRING_API_USERNAME
    const fsPassword = process.env.FASTSPRING_API_PASSWORD
    
    if (fsUsername && fsPassword && (orderId || reference)) {
      try {
        console.log('🔍 Verificando orden con FastSpring API...')
        const orderIdToVerify = orderId || reference
        const fsResponse = await fetch(
          `https://api.fastspring.com/orders/${orderIdToVerify}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${fsUsername}:${fsPassword}`).toString('base64')}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!fsResponse.ok) {
          console.error('❌ Error verificando orden con FastSpring:', fsResponse.status)
          // No bloquear si falla la verificación, confiar en webhook
          console.warn('⚠️ Continuando sin verificación de orden...')
        } else {
          const orderFromFS = await fsResponse.json()
          console.log('✅ Orden verificada con FastSpring:', orderFromFS.id)
        }
      } catch (verifyError) {
        console.error('❌ Error en verificación de FastSpring:', verifyError)
        // No bloquear, continuar con el proceso
      }
    }

    // Verificar duplicados - evitar procesar la misma orden dos veces
    const existingUser = await db.getUserByEmail(email)
    if (existingUser && existingUser.subscriptionId === (orderId || reference)) {
      console.log('⚠️ Orden ya procesada anteriormente')
      return NextResponse.json({
        success: true,
        userId: existingUser.id,
        message: 'Orden ya procesada',
        trialEnd: existingUser.trialEndDate
      })
    }

    // Leer días de trial desde BD
    const trialDaysStr = await db.getConfigByKey('trial_days')
    const trialDays = trialDaysStr ? parseInt(trialDaysStr) : 2
    const trialEndDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

    console.log(`🚀 Creando usuario con trial de ${trialDays} días...`)

    // Crear o actualizar usuario con acceso trial
    const { user, password } = await createOrUpdateUser({
      email,
      userName: userName || 'Usuario',
      iq: userIQ || 0,
      subscriptionStatus: 'trial',
      trialEndDate: trialEndDate.toISOString(),
    })

    console.log('✅ Usuario creado/actualizado:', user.id)

    // Guardar subscription ID de FastSpring (usar orderId o reference)
    await db.updateUser(user.id, {
      subscriptionId: orderId || reference,
    })

    // Guardar resultado del test en el historial
    if (testData && userIQ && testData.answers) {
      try {
        console.log('💾 Guardando resultado del test...')
        
        const testResult = {
          id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          iq: userIQ,
          correctAnswers: testData.correctAnswers || 0,
          timeElapsed: testData.timeElapsed || 0,
          answers: testData.answers || [],
          categoryScores: testData.categoryScores || {},
          completedAt: new Date().toISOString(),
        }

        await db.createTestResult(testResult)
        console.log('✅ Resultado del test guardado')
      } catch (testError) {
        console.error('❌ Error guardando resultado del test:', testError)
        // No bloquear el flujo
      }
    }

    // Enviar email de bienvenida con credenciales
    try {
      console.log('📧 Enviando email de bienvenida...')
      
      const t = (key: any) => getEmailTranslation(lang || 'es', key)
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://iqmind.mobi'}/${lang || 'es'}/cuenta`
      
      await sendEmail({
        to: email,
        subject: t('welcomeSubject'),
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${t('welcome')} IQmind</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #031C43 0%, #218B8E 100%); padding: 40px 30px; text-align: center;">
                        <img src="https://www.iqmind.mobi/images/LOGO2BLANCO.png" alt="IQmind" style="height: 40px; width: auto; margin: 0 auto; display: block;" />
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px; text-align: center;">
                        <h2 style="color: #031C43; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                          ${t('welcome')} IQmind!
                        </h2>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          ${t('hello')} ${userName || t('user')},
                        </p>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          ${t('congratulations')}
                        </p>
                        
                        <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                          <h3 style="color: #031C43; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                            🎯 ${t('yourIQResult')}: ${userIQ}
                          </h3>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            ${t('completedTest')}
                          </p>
                        </div>
                        
                        <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                          <h3 style="color: #c53030; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                            🔑 ${t('loginCredentials')}
                          </h3>
                          <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                            <strong>Email:</strong> ${email}
                          </p>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            <strong>${t('password')}:</strong> ${password}
                          </p>
                          <p style="color: #e53e3e; font-size: 12px; margin: 10px 0 0 0; line-height: 1.6;">
                            ⚠️ ${t('securityWarning')}
                          </p>
                        </div>
                        
                        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #031C43 0%, #218B8E 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                          ${t('accessDashboard')}
                        </a>
                        
                        <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                          ${t('dashboardInfo')}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                          © ${new Date().getFullYear()} IQmind. ${t('allRightsReserved')}
                        </p>
                        <p style="color: #718096; font-size: 12px; margin: 0;">
                          support@iqmind.mobi
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      })
      
      console.log('✅ Email de bienvenida enviado')
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError)
      // No bloquear el flujo
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      trialEnd: trialEndDate.toISOString()
    })

  } catch (error: any) {
    console.error('❌ Error procesando orden de FastSpring:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

