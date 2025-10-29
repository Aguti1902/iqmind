/**
 * Sistema de Reembolso Preventivo (Alternativa a ChargeBlast para FastSpring)
 * 
 * Detecta clientes de alto riesgo ANTES de que inicien disputas
 * y toma acciones preventivas automáticas
 */

import { db } from './database-postgres'
import { sendEmail } from './email-service'

// Configuración del sistema
const PREVENTIVE_CONFIG = {
  // Auto-reembolso si el cliente no usa el servicio
  autoRefundIfNoUsage: true,
  daysWithoutUsageForRefund: 7,        // Si no inicia sesión en 7 días → reembolso
  
  // Auto-reembolso si detectamos email de queja
  autoRefundOnComplaint: true,
  complaintKeywords: [
    'fraude', 'fraud', 'scam', 'estafa', 
    'no autorizad', 'unauthorized', 'no reconozco',
    'i did not', 'nunca compré', 'never purchased',
    'cancel', 'cancelar', 'reembolso', 'refund'
  ],
  
  // Auto-reembolso si es usuario high-risk
  autoRefundHighRisk: true,
  highRiskIndicators: {
    temporaryEmail: true,              // Email temporal
    vpnDetected: true,                 // VPN o proxy
    testTooFast: true,                 // Test < 3 min
    multipleAttempts: true,            // Múltiples intentos de pago
  },
  
  // Límites de reembolso automático
  maxAutoRefundAmount: 0.50,           // Solo auto-reembolsar pagos iniciales de €0.50
  maxAutoRefundsPerDay: 5,             // Máximo 5 reembolsos auto por día
  
  // Notificaciones
  notifyOnAutoRefund: true,
  alertEmails: [
    process.env.ADMIN_EMAIL || 'support@iqmind.mobi'
  ]
}

export interface RiskSignal {
  type: 'no_usage' | 'complaint_email' | 'high_risk_user' | 'failed_cancellation' | 'suspicious_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: string
  userId: string
  userEmail: string
  metadata?: any
}

export interface PreventiveAction {
  action: 'auto_refund' | 'send_proactive_email' | 'flag_for_review' | 'auto_cancel'
  reason: string
  riskSignals: RiskSignal[]
  userId: string
  userEmail: string
  subscriptionId?: string
  orderId?: string
  amount?: number
  executed: boolean
  executedAt?: string
}

/**
 * Detectar señales de riesgo de un usuario
 */
export async function detectRiskSignals(userId: string): Promise<RiskSignal[]> {
  const signals: RiskSignal[] = []
  
  try {
    const user = await db.getUserById(userId)
    if (!user) return signals
    
    const now = new Date()
    
    // 1. SEÑAL: No ha usado el servicio (sin logins)
    if (user.lastLogin) {
      const lastLoginDate = new Date(user.lastLogin)
      const daysSinceLogin = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLogin >= PREVENTIVE_CONFIG.daysWithoutUsageForRefund) {
        signals.push({
          type: 'no_usage',
          severity: 'high',
          description: `Usuario no ha iniciado sesión en ${daysSinceLogin} días`,
          timestamp: now.toISOString(),
          userId: user.id,
          userEmail: user.email,
          metadata: { daysSinceLogin, lastLogin: user.lastLogin }
        })
      }
    }
    
    // 2. SEÑAL: Email temporal (high-risk)
    const emailDomain = user.email.split('@')[1]?.toLowerCase()
    const temporaryDomains = [
      'tempmail.com', 'guerrillamail.com', 'mailinator.com', 
      '10minutemail.com', 'yopmail.com', 'throwaway.email'
    ]
    
    if (temporaryDomains.includes(emailDomain)) {
      signals.push({
        type: 'high_risk_user',
        severity: 'critical',
        description: `Email temporal detectado: ${emailDomain}`,
        timestamp: now.toISOString(),
        userId: user.id,
        userEmail: user.email,
        metadata: { emailDomain }
      })
    }
    
    // 3. SEÑAL: Usuario en trial pero no ha hecho tests (sospechoso)
    if (user.subscriptionStatus === 'trial' && (!user.testResults || user.testResults.length === 0)) {
      const createdAt = new Date(user.createdAt)
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceCreation >= 2) {
        signals.push({
          type: 'suspicious_pattern',
          severity: 'medium',
          description: `Usuario en trial ${daysSinceCreation} días sin hacer tests`,
          timestamp: now.toISOString(),
          userId: user.id,
          userEmail: user.email,
          metadata: { daysSinceCreation, testResults: 0 }
        })
      }
    }
    
    // 4. SEÑAL: Test sospechoso (demasiado rápido)
    if (user.testResults && user.testResults.length > 0) {
      const lastTest = user.testResults[0]
      if (lastTest.timeElapsed < 180) { // < 3 minutos
        signals.push({
          type: 'high_risk_user',
          severity: 'high',
          description: `Test completado en ${lastTest.timeElapsed}s (posible bot)`,
          timestamp: now.toISOString(),
          userId: user.id,
          userEmail: user.email,
          metadata: { timeElapsed: lastTest.timeElapsed }
        })
      }
    }
    
    return signals
  } catch (error) {
    console.error('Error detectando señales de riesgo:', error)
    return signals
  }
}

