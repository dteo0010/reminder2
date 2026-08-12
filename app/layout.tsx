import type { Metadata, Viewport } from 'next'
import { NavBar } from '@/components/NavBar'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'Renewal Reminder',
  description: 'Track road tax, licence, passport, insurance, and subscription renewals in one place.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Renewals',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        <NavBar />
        {children}
      </body>
    </html>
  )
}

