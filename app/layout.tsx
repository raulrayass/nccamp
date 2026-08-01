import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Poppins, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { UserProvider } from '@/components/user-provider'
import { EventSessionProvider } from '@/lib/contexts/event-session-context'
import { LoadingScreen, LoadingProvider } from '@/components/loading-screen'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const poppins = Poppins({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
})
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Permanece Camp',
  description: 'Control de ingresos y egresos del campamento Permanece Camp de Nueva Creacion. Registra comida, hospedaje, pago de camperos y mas.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} bg-background`}>
      <head>
        {/* Banderas nítidas (flag-icons) para los proyectores FIFA */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <LoadingProvider>
          <LoadingScreen />
          <UserProvider>
            <EventSessionProvider>
              {children}
            </EventSessionProvider>
          </UserProvider>
        </LoadingProvider>
        <Toaster 
          position="top-center" 
          richColors 
          closeButton={false}
          visibleToasts={1}
          gap={20}
          duration={3500}
          theme="system"
          toastOptions={{
            style: {
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              border: 'none',
              padding: '14px 32px',
              fontWeight: '500',
              fontSize: '0.95rem',
              animation: 'slideDown 0.4s ease-out',
            },
            success: {
              style: {
                background: '#10b981',
                color: '#ffffff',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#10b981',
              },
              duration: 3000,
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#ffffff',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#ef4444',
              },
              duration: 4000,
            },
            loading: {
              style: {
                background: '#3b82f6',
                color: '#ffffff',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#3b82f6',
              },
              duration: Infinity,
            },
          }}
        />
      </body>
    </html>
  )
}
