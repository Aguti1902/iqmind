'use client'

import { useEffect, useState, useCallback } from 'react'

// Google Pay Merchant ID proporcionado por Sipay
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
  onSuccess: (token: string) => void
  onError: (error: Error) => void
  disabled?: boolean
}

export default function GooglePayButton({
  amount,
  currency = 'EUR',
  onSuccess,
  onError,
  disabled = false,
}: GooglePayButtonProps) {
  const [paymentsClient, setPaymentsClient] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Configuración base de Google Pay
  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
  }

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'sipay',
      gatewayMerchantId: 'clicklabsdigital', // Key de Sipay
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

  const getGooglePaymentDataRequest = useCallback(() => {
    return {
      ...baseRequest,
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: amount.toFixed(2),
        currencyCode: currency,
        countryCode: 'ES',
      },
      merchantInfo: {
        merchantId: GOOGLE_PAY_MERCHANT_ID,
        merchantName: 'MindMetric',
      },
      callbackIntents: ['PAYMENT_AUTHORIZATION'],
    }
  }, [amount, currency])

  useEffect(() => {
    // Cargar el script de Google Pay
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
      environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
      paymentDataCallbacks: {
        onPaymentAuthorized: (paymentData: any) => {
          return new Promise((resolve) => {
            try {
              const token = paymentData.paymentMethodData.tokenizationData.token
              onSuccess(token)
              resolve({ transactionState: 'SUCCESS' })
            } catch (error) {
              resolve({ transactionState: 'ERROR', error: { reason: 'PAYMENT_DATA_INVALID' } })
            }
          })
        },
      },
    })

    setPaymentsClient(client)

    // Verificar si Google Pay está disponible
    client
      .isReadyToPay({ ...baseRequest, allowedPaymentMethods: [cardPaymentMethod] })
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
      const paymentDataRequest = getGooglePaymentDataRequest()
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest)
      // El callback onPaymentAuthorized se encarga del resto
    } catch (error: any) {
      if (error.statusCode !== 'CANCELED') {
        onError(error)
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
      className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
          </svg>
          <span>Google Pay</span>
        </>
      )}
    </button>
  )
}
