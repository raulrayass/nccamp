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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500"
      style={{ opacity: isLoading ? 1 : 0 }}
    >
      <div className="splash-enter flex flex-col items-center justify-center gap-6">
        {/* Logo: óvalo vertical con borde verde + hoja tipo MongoDB */}
        <div className="relative flex items-center justify-center">
          {/* Glow ambiental verde detrás */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-110" />

          <svg
            width="130"
            height="168"
            viewBox="0 0 180 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            {/* Óvalo contenedor (forma píldora vertical, como el logo real) */}
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
            {/* Hoja (forma de ojo con punta arriba y abajo) */}
            <path
              d="M90 46
                 C 120 78, 140 108, 140 138
                 C 140 170, 116 188, 90 190
                 C 64 188, 40 170, 40 138
                 C 40 108, 60 78, 90 46 Z"
              fill="var(--primary)"
            />
            {/* Mitad derecha ligeramente más oscura, para el efecto de nervadura */}
            <path
              d="M90 46
                 C 120 78, 140 108, 140 138
                 C 140 170, 116 188, 90 190
                 L 90 46 Z"
              fill="#000000"
              fillOpacity="0.10"
            />
            {/* Tallo */}
            <rect x="86.5" y="188" width="7" height="28" rx="3.5" fill="var(--primary)" />
          </svg>
        </div>

        {/* Texto */}
        <div className="splash-text text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Permanece Camp
          </h1>
          <p className="text-primary text-sm md:text-base mt-1 font-medium">
            Nueva Creación
          </p>
        </div>

        {/* Indicador de carga (puntos) */}
        <div className="flex gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      <style jsx>{`
        .splash-enter {
          animation: splashIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .splash-text {
          animation: splashText 0.6s ease-out 0.3s both;
        }
        @keyframes splashIn {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splashText {
          from {
            opacity: 0;
            transform: translateY(8px);
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
