'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartNoAxesCombined } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type TimelineEntry = {
  date: string
  values: Record<string, string | number>
  teams: Array<{ id: number; name: string; color: string; points: number }>
}

interface RankingHistoryChartProps {
  timeline: TimelineEntry[]
}

export function RankingHistoryChart({ timeline }: RankingHistoryChartProps) {
  const teamSeries = useMemo(() => {
    const seen = new Map<number, { id: number; name: string; color: string }>()
    timeline.forEach((day) => day.teams.forEach((team) => {
      if (!seen.has(team.id)) seen.set(team.id, { id: team.id, name: team.name, color: team.color })
    }))
    return Array.from(seen.values()).slice(0, 6)
  }, [timeline])

  if (timeline.length === 0) return null

  const data = timeline.map((day) => ({
    ...day.values,
    label: new Date(`${day.date}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
  }))

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <ChartNoAxesCombined className="h-4 w-4 text-primary" />
            Evolución del ranking
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Puntos acumulados por fecha del juego</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">Por día</span>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              {teamSeries.map((team) => (
                <Line
                  key={team.id}
                  type="monotone"
                  dataKey={`team_${team.id}`}
                  name={team.name}
                  stroke={team.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: team.color, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {teamSeries.map((team) => (
            <span key={team.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: team.color }} />
              <span className="max-w-32 truncate">{team.name}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
