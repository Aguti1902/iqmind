import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ejemplo Sipay - Pago con tarjeta (iframe)",
  description: "Ejemplo de integración iframe FastPay con Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
