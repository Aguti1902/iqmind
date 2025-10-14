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
    icon: '/images/Favicon.png',
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
        <link rel="icon" href="/images/Favicon.png" type="image/png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
