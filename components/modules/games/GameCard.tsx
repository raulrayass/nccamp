'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Edit2, Trash2, Trophy } from 'lucide-react'
import { Game } from '@/lib/hooks'

interface GameCardProps {
  game: Game
  onEdit: (game: Game) => void
  onDelete: (gameId: string) => void
  onScoring: (gameId: string) => void
}

export function GameCard({ game, onEdit, onDelete, onScoring }: GameCardProps) {
  return (
    <Card className="border-2 overflow-hidden hover:border-primary transition-all">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between gap-2 md:gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="text-lg md:text-2xl shrink-0">🎮</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm md:text-base truncate text-foreground">{game.name}</h3>
                {game.description && <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5">{game.description}</p>}
                {game.gameDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(game.gameDate + 'T00:00:00').toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2 shrink-0">
            <Button
              onClick={() => onScoring(game.id)}
              size="sm"
              className="h-8 md:h-9 px-2 md:px-3 gap-1 text-xs md:text-sm"
              title="Registrar puntos"
            >
              <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Puntos</span>
            </Button>
            <Button
              onClick={() => onEdit(game)}
              size="sm"
              variant="ghost"
              className="h-8 md:h-9 w-8 md:w-9 p-0"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
            </Button>
            <Button
              onClick={() => onDelete(game.id)}
              size="sm"
              variant="ghost"
              className="h-8 md:h-9 w-8 md:w-9 p-0"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
