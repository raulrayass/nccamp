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
        return 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10'
      case 'partial':
        return 'border-amber-200 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/10'
      case 'pending':
        return 'border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10'
      case 'checked':
        return 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10'
      case 'unchecked':
        return 'border-muted'
      default:
        return 'border-border'
    }
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        'border transition-all duration-200',
        interactive && 'hover:shadow-lg hover:border-foreground/40 cursor-pointer active:scale-95 sm:hover:scale-[1.02]',
        getStatusColor(),
        className
      )}
    >
      {children}
    </Card>
  )
}
