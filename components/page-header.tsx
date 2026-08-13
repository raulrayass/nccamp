import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
