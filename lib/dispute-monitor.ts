/**
 * Sistema de monitoreo de disputas (chargebacks) para FastSpring
 * CRÍTICO: Mantener ratio < 0.75% para evitar cierre de cuenta
 */

import { db } from './database-postgres'
import { sendEmail } from './email-service'

// Configuración de alertas
const DISPUTE_CONFIG = {
  // Umbrales de alerta
  warningThreshold: 0.5,      // 0.5% = alerta amarilla
  dangerThreshold: 0.75,      // 0.75% = alerta roja
  criticalThreshold: 1.0,     // 1.0% = crítico
  
  // Emails de alerta
  alertEmails: [
    process.env.ADMIN_EMAIL || 'support@iqmind.mobi',
    // Agregar más emails si es necesario
  ],
  
  // Período de cálculo
  calculationPeriodDays: 30,  // Calcular ratio de últimos 30 días
}

export interface Dispute {
  id: string
  fastspringOrderId: string
  fastspringReference: string
  userEmail: string
  userId?: string
  amount: number
  currency: string
  reason?: string
  status: 'open' | 'won' | 'lost' | 'expired'
  createdAt: string
  resolvedAt?: string
  notes?: string
}

export interface DisputeStats {
  totalDisputes: number
  openDisputes: number
  totalOrders: number
  disputeRatio: number
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical'
  periodDays: number
}

/**
 * Obtener disputas de FastSpring via API
 */
export async function fetchDisputesFromFastSpring(startDate?: Date, endDate?: Date): Promise<any[]> {
  const username = process.env.FASTSPRING_API_USERNAME
  const password = process.env.FASTSPRING_API_PASSWORD
  
  if (!username || !password) {
    throw new Error('FastSpring credentials not configured')
  }

  // FastSpring API endpoint para returns (que incluyen disputas)
  // Docs: https://fastspring.com/docs/api/returns
  
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate || new Date()
  
  const params = new URLSearchParams({
    begin: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    limit: '100'
  })

  try {
    const response = await fetch(
      `https://api.fastspring.com/returns?${params}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('Error fetching disputes from FastSpring:', response.status)
      return []
    }

    const data = await response.json()
    
    // Filtrar solo los chargebacks/disputes
    const disputes = data.returns?.filter((r: any) => 
      r.reason === 'chargeback' || 
      r.reason === 'dispute' ||
      r.type === 'chargeback'
    ) || []
    
    return disputes
  } catch (error) {
    console.error('Error fetching disputes:', error)
    return []
  }
}

/**
 * Calcular estadísticas de disputas
 */
export async function calculateDisputeStats(periodDays: number = 30): Promise<DisputeStats> {
  try {
    // En una implementación real, esto vendría de la BD
    // Por ahora, hacemos una llamada a FastSpring
    
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    const disputes = await fetchDisputesFromFastSpring(startDate)
    
    // Obtener total de órdenes del período
    // Esto debería venir de tu BD o de FastSpring API
    const totalOrders = await getTotalOrdersInPeriod(periodDays)
    
    const totalDisputes = disputes.length
    const openDisputes = disputes.filter((d: any) => d.status !== 'resolved' && d.status !== 'closed').length
    
    const disputeRatio = totalOrders > 0 ? (totalDisputes / totalOrders) * 100 : 0
    
    // Determinar nivel de riesgo
    let riskLevel: 'safe' | 'warning' | 'danger' | 'critical' = 'safe'
    
    if (disputeRatio >= DISPUTE_CONFIG.criticalThreshold) {
      riskLevel = 'critical'
    } else if (disputeRatio >= DISPUTE_CONFIG.dangerThreshold) {
      riskLevel = 'danger'
    } else if (disputeRatio >= DISPUTE_CONFIG.warningThreshold) {
      riskLevel = 'warning'
    }
    
    return {
      totalDisputes,
      openDisputes,
      totalOrders,
      disputeRatio,
      riskLevel,
      periodDays
    }
  } catch (error) {
    console.error('Error calculating dispute stats:', error)
    
    // Retornar stats vacías en caso de error
    return {
      totalDisputes: 0,
      openDisputes: 0,
      totalOrders: 0,
      disputeRatio: 0,
      riskLevel: 'safe',
      periodDays
    }
  }
}

/**
 * Obtener total de órdenes en un período
 */
async function getTotalOrdersInPeriod(periodDays: number): Promise<number> {
  try {
    // Consultar BD para órdenes del período
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    
    // Esto asume que tienes una forma de rastrear órdenes en tu BD
    // Si no, necesitas consultar la API de FastSpring
    
    const config = await db.getAllConfig()
    const totalOrders = parseInt(config.total_orders_last_30_days || '0')
    
    // Si no tienes este dato en BD, consulta FastSpring API
    if (totalOrders === 0) {
      return await fetchTotalOrdersFromFastSpring(startDate)
    }
    
    return totalOrders
  } catch (error) {
    console.error('Error getting total orders:', error)
    return 0
  }
}

/**
 * Obtener total de órdenes desde FastSpring API
 */
async function fetchTotalOrdersFromFastSpring(startDate: Date): Promise<number> {
  const username = process.env.FASTSPRING_API_USERNAME
  const password = process.env.FASTSPRING_API_PASSWORD
  
  if (!username || !password) {
    return 0
  }

  try {
    const params = new URLSearchParams({
      begin: startDate.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      limit: '1'  // Solo necesitamos el count
    })

    const response = await fetch(
      `https://api.fastspring.com/orders?${params}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      return 0
    }

    const data = await response.json()
    return data.total || data.orders?.length || 0
  } catch (error) {
    console.error('Error fetching orders from FastSpring:', error)
    return 0
  }
}

