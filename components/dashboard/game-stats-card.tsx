'use client'

import { motion } from 'framer-motion'
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
          <div key={i} className="border-b border-border/70 py-4">
            <div className="mb-2 h-3 w-2/3 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-1/2 animate-pulse rounded-full bg-muted" />
          </div>
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
          <motion.button
            key={idx}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: idx * 0.05 }}
            whileTap={{ scale: 0.97 }}
            className={`group flex w-full items-start gap-3 border-b border-border/70 py-4 text-left transition-colors hover:bg-secondary/50 sm:py-5 ${idx === stats.length - 1 ? 'border-b-0' : ''}`}
            onClick={() => router.push(stat.href)}
          >
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted ${colors.icon}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-muted-foreground/60">{stat.label}</span>
              <span className={`mt-1 block font-bold tracking-tight text-foreground ${isText ? 'text-sm sm:text-base' : 'text-xl sm:text-2xl'}`}>
                {stat.value}
              </span>
              {stat.subvalue && <span className="mt-1 block text-xs font-medium text-muted-foreground/60">{stat.subvalue}</span>}
            </span>
            <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
          </motion.button>
        )
      })}
    </motion.div>
  )
}
