'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const onProcessRef = useRef(onProcessPayment)
  onProcessRef.current = onProcessPayment
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const isProduction = env === 'live'

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'sipay',
      gatewayMerchantId,
    },
  }

  const cardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['MASTERCARD', 'VISA'],
    },
    tokenizationSpecification,
  }

  const getPaymentDataRequest = () => {
    const request: any = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: amount.toFixed(2),
        currencyCode: currency,
        countryCode: 'ES',
      },
      merchantInfo: {
        merchantName: 'MindMetric',
      },
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
    }
    if (isProduction) {
      request.merchantInfo.merchantId = GOOGLE_PAY_MERCHANT_ID
    }
    return request
  }

  useEffect(() => {
    const loadAndInit = () => {
      if (!window.google?.payments) {
        const script = document.createElement('script')
        script.src = 'https://pay.google.com/gp/p/js/pay.js'
        script.async = true
        script.onload = () => initGooglePay()
        document.body.appendChild(script)
      } else {
        initGooglePay()
      }
    }

    const initGooglePay = () => {
      if (!window.google?.payments) return

      const client = new window.google.payments.api.PaymentsClient({
        environment: isProduction ? 'PRODUCTION' : 'TEST',
        paymentDataCallbacks: {
          onPaymentAuthorized: async (paymentData: any) => {
            try {
              setIsLoading(true)
              const token = paymentData.paymentMethodData.tokenizationData.token
              const success = await onProcessRef.current(token)
              setIsLoading(false)
              if (success) return { transactionState: 'SUCCESS' }
              return {
                transactionState: 'ERROR',
                error: { reason: 'PAYMENT_DATA_INVALID', message: 'Pago denegado', intent: 'PAYMENT_AUTHORIZATION' },
              }
            } catch (error: any) {
              setIsLoading(false)
              return {
                transactionState: 'ERROR',
                error: { reason: 'OTHER_ERROR', message: error.message || 'Error', intent: 'PAYMENT_AUTHORIZATION' },
              }
            }
          },
        },
      })

      client
        .isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
          }],
        })
        .then((response: any) => {
          if (!response.result) return
          setIsReady(true)

          // Usar createButton API oficial de Google Pay
          const button = client.createButton({
            onClick: async () => {
              if (disabled || isLoading) return
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

          if (containerRef.current) {
            containerRef.current.innerHTML = ''
            containerRef.current.appendChild(button)
          }
        })
        .catch(() => {})
    }

    loadAndInit()
  }, [isProduction, disabled])

  if (!isReady) return null

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ minHeight: 48 }}
    />
  )
}
