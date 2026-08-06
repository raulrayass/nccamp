import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6">
      <section className="border-b border-border/70 pb-5 sm:pb-6">
        <Skeleton className="mb-3 h-3 w-24 rounded-full" />
        <Skeleton className="h-10 w-48 rounded-full" />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="border-b border-border/70 py-4 sm:py-5">
            <Skeleton className="mb-2 h-3 w-24 rounded-full" />
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>
        ))}
      </div>

      <section className="border-t border-border/70 pt-6">
        <Skeleton className="mb-5 h-4 w-40 rounded-full" />
        <div className="space-y-5">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 pt-6">
        <Skeleton className="mb-4 h-4 w-36 rounded-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border/70 py-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
