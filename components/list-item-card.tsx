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
        return 'border-emerald-200 dark:border-emerald-400/20 bg-emerald-50/40 dark:bg-muted/20'
      case 'partial':
        return 'border-amber-200 dark:border-amber-400/20 bg-amber-50/40 dark:bg-muted/20'
      case 'pending':
        return 'border-red-200 dark:border-red-400/20 bg-red-50/40 dark:bg-muted/20'
      case 'checked':
        return 'border-emerald-200 dark:border-emerald-400/20 bg-emerald-50/40 dark:bg-muted/20'
      case 'unchecked':
        return 'border-muted dark:border-muted/50'
      default:
        return 'border-border dark:border-border/50'
    }
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        'border transition-all duration-300 shadow-md',
        interactive && 'hover:shadow-xl hover:border-foreground/50 cursor-pointer active:scale-95 sm:hover:scale-[1.01] sm:hover:-translate-y-1',
        getStatusColor(),
        className
      )}
    >
      {children}
    </Card>
  )
}
