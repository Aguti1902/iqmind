import { NextRequest, NextResponse } from 'next/server'

// Función helper para enviar emails (copiada del webhook)
async function sendEmailToUser(type: string, data: any) {
  try {
    console.log(`📧 Intentando enviar email ${type} a ${data.email}`)
    
    // Determinar qué template usar
    let emailData: any

    switch (type) {
      case 'paymentSuccess':
        if (!data.iq) {
          console.error('❌ iq requerido para paymentSuccess')
          return
        }
        
        // Crear o actualizar usuario y generar contraseña
        try {
          const { createOrUpdateUser } = await import('@/lib/auth')
          const { user, password } = await createOrUpdateUser({
            email: data.email,
            userName: data.userName || 'Usuario',
            iq: data.iq,
            subscriptionStatus: 'trial',
            trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          })
          
          console.log(`👤 Usuario creado/actualizado: ${user.email}`)
          console.log(`🔑 Contraseña generada: ${password}`)
          
          // Enviar email con credenciales de acceso
          const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://iqmind.io'}/login`
          emailData = {
            to: data.email,
            subject: '¡Bienvenido a IQmind! - Acceso a tu Dashboard',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a IQmind</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #031C43 0%, #218B8E 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                              🧠 IQmind
                            </h1>
                          </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                          <td style="padding: 40px 30px; text-align: center;">
                            <h2 style="color: #031C43; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                              ¡Bienvenido a IQmind!
                            </h2>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                              Hola ${data.userName || 'Usuario'},
                            </p>
                            
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                              ¡Felicidades! Tu pago ha sido procesado exitosamente y tu cuenta ha sido creada.
                            </p>
                            
                            <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                              <h3 style="color: #031C43; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                                🎯 Tu Resultado de CI: ${data.iq}
                              </h3>
                              <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                                Has completado exitosamente el test de coeficiente intelectual.
                              </p>
                            </div>
                            
                            <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                              <h3 style="color: #c53030; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                                🔑 Credenciales de Acceso
                              </h3>
                              <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                                <strong>Email:</strong> ${data.email}
                              </p>
                              <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                                <strong>Contraseña:</strong> ${password}
                              </p>
                              <p style="color: #e53e3e; font-size: 12px; margin: 10px 0 0 0; line-height: 1.6;">
                                ⚠️ Por seguridad, cambia tu contraseña después del primer acceso.
                              </p>
                            </div>
                            
                            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #031C43 0%, #218B8E 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                              Acceder a mi Dashboard
                            </a>
                            
                            <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                              Desde tu dashboard podrás ver tu resultado completo, gestionar tu suscripción y acceder a contenido exclusivo.
                            </p>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                              © ${new Date().getFullYear()} IQmind. Todos los derechos reservados.
                            </p>
                            <p style="color: #718096; font-size: 12px; margin: 0;">
                              support@iqmind.io
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
          }
        } catch (userError) {
          console.error('❌ Error creando usuario:', userError)
          return
        }
        break

      default:
        console.error(`❌ Tipo de email no válido: ${type}`)
        return
    }

    // Enviar email
    const { sendEmail } = await import('@/lib/email-service')
    const result = await sendEmail(emailData)
    
    if (result.success) {
      console.log(`✅ Email ${type} enviado correctamente a ${data.email}`)
    } else {
      console.error(`❌ Error enviando email ${type}:`, result.error)
    }
  } catch (error) {
    console.error(`❌ Error enviando email ${type}:`, error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, iq } = body

    if (!email || !iq) {
      return NextResponse.json({ 
        error: 'Email e iq son requeridos' 
      }, { status: 400 })
    }

    console.log('🧪 Simulando webhook payment_intent.succeeded:', { email, userName, iq })

    // Simular el webhook
    await sendEmailToUser('paymentSuccess', {
      email,
      userName: userName || 'Usuario',
      iq: parseInt(iq),
      lang: 'es'
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook simulado exitosamente',
      data: { email, userName, iq }
    })

  } catch (error: any) {
    console.error('❌ Error simulando webhook:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
