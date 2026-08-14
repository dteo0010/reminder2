import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Inter } from 'next/font/google'
import { NavBar } from '@/components/NavBar'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import './globals.css'

const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })

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
  themeColor: '#0a0b0d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body className="bg-bg text-text min-h-screen">
        <ServiceWorkerRegister />
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}