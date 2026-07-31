'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'avatar' | 'card' | 'input' | 'button'
}

/**
 * Base Skeleton component with neumorphism pulse animation
 */
export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variants = {
    default: 'h-12 w-12 rounded-xl',
    text: 'h-4 w-full rounded-md',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-40 w-full rounded-2xl',
    input: 'h-10 w-full rounded-lg',
    button: 'h-10 w-32 rounded-lg',
  }

  return (
    <div
      className={cn(
        'bg-muted animate-skeleton-shimmer',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

/**
 * Card skeleton with header, text lines, and footer
 */
export function CardSkeleton() {
  return (
    <div className="clay-card p-4 sm:p-6 rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-6 w-40" />
          <Skeleton variant="avatar" className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-5/6" />
          <Skeleton variant="text" className="h-4 w-4/6" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="button" className="h-9 w-20" />
          <Skeleton variant="button" className="h-9 w-20" />
        </div>
      </div>
    </div>
  )
}

/**
 * Table skeleton with rows
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="clay-card rounded-2xl overflow-hidden">
      <div className="space-y-0">
        {/* Header */}
        <div className="flex gap-4 p-4 border-b border-border">
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-border/50">
            <Skeleton variant="avatar" className="h-10 w-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-1/2" />
              <Skeleton variant="text" className="h-3 w-1/3" />
            </div>
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * List skeleton for items in a vertical list
 */
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton variant="avatar" className="h-12 w-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Dashboard stat card skeleton
 */
export function StatCardSkeleton() {
  return (
    <div className="stat-card p-5 sm:p-6 rounded-2xl">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-3 w-24" />
            <Skeleton variant="text" className="h-6 w-32" />
          </div>
          <Skeleton variant="avatar" className="h-12 w-12" />
        </div>
        <Skeleton variant="text" className="h-2 w-20" />
      </div>
    </div>
  )
}

/**
 * Chart skeleton with grid lines
 */
export function ChartSkeleton() {
  return (
    <div className="aurora-card p-5 sm:p-6 rounded-2xl min-h-80">
      <div className="space-y-3">
        <Skeleton variant="text" className="h-4 w-40 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="text" className="h-3 w-12" />
              <Skeleton variant="text" className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Form field skeleton
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-24" />
      <Skeleton variant="input" className="h-10 w-full" />
    </div>
  )
}

/**
 * Grid skeleton for dashboard
 */
export function GridSkeleton({ cols = 2, rows = 3 }: { cols?: number; rows?: number }) {
  return (
    <div className={`grid grid-cols-1 ${cols > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Mobile optimized list skeleton
 */
export function MobileListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="clay-card flex gap-3 p-3 sm:p-4 rounded-2xl">
          <Skeleton variant="avatar" className="h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-3 w-3/4" />
            <Skeleton variant="text" className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