/**
 * Determinar acción preventiva basada en señales de riesgo
 */
export async function determinePreventiveAction(signals: RiskSignal[]): Promise<PreventiveAction | null> {
  if (signals.length === 0) return null
  
  const criticalSignals = signals.filter(s => s.severity === 'critical')
  const highSignals = signals.filter(s => s.severity === 'high')
  
  const firstSignal = signals[0]
  
  // ACCIÓN CRÍTICA: Auto-reembolso
  if (criticalSignals.length > 0 || highSignals.length >= 2) {
    return {
      action: 'auto_refund',
      reason: `${criticalSignals.length + highSignals.length} señales de alto riesgo detectadas`,
      riskSignals: signals,
      userId: firstSignal.userId,
      userEmail: firstSignal.userEmail,
      executed: false
    }
  }
  
  // ACCIÓN ALTA: Email proactivo ofreciendo ayuda
  if (highSignals.length === 1) {
    return {
      action: 'send_proactive_email',
      reason: 'Señal de riesgo alto detectada',
      riskSignals: signals,
      userId: firstSignal.userId,
      userEmail: firstSignal.userEmail,
      executed: false
    }
  }
  
  // ACCIÓN MEDIA: Marcar para revisión manual
  return {
    action: 'flag_for_review',
    reason: 'Señales de riesgo medio detectadas',
    riskSignals: signals,
    userId: firstSignal.userId,
    userEmail: firstSignal.userEmail,
    executed: false
  }
}

/**
 * Ejecutar reembolso preventivo via FastSpring API
 */
export async function executePreventiveRefund(
  orderId: string, 
  reason: string,
  userEmail: string
): Promise<boolean> {
  try {
    console.log(`🔄 [PREVENTIVE] Ejecutando reembolso preventivo para orden ${orderId}`)
    
    const username = process.env.FASTSPRING_API_USERNAME
    const password = process.env.FASTSPRING_API_PASSWORD
    
    if (!username || !password) {
      console.error('❌ [PREVENTIVE] Credenciales de FastSpring no configuradas')
      return false
    }
    
    // FastSpring API para crear reembolso
    const response = await fetch(
      `https://api.fastspring.com/orders/${orderId}/returns`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason,
          comment: `Reembolso preventivo automático: ${reason}`
        })
      }
    )
    
    if (!response.ok) {
      console.error('❌ [PREVENTIVE] Error en API de FastSpring:', response.status)
      return false
    }
    
    const result = await response.json()
    console.log('✅ [PREVENTIVE] Reembolso ejecutado:', result)
    
    // Notificar por email
    await notifyPreventiveRefund(orderId, userEmail, reason)
    
    return true
  } catch (error) {
    console.error('❌ [PREVENTIVE] Error ejecutando reembolso:', error)
    return false
  }
}

/**
 * Enviar email proactivo al cliente ofreciendo ayuda
 */
