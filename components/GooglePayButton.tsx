'use client'

import { useEffect, useState, useRef } from 'react'

const GOOGLE_PAY_MERCHANT_ID = '18013341542947814368'

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
  const [paymentsClient, setPaymentsClient] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const onProcessRef = useRef(onProcessPayment)
  onProcessRef.current = onProcessPayment
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const isProduction = env === 'live'

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
  }

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

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google?.payments) {
      const script = document.createElement('script')
      script.src = 'https://pay.google.com/gp/p/js/pay.js'
      script.async = true
      script.onload = initGooglePay
      document.body.appendChild(script)
    } else if (window.google?.payments) {
      initGooglePay()
    }
  }, [])

  const initGooglePay = () => {
    if (!window.google?.payments) return

    const client = new window.google.payments.api.PaymentsClient({
      environment: isProduction ? 'PRODUCTION' : 'TEST',
      paymentDataCallbacks: {
        onPaymentAuthorized: async (paymentData: any) => {
          try {
            const token = paymentData.paymentMethodData.tokenizationData.token
            console.log('🔍 Google Pay token recibido, procesando pago...')
            const success = await onProcessRef.current(token)
            if (success) {
              return { transactionState: 'SUCCESS' }
            } else {
              return {
                transactionState: 'ERROR',
                error: { reason: 'PAYMENT_DATA_INVALID', message: 'Pago denegado', intent: 'PAYMENT_AUTHORIZATION' }
              }
            }
          } catch (error: any) {
            console.error('❌ Google Pay processing error:', error)
            return {
              transactionState: 'ERROR',
              error: { reason: 'OTHER_ERROR', message: error.message || 'Error procesando pago', intent: 'PAYMENT_AUTHORIZATION' }
            }
          }
        },
      },
    })

    setPaymentsClient(client)

    const isReadyToPayRequest = {
      ...baseRequest,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA'],
        },
      }],
    }

    client
      .isReadyToPay(isReadyToPayRequest)
      .then((response: any) => {
        if (response.result) {
          setIsReady(true)
        }
      })
      .catch((err: Error) => {
        console.error('Google Pay no disponible:', err)
      })
  }

  const handleClick = async () => {
    if (!paymentsClient || isLoading || disabled) return

    setIsLoading(true)

    try {
      const paymentDataRequest: any = {
        ...baseRequest,
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
        paymentDataRequest.merchantInfo.merchantId = GOOGLE_PAY_MERCHANT_ID
      }

      await paymentsClient.loadPaymentData(paymentDataRequest)
    } catch (error: any) {
      if (error.statusCode !== 'CANCELED') {
        console.error('❌ Google Pay error:', error)
        onErrorRef.current(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isReady) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <>
          <svg width="50" height="20" viewBox="0 0 435 174" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M206.2 84.7v50.6h-16.1V10h42.7c10.3-.2 20.2 3.7 27.7 10.9 7.6 6.8 11.9 16.5 11.8 26.6.1 10.2-4.2 19.9-11.8 26.8-7.5 7.2-16.8 10.8-27.9 10.8h-26.4v-.4zm0-59.2v43.6h26.7c6.2.2 12.2-2.2 16.6-6.6 8.8-8.2 9.2-22 1-30.8-.3-.4-.7-.7-1-1-4.4-4.5-10.4-7-16.6-6.8h-26.7v1.6z" fill="#5F6368"/>
            <path d="M310.5 50.1c11.8 0 21.1 3.2 27.9 9.5 6.8 6.3 10.2 15 10.2 26v52.6h-15.4v-11.8h-.7c-6.6 9.7-15.3 14.5-26.3 14.5-9.4 0-17.2-2.8-23.5-8.3-6.2-5.2-9.7-12.8-9.5-20.8-.2-8.4 3.5-16.4 10-21.7 6.9-5.6 16-8.4 27.5-8.4 9.8 0 17.9 1.8 24.2 5.4v-3.8c0-5.7-2.5-11.1-6.9-14.8-4.4-4-10.2-6.2-16.1-6.1-9.3 0-16.7 3.9-22 11.8l-14.2-8.9c7.8-11.6 19.5-17.4 35-17.4l-.2.2zm-20.8 62.4c-.1 4.4 2 8.5 5.5 11.1 3.8 3 8.5 4.6 13.4 4.5 7.3 0 14.2-2.9 19.3-8 5.5-5.2 8.2-11.4 8.2-18.5-5.2-4.1-12.5-6.2-21.8-6.2-6.8 0-12.5 1.7-17 5-4.5 3.2-7.1 7.4-7.1 12.1h-.5z" fill="#5F6368"/>
            <path d="M434.4 52.9l-53.8 123.6h-16.6l20-43.2-35.4-80.3h17.5l25.5 61.6h.3l24.8-61.6h17.7v-.1z" fill="#5F6368"/>
            <path d="M148.4 71.9c0-5-0.4-9.9-1.2-14.8H75.7v28h41c-1.6 9.1-6.8 17.1-14.5 22.3v18h23.3c13.7-12.6 21.6-31.2 21.6-53.5h1.3z" fill="#4285F4"/>
            <path d="M75.7 138.5c19.6 0 36.2-6.4 48.3-17.5l-23.3-18c-6.5 4.4-14.9 6.9-25 6.9-19.1 0-35.3-12.9-41.1-30.2H10.2v18.6c12.4 24.6 37.8 40.2 65.5 40.2z" fill="#34A853"/>
            <path d="M34.6 79.7c-3.1-9.1-3.1-19 0-28.1V33H10.2C0 53.2 0 76.8 10.2 97l24.4-17.3z" fill="#FBBC04"/>
            <path d="M75.7 21.4c10.5-.2 20.6 3.8 28.3 11l21-21C111.8 1.3 94.2-3.1 75.7-2.9 48 -2.9 22.5 12.7 10.2 37.3l24.4 18.6c5.7-17.4 21.9-30.2 41.1-34.5z" fill="#EA4335"/>
          </svg>
        </>
      )}
    </button>
  )
}
