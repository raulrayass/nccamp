'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-card to-background px-4">
      <div className="flex flex-col items-center justify-center gap-6 max-w-lg w-full">
        {/* Icon with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-foreground">¡Oops!</h1>
          <h2 className="text-xl font-bold text-foreground">Algo salió mal</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Lamentamos los inconvenientes. Estamos trabajando para resolver el problema lo antes posible.
          </p>
        </div>

        {/* Error Details */}
        {error.message && (
          <div className="w-full bg-card border border-red-200 dark:border-red-900/30 rounded-2xl p-4 text-left shadow-md">
            <p className="text-xs font-mono text-muted-foreground line-clamp-2">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col w-full gap-3 pt-2">
          <Button
            onClick={reset}
            className="w-full gap-2 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full gap-2 h-12 font-bold rounded-xl"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Button>
        </div>

        {/* Support */}
        <div className="w-full pt-4 border-t border-border text-center space-y-1">
          <p className="text-xs text-muted-foreground">¿Necesitas ayuda?</p>
          <a href="mailto:rayassanchez01@gmail.com" className="text-xs text-primary font-semibold hover:underline">
            Contactar con soporte: rayassanchez01@gmail.com
          </a>
        </div>

        {/* Footer */}
        <div className="w-full pt-4 border-t border-border text-center text-xs text-muted-foreground">
          <p>Nueva Creación Zapopan 2026 • NCZ</p>
          <p className="text-[10px] mt-1">Derechos reservados © 2026</p>
        </div>
      </div>
    </div>
  )
}
