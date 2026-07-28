'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export interface DonutSlice {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutSlice[]
  formatValue?: (v: number) => string
  centerLabel?: string
  height?: number
}

export function DonutChart({
  data,
  formatValue = (v) => String(v),
  centerLabel = 'Total',
  height = 200,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Donut con total al centro */}
      <div className="relative" style={{ width: height, height, maxWidth: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={sorted.length > 1 ? 3 : 0}
              cornerRadius={6}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {sorted.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return [`${formatValue(value)} (${pct}%)`, name]
              }}
              contentStyle={{ borderRadius: '10px', fontSize: '13px', border: '1px solid var(--border)', background: 'var(--card)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-foreground tabular-nums leading-tight">
            {formatValue(total)}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Leyenda propia */}
      <div className="w-full space-y-1.5">
        {sorted.map((entry, i) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground truncate flex-1 min-w-0">{entry.name}</span>
              <span className="text-muted-foreground tabular-nums shrink-0">
                {formatValue(entry.value)}
              </span>
              <span className="text-muted-foreground tabular-nums w-9 text-right shrink-0">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
