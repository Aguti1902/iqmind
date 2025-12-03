import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, userEmail, lang = 'es' } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Crear o recuperar customer
    let customer: Stripe.Customer | undefined
    if (userEmail) {
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            lang: lang,
          },
        })
      }
    }

    const origin = req.headers.get('origin') || 'https://mindmetric.io'

    // Crear sesión de checkout para suscripción
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customer?.id,
      customer_email: !customer ? userEmail : undefined,
      success_url: `${origin}/${lang}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${lang}?canceled=true`,
      metadata: {
        userEmail: userEmail || '',
        lang: lang,
      },
      allow_promotion_codes: true, // Permitir códigos de descuento
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    })
    
  } catch (error: any) {
    console.error('❌ Error creating subscription checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

