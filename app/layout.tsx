import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
   title: 'MindMetric - Professional Intelligence Assessment | Discover Your IQ',
  description: 'Unlock your cognitive potential with MindMetric\'s advanced intelligence assessment. Get precise, personalized results in minutes through scientifically validated testing.',
  keywords: 'intelligence test, IQ assessment, cognitive analysis, mind metrics, professional IQ test, mental evaluation',
  icons: {
    icon: '/images/FAVICON2.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/images/FAVICON2.png" type="image/png" />
        {/* Script de FastPay cargado GLOBALMENTE para toda la app */}
        <script
          type="text/javascript"
          src="https://sandbox.sipay.es/fpay/v1/static/bundle/fastpay.js"
        />
        {/* Script de verificación inmediata */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🚀 [LAYOUT] Verificación inicial del script FastPay')
              window.addEventListener('load', function() {
                setTimeout(function() {
                  console.log('🔍 [LAYOUT] Estado después de window.load:')
                  console.log('  - FastPay global:', typeof window.FastPay)
                  console.log('  - Script en DOM:', !!document.querySelector('script[src*="fastpay.js"]'))
                  var script = document.querySelector('script[src*="fastpay.js"]')
                  if (script) {
                    console.log('  - Script loaded:', script.loaded || 'unknown')
                    console.log('  - Script readyState:', script.readyState || 'unknown')
                  }
                }, 500)
              })
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
