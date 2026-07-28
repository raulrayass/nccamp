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
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      href: '/games',
      action: 'Ver juegos',
    },
    {
      label: 'Equipos',
      value: totalTeams,
      icon: Users2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      href: '/teams',
      action: 'Ver equipos',
    },
    {
      label: 'Esta Semana',
      value: gamesThisWeek,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      href: '/games',
      action: 'Ver más',
    },
    {
      label: 'Líder',
      value: topTeamByPoints?.name || '-',
      subvalue: topTeamByPoints?.points ? `${topTeamByPoints.points} pts` : undefined,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      href: '/ranking',
      action: 'Ver ranking',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        const isText = typeof stat.value === 'string'
        return (
          <Card 
            key={idx} 
            className="p-4 sm:p-5 cursor-pointer hover:shadow-lg hover:scale-105 transition-all group"
            onClick={() => router.push(stat.href)}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
            <p className={`text-lg sm:text-2xl font-bold mt-1 ${isText ? 'text-sm' : ''}`}>
              {isText ? stat.value : stat.value}
            </p>
            {stat.subvalue && <p className="text-xs text-muted-foreground mt-1">{stat.subvalue}</p>}
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{stat.action}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
