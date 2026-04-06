'use client'

import { useEffect, useRef } from 'react'

const GOOGLE_PAY_MERCHANT_ID = 'BCR2DN5TU3HN3ZQ2'

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: any) => any
        }
      }
    }
  }
}

type GooglePayButtonProps = {
  amount: number
  currency?: string
  onProcessPayment: (token: string) => Promise<boolean>
  onError: (error: Error) => void
  disabled?: boolean
  env?: 'sandbox' | 'live'
  gatewayMerchantId?: string
}

export default function GooglePayButton({
  amount,
  currency = 'EUR',
  onProcessPayment,
  onError,
  disabled = false,
  env = 'sandbox',
  gatewayMerchantId = 'clicklabsdigital',
}: GooglePayButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onProcessRef = useRef(onProcessPayment)
  onProcessRef.current = onProcessPayment
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const isProduction = env === 'live'

  useEffect(() => {
    const init = () => {
      if (!window.google?.payments) return

      const client = new window.google.payments.api.PaymentsClient({
        environment: isProduction ? 'PRODUCTION' : 'TEST',
        paymentDataCallbacks: {
          onPaymentAuthorized: async (paymentData: any) => {
            try {
              const token = paymentData.paymentMethodData.tokenizationData.token
              const success = await onProcessRef.current(token)
              if (success) return { transactionState: 'SUCCESS' }
              return {
                transactionState: 'ERROR',
                error: { reason: 'PAYMENT_DATA_INVALID', message: 'Pago denegado', intent: 'PAYMENT_AUTHORIZATION' },
              }
            } catch (error: any) {
              return {
                transactionState: 'ERROR',
                error: { reason: 'OTHER_ERROR', message: error.message || 'Error', intent: 'PAYMENT_AUTHORIZATION' },
              }
            }
          },
        },
      })

      const isReadyRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA'],
          },
        }],
      }

      client.isReadyToPay(isReadyRequest).then((response: any) => {
        if (!response.result || !containerRef.current) return

        const getPaymentDataRequest = () => {
          const req: any = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA'],
              },
              tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: { gateway: 'sipay', gatewayMerchantId },
              },
            }],
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: amount.toFixed(2),
              currencyCode: currency,
              countryCode: 'ES',
            },
            merchantInfo: { merchantName: 'MindMetric' },
            callbackIntents: ['PAYMENT_AUTHORIZATION'],
          }
          if (isProduction) req.merchantInfo.merchantId = GOOGLE_PAY_MERCHANT_ID
          return req
        }

        const button = client.createButton({
          onClick: async () => {
            if (disabled) return
            try {
              await client.loadPaymentData(getPaymentDataRequest())
            } catch (error: any) {
              if (error.statusCode !== 'CANCELED') {
                onErrorRef.current(error)
              }
            }
          },
          buttonType: 'buy',
          buttonColor: 'black',
          buttonSizeMode: 'fill',
          buttonLocale: 'es',
        })

        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(button)
        containerRef.current.style.display = 'block'
      }).catch(() => {})
    }

    // El contenedor siempre está en el DOM pero oculto hasta que Google confirme disponibilidad
    if (containerRef.current) {
      containerRef.current.style.display = 'none'
    }

    if (typeof window !== 'undefined' && window.google?.payments) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = 'https://pay.google.com/gp/p/js/pay.js'
      script.async = true
      script.onload = init
      document.body.appendChild(script)
    }
  }, [isProduction, disabled, amount, currency, gatewayMerchantId])

  return <div ref={containerRef} className="w-full" style={{ display: 'none', minHeight: 48 }} />
}