export async function sendProactiveEmail(userEmail: string, userName: string, signals: RiskSignal[]): Promise<void> {
  console.log(`📧 [PREVENTIVE] Enviando email proactivo a ${userEmail}`)
  
  const mainReason = signals[0].description
  
  try {
    await sendEmail({
      to: userEmail,
      subject: '¿Necesitas ayuda con tu cuenta de IQmind?',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>¿Podemos ayudarte?</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #031C43;">Hola ${userName},</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Notamos que aún no has aprovechado tu acceso premium a IQmind.
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              ¿Hay algo con lo que podamos ayudarte?
            </p>
            
            <div style="background-color: #e6f7f7; border-left: 4px solid #218B8E; padding: 15px; margin: 20px 0;">
              <h3 style="color: #218B8E; margin-top: 0;">🎁 Opciones:</h3>
              <ul style="color: #4a5568; margin: 0;">
                <li>Si no estás satisfecho, podemos hacer un <strong>reembolso completo</strong></li>
                <li>Si tienes dudas sobre cómo usar el servicio, estamos aquí para ayudarte</li>
                <li>Puedes cancelar en cualquier momento desde tu cuenta</li>
              </ul>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Simplemente responde a este email y resolveremos cualquier problema.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/cuenta" 
                 style="display: inline-block; background: #218B8E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Acceder a mi Cuenta
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; text-align: center;">
              Equipo IQmind<br>
              support@iqmind.mobi
            </p>
          </div>
        </body>
        </html>
      `
    })
    
    console.log('✅ [PREVENTIVE] Email proactivo enviado')
  } catch (error) {
    console.error('❌ [PREVENTIVE] Error enviando email proactivo:', error)
  }
}

/**
 * Notificar al admin sobre reembolso preventivo
 */
async function notifyPreventiveRefund(orderId: string, userEmail: string, reason: string): Promise<void> {
  for (const adminEmail of PREVENTIVE_CONFIG.alertEmails) {
    try {
      await sendEmail({
        to: adminEmail,
        subject: `🛡️ Reembolso Preventivo Ejecutado - ${userEmail}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Reembolso Preventivo</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; border-left: 5px solid #10b981;">
              <h2 style="color: #059669;">🛡️ Reembolso Preventivo Ejecutado</h2>
              
              <div style="background-color: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Orden:</strong> ${orderId}<br>
                  <strong>Cliente:</strong> ${userEmail}<br>
                  <strong>Razón:</strong> ${reason}<br>
                  <strong>Acción:</strong> Reembolso automático preventivo
                </p>
              </div>
              
              <p style="color: #4a5568;">
                Este reembolso se ejecutó automáticamente para prevenir una posible disputa.
              </p>
              
              <p style="color: #059669; font-weight: bold;">
                ✅ Prevención exitosa: Este cliente NO contará en el ratio de disputas.
              </p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/disputes" 
                 style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                Ver Dashboard
              </a>
            </div>
          </body>
          </html>
        `
      })
    } catch (error) {
      console.error('Error notificando reembolso preventivo:', error)
    }
  }
}

/**
 * Monitoreo automático de usuarios de alto riesgo (ejecutar cada 6 horas)
 */
export async function scanHighRiskUsers(): Promise<void> {
  console.log('🔍 [PREVENTIVE] Escaneando usuarios de alto riesgo...')
  
  try {
    // Obtener usuarios en trial o activos
    const config = await db.getAllConfig()
    
    // En producción, obtendrías todos los usuarios de la BD
    // Por ahora, esto es un placeholder
    
    // TODO: Implementar query para obtener usuarios activos/trial
    // const users = await db.getActiveUsers()
    
    console.log('✅ [PREVENTIVE] Escaneo completado')
  } catch (error) {
    console.error('❌ [PREVENTIVE] Error en escaneo:', error)
  }
}

/**
 * Procesar email de soporte para detectar quejas
 */
export async function processIncomingSupportEmail(
  from: string,
  subject: string,
  body: string
): Promise<void> {
  console.log(`📨 [PREVENTIVE] Procesando email de: ${from}`)
  
  // Detectar palabras clave de queja
  const text = `${subject} ${body}`.toLowerCase()
  
  const hasComplaint = PREVENTIVE_CONFIG.complaintKeywords.some(keyword => 
    text.includes(keyword.toLowerCase())
  )
  
  if (hasComplaint && PREVENTIVE_CONFIG.autoRefundOnComplaint) {
    console.log(`🚨 [PREVENTIVE] Queja detectada en email de ${from}`)
    
    // Buscar usuario
    const user = await db.getUserByEmail(from)
    
    if (user && user.subscriptionId) {
      // Ejecutar reembolso preventivo automático
      console.log(`🛡️ [PREVENTIVE] Ejecutando reembolso preventivo para ${from}`)
      
      // Nota: Necesitarías el orderId de FastSpring
      // await executePreventiveRefund(orderId, 'Queja de cliente detectada', from)
      
      // Enviar email al admin
      await sendEmail({
        to: PREVENTIVE_CONFIG.alertEmails[0],
        subject: `⚠️ Queja detectada - Acción requerida: ${from}`,
        html: `
          <h3>Queja detectada en email de soporte</h3>
          <p><strong>Cliente:</strong> ${from}</p>
          <p><strong>Asunto:</strong> ${subject}</p>
          <p><strong>Mensaje:</strong></p>
          <pre>${body}</pre>
          <p><strong>Acción recomendada:</strong> Contactar inmediatamente y ofrecer reembolso</p>
        `
      })
    }
  }
}

