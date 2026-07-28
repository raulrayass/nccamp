import { CardSkeleton, Skeleton } from '@/components/ui/skeleton'

interface ListSkeletonProps {
  count?: number
  variant?: 'card' | 'row' | 'compact'
}

export function ListSkeleton({ count = 5, variant = 'card' }: ListSkeletonProps) {
  if (variant === 'row') {
    return (
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="clay-card p-3 sm:p-4 rounded-xl sm:rounded-2xl flex gap-3 sm:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 animate-skeleton-shimmer" />
            <div className="flex-1 space-y-2 sm:space-y-2.5">
              <Skeleton className="h-4 w-2/5 sm:w-1/3 animate-skeleton-shimmer" />
              <Skeleton className="h-3 w-3/5 sm:w-1/2 animate-skeleton-shimmer" />
            </div>
            <Skeleton className="w-16 sm:w-20 h-5 sm:h-6 flex-shrink-0 animate-skeleton-shimmer" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2 sm:space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="clay-card p-3 sm:p-4 rounded-xl sm:rounded-2xl h-12 sm:h-14 animate-skeleton-shimmer" />
        ))}
      </div>
    )
  }

  // Default card variant
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} className="min-h-40 sm:min-h-48" />
      ))}
    </div>
  )
}
