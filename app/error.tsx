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
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="flex flex-col items-center justify-center gap-6 px-4 max-w-md">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Oops! Algo salió mal</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Lamentamos los inconvenientes. Estamos trabajando para resolver el problema lo antes posible.
          </p>
        </div>

        {/* Error Details */}
        {error.message && (
          <div className="w-full bg-card border border-border rounded-xl p-3 text-left">
            <p className="text-xs font-mono text-muted-foreground truncate">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <Button
            onClick={reset}
            className="flex-1 gap-2 h-11"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex-1 gap-2 h-11"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border w-full">
          Si el problema persiste, contacta con soporte
        </p>
      </div>
    </div>
  )
}
