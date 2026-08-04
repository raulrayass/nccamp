'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboardStats } from '@/lib/hooks'
import { Gamepad2, Users2, Trophy, Target, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GameStatsCard() {
  const router = useRouter()
  const { totalGames, totalTeams, topTeamByPoints, gamesThisWeek, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded mb-2 w-2/3" />
            <div className="h-6 bg-muted rounded w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'Juegos Totales',
      value: totalGames,
      icon: Gamepad2,
      color: 'indigo',
      href: '/games',
      action: 'Ver juegos',
    },
    {
      label: 'Equipos',
      value: totalTeams,
      icon: Users2,
      color: 'emerald',
      href: '/teams',
      action: 'Ver equipos',
    },
    {
      label: 'Esta Semana',
      value: gamesThisWeek,
      icon: Target,
      color: 'amber',
      href: '/games',
      action: 'Ver más',
    },
    {
      label: 'Líder',
      value: topTeamByPoints?.name || '-',
      subvalue: topTeamByPoints?.points ? `${topTeamByPoints.points} pts` : undefined,
      icon: Trophy,
      color: 'yellow',
      href: '/ranking',
      action: 'Ver ranking',
    },
  ]

  const colorClasses: Record<string, { gradient: string; border: string; icon: string }> = {
    indigo: {
      gradient: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-500/30',
      icon: 'text-indigo-600',
    },
    emerald: {
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-600',
    },
    amber: {
      gradient: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/30',
      icon: 'text-amber-600',
    },
    yellow: {
      gradient: 'from-yellow-500/10 to-yellow-600/5',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-600',
    },
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        const isText = typeof stat.value === 'string'
        const colors = colorClasses[stat.color]
        return (
          <Card 
            key={idx} 
            className={`bg-gradient-to-br ${colors.gradient} border ${colors.border} shadow-none p-3 sm:p-4 cursor-pointer hover:shadow-md transition-all group`}
            onClick={() => router.push(stat.href)}
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.icon}`} />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium line-clamp-1">{stat.label}</p>
            <p className={`text-base sm:text-lg font-bold mt-0.5 sm:mt-1 ${isText ? 'text-xs sm:text-sm' : ''}`}>
              {isText ? stat.value : stat.value}
            </p>
            {stat.subvalue && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.subvalue}</p>}
          </Card>
        )
      })}
    </div>
  )
}
