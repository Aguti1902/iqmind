import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const requestedLimit = parseInt(searchParams.get('limit') || '100')
    const actualLimit = Math.min(requestedLimit, 1000) // Máximo 1000 para evitar timeouts
    
    // Obtener charges con paginación si es necesario
    let allCharges: Stripe.Charge[] = []
    let chargesHasMore = true
    let chargesStartingAfter: string | undefined = undefined
    
    while (chargesHasMore && allCharges.length < actualLimit) {
      const chargesResponse: Stripe.Response<Stripe.ApiList<Stripe.Charge>> = await stripe.charges.list({
        limit: Math.min(100, actualLimit - allCharges.length),
        expand: ['data.customer'],
        ...(chargesStartingAfter && { starting_after: chargesStartingAfter }),
      })
      
      allCharges = allCharges.concat(chargesResponse.data)
      chargesHasMore = chargesResponse.has_more
      
      if (chargesResponse.data.length > 0) {
        chargesStartingAfter = chargesResponse.data[chargesResponse.data.length - 1].id
      }
      
      // Si ya tenemos suficientes, parar
      if (allCharges.length >= actualLimit) {
        break
      }
    }
    
    // Ordenar por fecha descendente (más recientes primero) - Stripe ya lo hace por defecto pero asegurémonos
    allCharges.sort((a, b) => b.created - a.created)
    
    // Filtrar por estado si es necesario
    let filteredCharges = allCharges
    if (status !== 'all') {
      filteredCharges = allCharges.filter(charge => charge.status === status)
    }
    
    // Obtener emails de customers para búsqueda
    const chargesWithEmails = await Promise.all(
      filteredCharges.map(async (charge) => {
        let customerEmail = charge.billing_details?.email || charge.receipt_email || 'N/A'
        let customerName = charge.billing_details?.name || 'N/A'
        
        if (charge.customer) {
          try {
            const customer = await stripe.customers.retrieve(charge.customer as string)
            if ('email' in customer) {
              customerEmail = customer.email || customerEmail
              customerName = customer.name || customerName
            }
          } catch (error) {
            console.error('Error retrieving customer:', error)
          }
        }
        
        // Verificar si tiene reembolso
        const refunded = charge.refunded
        const refundAmount = charge.amount_refunded / 100
        
        return {
          id: charge.id,
          amount: charge.amount / 100,
          amount_refunded: refundAmount,
          currency: charge.currency.toUpperCase(),
          status: charge.status,
          refunded: refunded,
          customer_id: charge.customer,
          customer_email: customerEmail,
          customer_name: customerName,
          payment_method: charge.payment_method_details?.type || 'card',
          created: new Date(charge.created * 1000).toISOString(),
          description: charge.description || 'Pago',
        }
      })
    )
    
    // Filtrar por búsqueda si existe
    let filteredTransactions = chargesWithEmails
    if (search) {
      filteredTransactions = chargesWithEmails.filter(charge => {
        return (
          charge.customer_email.toLowerCase().includes(search.toLowerCase()) ||
          charge.id.toLowerCase().includes(search.toLowerCase()) ||
          (charge.customer_id && charge.customer_id.toString().toLowerCase().includes(search.toLowerCase()))
        )
      })
    }
    
    return NextResponse.json({
      success: true,
      data: filteredTransactions,
      total: filteredTransactions.length,
      has_more: allCharges.length >= actualLimit && chargesHasMore,
    })
    
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo transacciones',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Crear reembolso
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { chargeId, amount, reason } = body
    
    if (!chargeId) {
      return NextResponse.json(
        { success: false, error: 'ID de cargo requerido' },
        { status: 400 }
      )
    }
    
    // Crear reembolso
    const refundData: any = {
      charge: chargeId,
    }
    
    if (amount) {
      refundData.amount = Math.round(amount * 100) // Convertir a centavos
    }
    
    if (reason) {
      refundData.reason = reason
    }
    
    const refund = await stripe.refunds.create(refundData)
    
    return NextResponse.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: refund
    })
    
  } catch (error: any) {
    console.error('Error creating refund:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando reembolso',
        details: error.message
      },
      { status: 500 }
    )
  }
}