/**
 * Enviar alerta cuando hay disputa nueva
 */
export async function sendDisputeAlert(dispute: any, stats: DisputeStats): Promise<void> {
  console.log('🚨 [DISPUTE] Enviando alerta de disputa...')
  
  const riskEmoji = {
    safe: '🟢',
    warning: '🟡',
    danger: '🟠',
    critical: '🔴'
  }[stats.riskLevel]
  
  const subject = `${riskEmoji} ALERTA: Nueva disputa detectada - Ratio: ${stats.disputeRatio.toFixed(2)}%`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alerta de Disputa</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; border-left: 5px solid ${
        stats.riskLevel === 'critical' ? '#dc2626' : 
        stats.riskLevel === 'danger' ? '#f97316' : 
        stats.riskLevel === 'warning' ? '#eab308' : '#22c55e'
      };">
        <h1 style="color: #dc2626; margin-top: 0;">🚨 Nueva Disputa Detectada</h1>
        
        <div style="background-color: #fee2e2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Detalles de la Disputa</h3>
          <p><strong>Orden:</strong> ${dispute.order || dispute.id}</p>
          <p><strong>Email:</strong> ${dispute.customer?.email || 'N/A'}</p>
          <p><strong>Monto:</strong> ${dispute.total || 0} ${dispute.currency || 'EUR'}</p>
          <p><strong>Razón:</strong> ${dispute.reason || 'No especificada'}</p>
          <p><strong>Fecha:</strong> ${new Date(dispute.created).toLocaleString('es-ES')}</p>
        </div>
        
        <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e;">Estadísticas (Últimos ${stats.periodDays} días)</h3>
          <p><strong>Total Disputas:</strong> ${stats.totalDisputes}</p>
          <p><strong>Total Órdenes:</strong> ${stats.totalOrders}</p>
          <p><strong>Ratio de Disputas:</strong> <span style="font-size: 20px; color: ${
            stats.riskLevel === 'critical' || stats.riskLevel === 'danger' ? '#dc2626' : '#f97316'
          };">${stats.disputeRatio.toFixed(2)}%</span></p>
          <p><strong>Nivel de Riesgo:</strong> 
            <span style="font-weight: bold; color: ${
              stats.riskLevel === 'critical' ? '#dc2626' : 
              stats.riskLevel === 'danger' ? '#f97316' : 
              stats.riskLevel === 'warning' ? '#eab308' : '#22c55e'
            };">
              ${riskEmoji} ${stats.riskLevel.toUpperCase()}
            </span>
          </p>
        </div>
        
        ${stats.riskLevel === 'critical' || stats.riskLevel === 'danger' ? `
        <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">⚠️ ACCIÓN INMEDIATA REQUERIDA</h3>
          <p>Tu ratio de disputas está en nivel ${stats.riskLevel === 'critical' ? 'CRÍTICO' : 'PELIGROSO'}.</p>
          <p><strong>Riesgo:</strong> FastSpring puede cerrar tu cuenta si superas el 1%.</p>
          <p><strong>Acciones recomendadas:</strong></p>
          <ul>
            <li>Contactar al cliente inmediatamente</li>
            <li>Ofrecer reembolso antes de que escale</li>
            <li>Revisar descripción del producto</li>
            <li>Mejorar comunicación post-compra</li>
            <li>Verificar sistema anti-fraude</li>
          </ul>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
             style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver Panel de Admin
          </a>
          
          <a href="https://dashboard.fastspring.com" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-left: 10px;">
            FastSpring Dashboard
          </a>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 6px;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            <strong>Recuerda:</strong> Responde a las disputas en menos de 24h. 
            Mantén el ratio por debajo del 0.75% para evitar problemas con FastSpring.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  // Enviar email a todos los admins
  for (const email of DISPUTE_CONFIG.alertEmails) {
    try {
      await sendEmail({
        to: email,
        subject,
        html
      })
      console.log(`✅ [DISPUTE] Alerta enviada a ${email}`)
    } catch (error) {
      console.error(`❌ [DISPUTE] Error enviando alerta a ${email}:`, error)
    }
  }
}

/**
 * Enviar reporte diario de disputas
 */
export async function sendDailyDisputeReport(): Promise<void> {
  console.log('📊 [DISPUTE] Generando reporte diario...')
  
  const stats = await calculateDisputeStats(30)
  const disputes = await fetchDisputesFromFastSpring(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )
  
  const openDisputes = disputes.filter((d: any) => 
    d.status !== 'resolved' && d.status !== 'closed'
  )
  
  const riskEmoji = {
    safe: '🟢',
    warning: '🟡',
    danger: '🟠',
    critical: '🔴'
  }[stats.riskLevel]
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte Diario de Disputas</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 700px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
        <h1 style="color: #1f2937;">📊 Reporte Diario - ${new Date().toLocaleDateString('es-ES')}</h1>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
            <div style="font-size: 14px; opacity: 0.9;">Total Órdenes (30d)</div>
            <div style="font-size: 32px; font-weight: bold;">${stats.totalOrders}</div>
          </div>
          
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px;">
            <div style="font-size: 14px; opacity: 0.9;">Total Disputas (30d)</div>
            <div style="font-size: 32px; font-weight: bold;">${stats.totalDisputes}</div>
          </div>
          
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 8px;">
            <div style="font-size: 14px; opacity: 0.9;">Disputas Abiertas</div>
            <div style="font-size: 32px; font-weight: bold;">${openDisputes.length}</div>
          </div>
          
          <div style="background: linear-gradient(135deg, ${
            stats.riskLevel === 'critical' || stats.riskLevel === 'danger' ? '#f54242 0%, #dc2626 100%' : 
            stats.riskLevel === 'warning' ? '#fbbf24 0%, #f59e0b 100%' : 
            '#10b981 0%, #059669 100%'
          }); color: white; padding: 20px; border-radius: 8px;">
            <div style="font-size: 14px; opacity: 0.9;">Ratio de Disputas</div>
            <div style="font-size: 32px; font-weight: bold;">${stats.disputeRatio.toFixed(2)}%</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${riskEmoji} ${stats.riskLevel.toUpperCase()}</div>
          </div>
        </div>
        
        ${openDisputes.length > 0 ? `
        <div style="margin-top: 30px;">
          <h3 style="color: #dc2626;">🚨 Disputas Abiertas (Requieren Atención)</h3>
          ${openDisputes.map((d: any) => `
            <div style="border-left: 3px solid #dc2626; padding: 15px; margin: 10px 0; background-color: #fef2f2;">
              <div><strong>Orden:</strong> ${d.order || d.id}</div>
              <div><strong>Cliente:</strong> ${d.customer?.email || 'N/A'}</div>
              <div><strong>Monto:</strong> ${d.total} ${d.currency}</div>
              <div><strong>Razón:</strong> ${d.reason || 'No especificada'}</div>
              <div><strong>Fecha:</strong> ${new Date(d.created).toLocaleDateString('es-ES')}</div>
            </div>
          `).join('')}
        </div>
        ` : `
        <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="color: #065f46; font-weight: bold; margin: 0;">✅ No hay disputas abiertas</p>
        </div>
        `}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Ver Panel de Admin
          </a>
        </div>
      </div>
    </body>
    </html>
  `
  
  // Enviar a admins
  for (const email of DISPUTE_CONFIG.alertEmails) {
    try {
      await sendEmail({
        to: email,
        subject: `${riskEmoji} Reporte Diario de Disputas - ${stats.disputeRatio.toFixed(2)}%`,
        html
      })
      console.log(`✅ [DISPUTE] Reporte enviado a ${email}`)
    } catch (error) {
      console.error(`❌ [DISPUTE] Error enviando reporte a ${email}:`, error)
    }
  }
}

/**
 * Check automático de disputas (ejecutar cada hora)
 */
export async function checkForNewDisputes(): Promise<void> {
  console.log('🔍 [DISPUTE] Verificando nuevas disputas...')
  
  try {
    // Obtener disputas de las últimas 24 horas
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const disputes = await fetchDisputesFromFastSpring(startDate)
    
    if (disputes.length > 0) {
      console.log(`⚠️ [DISPUTE] ${disputes.length} disputas encontradas en las últimas 24h`)
      
      const stats = await calculateDisputeStats(30)
      
      // Enviar alerta por cada disputa nueva
      for (const dispute of disputes) {
        await sendDisputeAlert(dispute, stats)
      }
    } else {
      console.log('✅ [DISPUTE] No hay disputas nuevas')
    }
  } catch (error) {
    console.error('❌ [DISPUTE] Error verificando disputas:', error)
  }
}

