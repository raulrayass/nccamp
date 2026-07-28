'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Loading skeleton component
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <Skeleton className="h-12 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
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
