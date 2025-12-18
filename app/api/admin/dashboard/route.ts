import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function GET() {
  try {
    // Obtener datos de los últimos 12 meses
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // SUSCRIPCIONES
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'all',
    })
    
    const activeSubscriptions = subscriptions.data.filter(
      sub => sub.status === 'active'
    )
    
    const trialingSubscriptions = subscriptions.data.filter(
      sub => sub.status === 'trialing'
    )
    
    const canceledThisMonth = subscriptions.data.filter(
      sub => sub.canceled_at && 
      new Date(sub.canceled_at * 1000) >= startOfMonth
    )
    
    // MRR (Monthly Recurring Revenue)
    let mrr = 0
    activeSubscriptions.forEach(sub => {
      sub.items.data.forEach(item => {
        if (item.price.recurring?.interval === 'month') {
          mrr += (item.price.unit_amount || 0) / 100
        } else if (item.price.recurring?.interval === 'week') {
          // Convertir semanal a mensual (aprox 4.33 semanas/mes)
          mrr += ((item.price.unit_amount || 0) / 100) * 4.33
        }
      })
    })
    
    // PAGOS
    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: Math.floor(twelveMonthsAgo.getTime() / 1000),
      },
    })
    
    const successfulCharges = charges.data.filter(
      charge => charge.status === 'succeeded'
    )
    
    const totalRevenue = successfulCharges.reduce(
      (sum, charge) => sum + charge.amount,
      0
    ) / 100
    
    // REEMBOLSOS
    const refunds = await stripe.refunds.list({
      limit: 100,
      created: {
        gte: Math.floor(twelveMonthsAgo.getTime() / 1000),
      },
    })
    
    const successfulRefunds = refunds.data.filter(
      refund => refund.status === 'succeeded'
    )
    
    const totalRefunded = successfulRefunds.reduce(
      (sum, refund) => sum + refund.amount,
      0
    ) / 100
    
    const refundsThisMonth = successfulRefunds.filter(
      refund => new Date(refund.created * 1000) >= startOfMonth
    ).length
    
    // INGRESOS POR MES (últimos 12 meses)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = Math.floor(monthDate.getTime() / 1000)
      const monthEnd = Math.floor(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getTime() / 1000)
      
      const monthCharges = charges.data.filter(
        charge => charge.created >= monthStart && charge.created <= monthEnd && charge.status === 'succeeded'
      )
      
      const monthTotal = monthCharges.reduce((sum, charge) => sum + charge.amount, 0) / 100
      
      monthlyRevenue.push({
        month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        revenue: monthTotal,
        transactions: monthCharges.length
      })
    }
    
    // TASA DE CONVERSIÓN (Trial → Activo)
    const totalTrials = trialingSubscriptions.length + activeSubscriptions.length
    const conversionRate = totalTrials > 0 
      ? (activeSubscriptions.length / totalTrials) * 100 
      : 0
    
    // CHURN RATE (cancelaciones / suscripciones activas al inicio del mes)
    const totalActiveAtStart = activeSubscriptions.length + canceledThisMonth.length
    const churnRate = totalActiveAtStart > 0
      ? (canceledThisMonth.length / totalActiveAtStart) * 100
      : 0
    
    // TRANSACCIONES RECIENTES (últimas 20) - Expandir customer para obtener email
    const recentTransactionsWithEmails = await Promise.all(
      successfulCharges.slice(0, 20).map(async (charge) => {
        let customerEmail = charge.billing_details?.email || charge.receipt_email || 'N/A'
        
        // Si no tenemos email, intentar obtenerlo del customer
        if (customerEmail === 'N/A' && charge.customer) {
          try {
            const customer = await stripe.customers.retrieve(charge.customer as string)
            if ('email' in customer && customer.email) {
              customerEmail = customer.email
            }
          } catch (error) {
            console.error('Error retrieving customer:', error)
          }
        }
        
        return {
          id: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency.toUpperCase(),
          status: charge.status,
          customer_email: customerEmail,
          customer_id: charge.customer,
          created: new Date(charge.created * 1000).toISOString(),
          description: charge.description || 'Pago inicial'
        }
      })
    )
    
    // MÉTRICAS DEL AGENTE IA (de la base de datos o logs)
    // Aquí podrías integrar con logs de n8n si los guardas en tu BD
    const aiMetrics = {
      totalRequests: 0, // TODO: Implementar con logs del agente
      refundApproved: 0,
      refundDenied: 0,
      cancelationsProcessed: canceledThisMonth.length,
      avgResponseTime: 0
    }
    
    return NextResponse.json({
      success: true,
      data: {
        // KPIs principales
        kpis: {
          activeSubscriptions: activeSubscriptions.length,
          trialingSubscriptions: trialingSubscriptions.length,
          cancelationsThisMonth: canceledThisMonth.length,
          refundsThisMonth: refundsThisMonth,
          mrr: Math.round(mrr * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalRefunded: Math.round(totalRefunded * 100) / 100,
          conversionRate: Math.round(conversionRate * 10) / 10,
          churnRate: Math.round(churnRate * 10) / 10
        },
        // Gráficos
        charts: {
          monthlyRevenue,
        },
        // Tablas
        tables: {
          recentTransactions: recentTransactionsWithEmails,
          activeSubscriptions: activeSubscriptions.slice(0, 10).map(sub => ({
            id: sub.id,
            customer_id: sub.customer,
            status: sub.status,
            plan: sub.items.data[0]?.price.nickname || 'Plan',
            amount: (sub.items.data[0]?.price.unit_amount || 0) / 100,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
          }))
        },
        // Métricas del agente IA
        aiMetrics
      }
    })
    
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo datos del dashboard',
        details: error.message
      },
      { status: 500 }
    )
  }
}

