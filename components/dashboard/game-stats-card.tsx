'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useDashboardStats } from '@/lib/hooks'
import { Gamepad2, Users2, Trophy, Target, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GameStatsCard() {
  const router = useRouter()
  const { totalGames, totalTeams, topTeamByPoints, gamesThisWeek, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl p-4 shadow-sm sm:p-5">
            <div className="mb-2 h-3 w-2/3 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-1/2 animate-pulse rounded-full bg-muted" />
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
    <motion.div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        const isText = typeof stat.value === 'string'
        const colors = colorClasses[stat.color]
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: idx * 0.05 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            onClick={() => router.push(stat.href)}
          >
            <Card className={`group rounded-2xl border p-4 shadow-sm transition-colors sm:p-5 ${colors.border} bg-card hover:bg-secondary`}>
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-muted ${colors.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-muted-foreground/60 line-clamp-1">{stat.label}</p>
              <p className={`mt-1 font-bold tracking-tight text-foreground ${isText ? 'text-sm sm:text-base' : 'text-xl sm:text-2xl'}`}>
                {stat.value}
              </p>
              {stat.subvalue && <p className="mt-1 text-xs font-medium text-muted-foreground/60">{stat.subvalue}</p>}
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
