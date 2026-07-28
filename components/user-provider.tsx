'use client'

import { createContext, useContext, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { authClient } from '@/lib/auth-client'
import Image from 'next/image'

interface UserCtx {
  user: { id: string; email: string; name: string | null } | null
  signOut: () => void
}

const UserContext = createContext<UserCtx>({ user: null, signOut: () => {} })

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const [oauthError, setOAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || null,
  } : null

  const signOut = async () => {
    setOAuthError(null)
    setIsLoading(false)
    await authClient.signOut()
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setOAuthError(null)
    try {
      console.log('[v0] Starting Google OAuth...')
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
      
      console.log('[v0] Google OAuth response:', { url: result?.data?.url, error: result?.error })
      
      if (result?.data?.url) {
        console.log('[v0] Redirecting to Google...')
        // Add prompt=select_account to force account selection on every login
        const googleAuthUrl = result.data.url + (result.data.url.includes('?') ? '&' : '?') + 'prompt=select_account'
        window.location.href = googleAuthUrl
      } else if (result?.error) {
        setOAuthError(result.error.message || 'Error en autenticación')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('[v0] Google OAuth error:', err)
      setOAuthError(err?.message || 'Error conectando con Google')
      setIsLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/permanece-camp-logo.png"
              alt="Permanece Camp"
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-contain mb-4 shadow-lg"
              priority
            />
            <h1 className="text-2xl font-bold text-foreground text-balance text-center">Permanece Camp</h1>
            <p className="text-accent text-sm font-medium mt-0.5">Nueva Creacion</p>
            <p className="text-muted-foreground text-xs mt-1 text-center">
              Administracion general 
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-1">Inicia sesión con Google</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Usa tu cuenta de Gmail para acceder de forma segura.
            </p>
            
            {oauthError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                <p className="text-sm text-destructive">{oauthError}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || isPending}
              className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black border border-border rounded-lg hover:bg-muted transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isLoading && (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isLoading && (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? 'Conectando...' : 'Iniciar sesión con Google'}
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Debes tener una cuenta de Gmail para acceder.
          </p>
        </div>
      </div>
    )
  }

  return (
    <UserContext.Provider value={{ user, signOut }}>
      {children}
    </UserContext.Provider>
  )
}
