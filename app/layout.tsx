import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Madedeco – Tarjeta de Fidelización',
  description: 'Acumulá sellos con cada compra y obtené un 20% de descuento en tu próxima visita.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Madedeco – Tarjeta de Fidelización',
    description: 'Tu tarjeta de cliente fiel de Madedeco.',
    siteName: 'Madedeco',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
