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
          <div key={i} className="flex items-center gap-3 border-b border-border/40 py-3 sm:gap-4 sm:py-4">
            <Skeleton variant="avatar" className="size-10 shrink-0 sm:size-12" />
            <div className="min-w-0 flex-1 space-y-2 sm:space-y-2.5">
              <Skeleton variant="text" className="h-4 w-2/5 sm:w-1/3" />
              <Skeleton variant="text" className="h-3 w-3/5 sm:w-1/2" />
            </div>
            <Skeleton variant="button" className="h-8 w-16 shrink-0 sm:w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2 sm:space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex h-12 items-center border-b border-border/40 py-3 sm:h-14 sm:py-4">
            <Skeleton variant="text" className="h-3 w-2/3" />
          </div>
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
