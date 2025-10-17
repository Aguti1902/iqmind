import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
        <link rel="icon" href="/images/FAVICON2.png" type="image/png" />
        
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GT-NGM8ZF3V"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GT-NGM8ZF3V');
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
