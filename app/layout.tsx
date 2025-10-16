import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
   title: 'IQmind - Test de Inteligencia Online | Descubre tu CI',
  description: 'Descubre tu nivel de inteligencia en minutos con nuestro test científico de CI. Resultados precisos y personalizados.',
  keywords: 'test IQ, test inteligencia, CI, coeficiente intelectual, test online, IQmind',
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
        <Analytics />
        <link rel="icon" href="/images/FAVICON2.png" type="image/png" />
        
        {/* Google Ads Tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17655739355"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17655739355');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
