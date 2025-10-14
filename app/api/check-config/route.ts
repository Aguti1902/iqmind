import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

/**
 * Endpoint de diagnóstico para verificar la configuración de Stripe
 * Solo usar en desarrollo/staging - NO en producción
 */
export async function GET(request: NextRequest) {
  try {
    const config = {
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasPriceId: !!process.env.STRIPE_PRICE_ID,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeInitialized: !!stripe,
      
      // Mostrar prefijos (sin exponer las claves completas)
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...',
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 12) + '...',
      priceId: process.env.STRIPE_PRICE_ID || 'NO CONFIGURADO',
    }

    // Intentar verificar el precio en Stripe
    let priceDetails = null
    let priceError = null
    
    if (stripe && process.env.STRIPE_PRICE_ID) {
      try {
        const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID)
        priceDetails = {
          id: price.id,
          active: price.active,
          currency: price.currency,
          amount: price.unit_amount,
          amountFormatted: `${(price.unit_amount || 0) / 100} ${price.currency.toUpperCase()}`,
          recurring: price.recurring ? {
            interval: price.recurring.interval,
            intervalCount: price.recurring.interval_count,
          } : null,
        }
      } catch (error: any) {
        priceError = error.message
      }
    }

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      config,
      priceDetails,
      priceError,
      warnings: [],
      errors: [],
    }

    // Agregar warnings y errors
    if (!config.hasStripeSecretKey) {
      response.errors.push('STRIPE_SECRET_KEY no está configurado')
    }
    if (!config.hasPublishableKey) {
      response.errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurado')
    }
    if (!config.hasPriceId) {
      response.errors.push('STRIPE_PRICE_ID no está configurado - LA SUSCRIPCIÓN NO SE CREARÁ')
    }
    if (!config.hasWebhookSecret) {
      response.warnings.push('STRIPE_WEBHOOK_SECRET no está configurado (opcional para desarrollo)')
    }
    if (priceError) {
      response.errors.push(`Error al verificar precio: ${priceError}`)
    }
    if (priceDetails && !priceDetails.active) {
      response.warnings.push('El precio existe pero está INACTIVO en Stripe')
    }
    if (priceDetails && priceDetails.amount !== 1999) {
      response.warnings.push(`El precio es ${priceDetails.amountFormatted}, no 19.99 EUR`)
    }

    return NextResponse.json(response, {
      status: response.errors.length > 0 ? 500 : 200,
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

