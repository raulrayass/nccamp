'use client'

import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-card to-background px-4">
      <div className="flex flex-col items-center justify-center gap-6 max-w-lg w-full">
        {/* Large 404 */}
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="relative text-center">
            <div className="text-7xl sm:text-8xl font-black text-amber-600 dark:text-amber-400 leading-none">
              404
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-foreground">Página no encontrada</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Lo sentimos, la página que buscas no existe o fue movida. Vuelve al inicio para continuar.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full gap-3 pt-2">
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full gap-2 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full gap-2 h-12 font-bold rounded-xl"
          >
            <Search className="w-4 h-4" />
            Volver atrás
          </Button>
        </div>

        {/* Footer */}
        <div className="w-full pt-4 border-t border-border text-center space-y-2">
          <a href="mailto:rayassanchez01@gmail.com" className="text-xs text-primary font-semibold hover:underline block">
            ¿Necesitas ayuda? rayassanchez01@gmail.com
          </a>
          <div className="text-xs text-muted-foreground">
            <p>Nueva Creación Zapopan 2026 • NCZ</p>
            <p className="text-[10px] mt-1">Derechos reservados © 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
