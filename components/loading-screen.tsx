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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-200"
      style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none' }}
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación"
    >
      <div className="flex items-center gap-3">
        <Image src="/permanece-camp-logo.png" alt="" width={28} height={28} className="size-7 rounded-md object-contain" priority />
        <span className="text-sm font-semibold tracking-tight text-foreground">Permanece Camp</span>
        <span className="ml-1 size-3 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      </div>
    </div>
  )
}
