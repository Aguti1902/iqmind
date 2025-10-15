import { NextRequest, NextResponse } from 'next/server'
import { generatePasswordResetToken } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
      })
    }

    // Generar token de reset
    const token = generatePasswordResetToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas

    // Guardar token en la base de datos
    await db.createPasswordResetToken(email, token, expiresAt)

    // Detectar idioma del usuario (por defecto español)
    const lang = body.lang || 'es'
    
    // Enviar email de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://iqmind.io'}/${lang}/reset-password?token=${token}`
    
    const emailData = {
      to: email,
      subject: lang === 'es' 
        ? 'Recuperar contraseña - IQmind'
        : 'Reset Password - IQmind',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${lang === 'es' ? 'Recuperar Contraseña' : 'Reset Password'}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #031C43 0%, #218B8E 100%); padding: 40px 30px; text-align: center;">
                      <img src="https://www.iqmind.io/images/LOGO2BLANCO.svg" alt="IQmind" style="height: 40px; width: auto; margin: 0 auto; display: block;" />
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <h2 style="color: #031C43; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                        ${lang === 'es' ? 'Recuperar Contraseña' : 'Reset Password'}
                      </h2>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${lang === 'es' ? 'Hola' : 'Hello'} ${user.userName},
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${lang === 'es' 
                          ? 'Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña.'
                          : 'We received a request to reset your account password. Click the button below to create a new password.'}
                      </p>
                      
                      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #031C43 0%, #218B8E 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                        ${lang === 'es' ? 'Restablecer Contraseña' : 'Reset Password'}
                      </a>
                      
                      <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.'
                          : 'If you did not request this change, you can ignore this email. Your password will remain unchanged.'}
                      </p>
                      
                      <p style="color: #718096; font-size: 12px; margin: 20px 0 0 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Este enlace expirará en 24 horas por seguridad.'
                          : 'This link will expire in 24 hours for security.'}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                        © ${new Date().getFullYear()} IQmind. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
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

    await sendEmail(emailData)

    return NextResponse.json({
      success: true,
      message: lang === 'es' 
        ? 'Si el email existe, se ha enviado un enlace de recuperación'
        : 'If the email exists, a recovery link has been sent',
    })

  } catch (error: any) {
    console.error('Error en forgot-password:', error)
    return NextResponse.json(
      { error: lang === 'es' ? 'Error interno del servidor' : 'Internal server error' },
      { status: 500 }
    )
  }
}
