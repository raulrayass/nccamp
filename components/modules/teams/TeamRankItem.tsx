'use client'

import { Team } from '@/lib/hooks'

interface TeamRankItemProps {
  team: Team
  position: number
  pointsPerGame?: Record<string, number>
  gameCount?: number
}

export function TeamRankItem({ team, position, pointsPerGame = {}, gameCount = 0 }: TeamRankItemProps) {
  const pointsArray = Object.values(pointsPerGame).sort((a, b) => b - a)

  return (
    <div
      className="rounded-lg border-2 p-2.5 md:p-4 transition-all hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${team.color || '#6366f1'} 8%, var(--card)) 0%, var(--card) 100%)`,
        borderColor: team.color || '#6366f1',
        boxShadow: `0 8px 24px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px -12px ${team.color || '#6366f1'}40`,
      }}
    >
      <div className="flex items-center gap-2 md:gap-4">
        <div className="text-lg md:text-2xl font-black w-8 md:w-10 text-center shrink-0 leading-none" style={{ color: team.color || '#6366f1' }}>
          {position === 1 && '🥇'}
          {position === 2 && '🥈'}
          {position === 3 && '🥉'}
          {position > 3 && `${position}.`}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs md:text-base truncate leading-tight">{team.name}</p>
          {gameCount > 0 && <p className="text-xs text-muted-foreground mt-0.5">{gameCount}J</p>}
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg md:text-2xl font-black tabular-nums leading-none" style={{ color: team.color || '#6366f1' }}>
            {team.totalPoints || 0}
          </div>
          <p className="text-xs text-muted-foreground">pts</p>
        </div>
      </div>

      {pointsArray.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="flex flex-wrap gap-1">
            {pointsArray.slice(0, 3).map((points, idx) => (
              <div key={idx} className="text-xs px-1.5 py-0.5 rounded bg-muted/60">
                <span className="font-semibold tabular-nums" style={{ color: team.color || '#6366f1' }}>
                  {points}
                </span>
              </div>
            ))}
            {pointsArray.length > 3 && (
              <div className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">+{pointsArray.length - 3}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
