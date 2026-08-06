import { GridSkeleton, StatCardSkeleton, ChartSkeleton, CardSkeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Balance stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} className="h-16" />
          ))}
        </div>
        <ChartSkeleton />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <ChartSkeleton />
        <CardSkeleton className="h-64" />
      </div>
    </div>
  )
}
