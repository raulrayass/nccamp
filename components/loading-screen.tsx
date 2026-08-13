'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import Image from 'next/image'

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
    }, 450)
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300"
      style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none' }}
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación"
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="motion-safe:animate-[loading-mark-in_500ms_ease-out_both]">
          <Image
            src="/permanece-camp-logo.png"
            alt="Permanece Camp"
            width={96}
            height={96}
            className="size-24 rounded-2xl object-contain"
            priority
          />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-semibold tracking-tight text-foreground">Permanece Camp</p>
          <p className="text-sm text-muted-foreground">Preparando tu espacio</p>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
          <span className="size-1.5 rounded-full bg-primary/60 motion-safe:animate-pulse [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-primary/30 motion-safe:animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
      <style jsx>{`
        @keyframes loading-mark-in {
          from { opacity: 0; transform: translateY(6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
