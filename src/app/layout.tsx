import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Providers from '@/components/providers/Providers'
import RoleSwitcher from '@/components/dev/RoleSwitcher'
import PWARegister from '@/components/pwa/PWARegister'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TuMarca - Farmacia Online 24/7',
  description: 'Tu farmacia online con delivery 24/7 en Venezuela',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'TuMarca' },
  other: { 'mobile-web-app-capable': 'yes' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          <Providers>{children}</Providers>
          <RoleSwitcher />
          <PWARegister />
        </body>
      </html>
    </ClerkProvider>
  )
}
