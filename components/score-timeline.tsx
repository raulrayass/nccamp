'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface GameScore {
  gameId: string
  gameName: string
  teamId: string
  teamName: string
  score: number
  position: number
  date: string
  totalPoints: number
}

interface ScoreTimelineProps {
  scores: GameScore[]
  selectedTeamId?: string
  onTeamSelect?: (teamId: string) => void
}

export function ScoreTimeline({ scores, selectedTeamId, onTeamSelect }: ScoreTimelineProps) {
  // Agrupar por equipo y ordenar cronológicamente
  const timelineData = useMemo(() => {
    const grouped: Record<string, GameScore[]> = {}
    
    scores.forEach((score) => {
      if (!grouped[score.teamId]) {
        grouped[score.teamId] = []
      }
      grouped[score.teamId].push(score)
    })

    // Si hay un equipo seleccionado, mostrar solo ese
    if (selectedTeamId && grouped[selectedTeamId]) {
      return grouped[selectedTeamId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    // Si no, mostrar todos los scores ordenados por fecha descendente (más reciente primero)
    const allScores = Object.values(grouped).flat()
    return allScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [scores, selectedTeamId])

  if (timelineData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay movimientos de puntaje aun.</p>
      </div>
    )
  }

  // Calcular cambios de posición
  const getPositionChange = (index: number) => {
    if (index === 0) return null
    const current = timelineData[index].position
    const previous = timelineData[index - 1].position
    return previous - current // positivo = subió, negativo = bajó
  }

  return (
    <div className="timeline-container">
      {timelineData.map((score, index) => {
        const positionChange = getPositionChange(index)
        const isImprovement = positionChange && positionChange > 0
        const isDecline = positionChange && positionChange < 0

        return (
          <div key={`${score.gameId}-${score.teamId}`} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{score.gameName}</h3>
                    <p className="text-sm text-muted-foreground">{score.teamName}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="text-3xl font-black text-primary tabular-nums">
                      {score.score}
                    </div>
                    <p className="text-xs text-muted-foreground">puntos</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-border">
                  {/* Posición */}
                  <Badge className="badge-glow">
                    Lugar #{score.position}
                  </Badge>

                  {/* Cambio de posición */}
                  {isImprovement && (
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Subió {positionChange}
                    </Badge>
                  )}
                  {isDecline && (
                    <Badge variant="outline" className="border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Bajó {Math.abs(positionChange)}
                    </Badge>
                  )}

                  {/* Total de puntos */}
                  <Badge variant="secondary" className="ml-auto">
                    Total: {score.totalPoints}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground text-right">
                  {new Date(score.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
