'use client'
import { useEffect, useState, createContext, useContext } from 'react'

interface LoadingContextType {
  isLoading: boolean
}
const LoadingContext = createContext<LoadingContextType>({ isLoading: false })

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])
  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function LoadingScreen() {
  const { isLoading } = useLoading()
  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ease-out"
      style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none' }}
    >
      <div className="splash-enter flex flex-col items-center justify-center gap-8">
        {/* Logo: óvalo vertical con borde verde + hoja */}
        <div className="relative flex items-center justify-center">
          {/* Glow ambiental verde sutil detrás */}
          <div className="absolute inset-0 rounded-full bg-primary/15 blur-3xl scale-120 opacity-60" />

          <svg
            width="120"
            height="156"
            viewBox="0 0 180 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            {/* Óvalo contenedor */}
            <rect
              x="6"
              y="6"
              width="168"
              height="218"
              rx="84"
              fill="var(--card)"
              stroke="var(--primary)"
              strokeWidth="3"
            />
            {/* Hoja */}
            <path
              d="M90 46
                 C 120 78, 140 108, 140 138
                 C 140 170, 116 188, 90 190
                 C 64 188, 40 170, 40 138
                 C 40 108, 60 78, 90 46 Z"
              fill="var(--primary)"
            />
            {/* Sombra de nervadura sutil */}
            <path
              d="M90 46
                 C 120 78, 140 108, 140 138
                 C 140 170, 116 188, 90 190
                 L 90 46 Z"
              fill="#000000"
              fillOpacity="0.08"
            />
            {/* Tallo */}
            <rect x="86.5" y="188" width="7" height="28" rx="3.5" fill="var(--primary)" />
          </svg>
        </div>

        {/* Texto */}
        <div className="splash-text text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Permanece Camp
          </h1>
          <p className="text-primary text-sm font-medium">
            Nueva Creación
          </p>
        </div>

        {/* Indicador de carga - Pulse suave ML-style */}
        <div className="flex gap-2 mt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDuration: '1.8s' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '0.6s' }} />
        </div>
      </div>

      <style jsx>{`
        .splash-enter {
          animation: splashIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .splash-text {
          animation: splashText 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
        }
        @keyframes splashIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splashText {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
