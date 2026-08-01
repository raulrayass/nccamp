import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Poppins } from 'next/font/google'
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
  weight: ['500', '600', '700'],
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} bg-background`}>
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
          position="bottom-right" 
          richColors 
          closeButton 
          expand
          visibleToasts={3}
          gap={12}
          theme="system"
          toastOptions={{
            style: {
              borderRadius: '0.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              padding: '16px 20px',
              fontWeight: '500',
              fontSize: '0.95rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ecfdf5',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fef2f2',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#eff6ff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
