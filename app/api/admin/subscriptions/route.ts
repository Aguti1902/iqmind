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
    
    // Obtener suscripciones con paginación si es necesario
    let allSubscriptions: Stripe.Subscription[] = []
    let subscriptionsHasMore = true
    let subscriptionsStartingAfter: string | undefined = undefined
    
    while (subscriptionsHasMore && allSubscriptions.length < actualLimit) {
      const subscriptionsResponse: Stripe.Response<Stripe.ApiList<Stripe.Subscription>> = await stripe.subscriptions.list({
        limit: Math.min(100, actualLimit - allSubscriptions.length),
        status: status === 'all' ? undefined : (status as any),
        expand: ['data.customer'],
        ...(subscriptionsStartingAfter && { starting_after: subscriptionsStartingAfter }),
      })
      
      allSubscriptions = allSubscriptions.concat(subscriptionsResponse.data)
      subscriptionsHasMore = subscriptionsResponse.has_more
      
      if (subscriptionsResponse.data.length > 0) {
        subscriptionsStartingAfter = subscriptionsResponse.data[subscriptionsResponse.data.length - 1].id
      }
      
      // Si ya tenemos suficientes, parar
      if (allSubscriptions.length >= actualLimit) {
        break
      }
    }
    
    // Filtrar por búsqueda si existe
    let filteredSubs = allSubscriptions
    if (search) {
      filteredSubs = allSubscriptions.filter(sub => {
        const customer = sub.customer as Stripe.Customer
        const email = customer.email || ''
        const customerId = typeof sub.customer === 'string' ? sub.customer : customer.id
        
        return (
          email.toLowerCase().includes(search.toLowerCase()) ||
          sub.id.toLowerCase().includes(search.toLowerCase()) ||
          customerId.toLowerCase().includes(search.toLowerCase())
        )
      })
    }
    
    // Formatear datos
    const formattedSubs = filteredSubs.map(sub => {
      const customer = sub.customer as Stripe.Customer
      
      return {
        id: sub.id,
        customer_id: typeof sub.customer === 'string' ? sub.customer : customer.id,
        customer_email: customer.email || 'N/A',
        customer_name: customer.name || 'N/A',
        status: sub.status,
        plan: sub.items.data[0]?.price.nickname || sub.items.data[0]?.price.id || 'Plan',
        amount: (sub.items.data[0]?.price.unit_amount || 0) / 100,
        currency: sub.currency.toUpperCase(),
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        created: new Date(sub.created * 1000).toISOString(),
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formattedSubs,
      total: filteredSubs.length,
      has_more: allSubscriptions.length >= actualLimit && subscriptionsHasMore,
    })
    
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo suscripciones',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Cancelar suscripción
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get('id')
    
    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'ID de suscripción requerido' },
        { status: 400 }
      )
    }
    
    const deletedSubscription = await stripe.subscriptions.cancel(subscriptionId)
    
    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      data: deletedSubscription
    })
    
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error cancelando suscripción',
        details: error.message
      },
      { status: 500 }
    )
  }
}

