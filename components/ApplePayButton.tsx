'use client'

import { useEffect, useState, useRef } from 'react'

declare global {
  interface Window {
    ApplePaySession?: {
      new (version: number, request: any): any
      canMakePayments: () => boolean
      supportsVersion: (version: number) => boolean
      STATUS_SUCCESS: number
      STATUS_FAILURE: number
    }
  }
}

type ApplePayButtonProps = {
  amount: number
  currency?: string
  onProcessPayment: (token: any, requestId: string) => Promise<boolean>
  onError: (error: Error) => void
  disabled?: boolean
}

export default function ApplePayButton({
  amount,
  currency = 'EUR',
  onProcessPayment,
  onError,
  disabled = false,
}: ApplePayButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const onProcessRef = useRef(onProcessPayment)
  onProcessRef.current = onProcessPayment

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      try {
        if (window.ApplePaySession.canMakePayments()) {
          setIsAvailable(true)
        }
      } catch (e) {
        console.log('Apple Pay no disponible')
      }
    }
  }, [])

  const handleClick = async () => {
    if (!window.ApplePaySession || isLoading || disabled) return

    setIsLoading(true)

    try {
      const paymentRequest = {
        countryCode: 'ES',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'MindMetric',
          amount: amount.toFixed(2),
          type: 'final' as const,
        },
      }

      const session = new window.ApplePaySession(3, paymentRequest)
      let sessionRequestId = ''

      session.onvalidatemerchant = async (event: any) => {
        try {
          const response = await fetch('/api/sipay/apple-pay/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validationURL: event.validationURL }),
          })

          if (!response.ok) {
            throw new Error('Error validando merchant')
          }

          const data = await response.json()
          sessionRequestId = data.request_id
          session.completeMerchantValidation(data.merchantSession)
        } catch (error) {
          console.error('❌ Apple Pay merchant validation error:', error)
          session.abort()
          onError(error as Error)
          setIsLoading(false)
        }
      }

      session.onpaymentauthorized = async (event: any) => {
        try {
          const fullToken = event.payment.token
          const success = await onProcessRef.current(fullToken, sessionRequestId)

          if (success) {
            session.completePayment(window.ApplePaySession!.STATUS_SUCCESS)
          } else {
            session.completePayment(window.ApplePaySession!.STATUS_FAILURE)
          }
        } catch (error) {
          console.error('❌ Apple Pay authorization error:', error)
          session.completePayment(window.ApplePaySession!.STATUS_FAILURE)
          onError(error as Error)
        } finally {
          setIsLoading(false)
        }
      }

      session.oncancel = () => {
        setIsLoading(false)
      }

      session.begin()
    } catch (error: any) {
      onError(error)
      setIsLoading(false)
    }
  }

  if (!isAvailable) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      style={{ WebkitAppearance: 'none' }}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span>Apple Pay</span>
        </>
      )}
    </button>
  )
}
