// app/api/create-lemon-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getLemonSqueezyConfig } from '@/lib/lemonsqueezy-config'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email y userId son requeridos' },
        { status: 400 }
      )
    }

    console.log('🍋 [Lemon Squeezy] Creando checkout para:', email)

    // Obtener configuración de Lemon Squeezy
    const lemonConfig = await getLemonSqueezyConfig()
    console.log('📊 [Lemon Squeezy] Configuración:', {
      mode: lemonConfig.mode,
      storeId: lemonConfig.storeId,
      variantId: lemonConfig.variantId
    })

    // Obtener precio inicial desde la BD
    const initialPayment = await db.getConfigByKey('initial_payment')
    const price = parseFloat(initialPayment || '0.50')

    // Crear checkout en Lemon Squeezy
    const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${lemonConfig.apiKey}`
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: email,
              custom: {
                user_id: userId
              }
            },
            product_options: {
              enabled_variants: [parseInt(lemonConfig.variantId)]
            },
            checkout_options: {
              embed: false,
              media: true,
              logo: true
            },
            expires_at: null,
            preview: lemonConfig.mode === 'test'
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: lemonConfig.storeId
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: lemonConfig.variantId
              }
            }
          }
        }
      })
    })

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json()
      console.error('❌ [Lemon Squeezy] Error creando checkout:', errorData)
      return NextResponse.json(
        { error: 'Error creando checkout en Lemon Squeezy', details: errorData },
        { status: 500 }
      )
    }

    const checkoutData = await checkoutResponse.json()
    console.log('✅ [Lemon Squeezy] Checkout creado:', checkoutData.data.id)

    return NextResponse.json({
      checkoutUrl: checkoutData.data.attributes.url,
      checkoutId: checkoutData.data.id
    })

  } catch (error: any) {
    console.error('❌ [Lemon Squeezy] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

