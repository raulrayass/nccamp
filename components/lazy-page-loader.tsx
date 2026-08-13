'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Loading skeleton component
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-5 p-4 md:p-6" role="status" aria-label="Cargando sección" aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-56 max-w-[55vw]" />
        </div>
        <Skeleton variant="button" className="h-9 w-24" />
      </div>
      <div className="space-y-0 divide-y divide-border/40">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-4">
            <Skeleton variant="avatar" className="size-10 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-2/3" />
              <Skeleton variant="text" className="h-3 w-1/3" />
            </div>
            <Skeleton variant="button" className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Lazy load components with code splitting
export const LazyGamesClient = dynamic(() => import('@/components/games-client').then(mod => ({ default: mod.GamesClient })), {
  loading: () => <PageLoadingSkeleton />,
  ssr: true,
})

export const LazyTeamsClient = dynamic(() => import('@/components/teams-client').then(mod => ({ default: mod.TeamsClient })), {
  loading: () => <PageLoadingSkeleton />,
  ssr: true,
})

export const LazyAttendeesClient = dynamic(() => import('@/components/attendees-client').then(mod => ({ default: mod.AttendeesClient })), {
  loading: () => <PageLoadingSkeleton />,
  ssr: true,
})

// Wrapper component for lazy loading with Suspense
interface LazyPageWrapperProps {
  component: React.ComponentType<any>
  fallback?: React.ReactNode
  [key: string]: any
}

export function LazyPageWrapper({ component: Component, fallback, ...props }: LazyPageWrapperProps) {
  return (
    <Suspense fallback={fallback || <PageLoadingSkeleton />}>
      <Component {...props} />
    </Suspense>
  )
}
