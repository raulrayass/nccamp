'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    try {
      const data = await authClient.signIn.social({
        provider: 'google',
        callbackURL: typeof window !== 'undefined' ? window.location.origin : '/',
      })
      
      if (data?.data?.url) {
        window.location.href = data.data.url
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      console.error('[v0] Google OAuth error:', err)
      setError(err?.message ?? 'Ocurrió un error al iniciar sesión con Google')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/permanece-camp-logo.png"
            alt="Permanece Camp"
            width={48}
            height={48}
            className="w-12 h-12 rounded-lg object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">Permanece Camp</span>
            <span className="text-xs text-muted-foreground">Sistema de Gestión</span>
          </div>
        </div>

        <Card className="p-8 shadow-lg border-0">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Bienvenido</h1>
            <p className="text-sm text-muted-foreground">
              Inicia sesión con tu cuenta de Google para continuar
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              </div>
            )}

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              size="lg"
              className="w-full h-12 font-medium gap-2 bg-white text-foreground hover:bg-muted border border-input"
              variant="outline"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Iniciar sesión con Google
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Al iniciar sesión, aceptas nuestros términos y política de privacidad
          </p>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Permanece Camp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </main>
  )
}
