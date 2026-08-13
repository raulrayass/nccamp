import { StatCardSkeleton, ChartSkeleton, CardSkeleton } from '@/components/ui/skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Cargando dashboard" aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton variant="text" className="h-6 w-44" />
          <Skeleton variant="text" className="h-3 w-64 max-w-[60vw]" />
        </div>
        <Skeleton variant="button" className="h-9 w-24" />
      </div>

      {/* Balance stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} className="h-16" />
          ))}
        </div>
        <ChartSkeleton />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartSkeleton />
        <CardSkeleton className="h-64" />
      </div>
    </div>
  )
}
