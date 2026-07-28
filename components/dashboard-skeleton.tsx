import { GridSkeleton, StatCardSkeleton, ChartSkeleton, CardSkeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Balance stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} className="h-16" />
          ))}
        </div>
        <ChartSkeleton />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartSkeleton />
        <CardSkeleton className="h-64" />
      </div>
    </div>
  )
}
