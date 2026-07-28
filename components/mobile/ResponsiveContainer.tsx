'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'compact' | 'normal' | 'loose'
  gap?: 'compact' | 'normal' | 'loose'
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
}

const paddingMap = {
  none: 'px-0 py-0',
  compact: 'px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4',
  normal: 'px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6',
  loose: 'px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8',
}

const gapMap = {
  compact: 'gap-2 md:gap-3',
  normal: 'gap-3 md:gap-4',
  loose: 'gap-4 md:gap-6',
}

const maxWidthMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-7xl',
  full: 'max-w-none',
}

export function ResponsiveContainer({
  children,
  className,
  padding = 'normal',
  gap = 'normal',
  maxWidth = 'lg',
}: ResponsiveContainerProps) {
  return (
    <div className={cn('w-full mx-auto flex flex-col', paddingMap[padding], gapMap[gap], maxWidthMap[maxWidth], className)}>
      {children}
    </div>
  )
}
