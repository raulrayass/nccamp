interface StatItem {
  label: string
  value: number | string
  icon?: React.ReactNode
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive'
}

interface StatsBarProps {
  items: StatItem[]
}

export function StatsBar({ items }: StatsBarProps) {
  const colorClasses = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    destructive: 'text-red-600',
  }

  return (
    <div className="flex items-stretch justify-between gap-2 sm:gap-4 py-0">
      {items.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-card">
          <div className="flex items-center gap-1 justify-center">
            {item.icon && <div className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses[item.color || 'default']}`}>{item.icon}</div>}
            <p className={`text-base sm:text-lg font-bold ${colorClasses[item.color || 'default']}`}>
              {item.value}
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-medium text-center">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
