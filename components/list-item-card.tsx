'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ListItemCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  interactive?: boolean
  status?: 'paid' | 'partial' | 'pending' | 'checked' | 'unchecked'
}

export function ListItemCard({
  children,
  className,
  onClick,
  interactive = true,
  status,
}: ListItemCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'paid':
        return 'border-emerald-300/50 dark:border-emerald-500/20 bg-emerald-500/[0.025] dark:bg-emerald-500/[0.04]'

      case 'partial':
        return 'border-amber-300/50 dark:border-amber-500/20 bg-amber-500/[0.025] dark:bg-amber-500/[0.04]'

      case 'pending':
        return 'border-red-300/50 dark:border-red-500/20 bg-red-500/[0.025] dark:bg-red-500/[0.04]'

      case 'checked':
        return 'border-emerald-300/50 dark:border-emerald-500/20 bg-emerald-500/[0.025] dark:bg-emerald-500/[0.04]'

      case 'unchecked':
        return 'border-border bg-background'

      default:
        return 'border-border bg-background'
    }
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden border shadow-sm transition-all duration-300',
        interactive &&
          'cursor-pointer hover:shadow-md hover:border-foreground/20 active:scale-[0.99] sm:hover:scale-[1.005] sm:hover:-translate-y-0.5',
        getStatusColor(),
        className
      )}
    >
      {children}
    </Card>
  )
}