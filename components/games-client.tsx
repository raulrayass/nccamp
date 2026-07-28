'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Gamepad2, Trophy, Minus, Users2, Maximize2 } from 'lucide-react'
import { toast } from 'sonner'
import { createGame, updateGame, deleteGame, getGames, addGameScore, deleteGameScore, getGameScores, getAllGameScores } from '@/app/actions/games'
import { getTeams } from '@/app/actions/teams'
import { Game, GameScore, Team } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { StatsBar } from '@/components/stats-bar'
import { PageHeader } from '@/components/page-header'
import { TeamFlag } from '@/components/team-flag'
import { ScoreboardFullscreen } from '@/components/scoreboard-fullscreen'
import { PodiumFullscreen } from '@/components/podium-fullscreen'
import { useGames, useTeams, useGameScores } from '@/lib/hooks'
import { MobileSheet } from '@/components/mobile'
import { ListSkeleton } from '@/components/list-skeleton'

interface Props {
  userId: string
}

export function GamesClient({ userId }: Props) {
  // Hooks centralizados para sincronización cross-module
  const { games: gameList, isLoading: gamesLoading, error: gamesError } = useGames()
  const { teams, isLoading: teamsLoading, error: teamsError } = useTeams()
  const { scores: allGameScores, isLoading: scoresLoading } = useGameScores()

  // Local UI state
  const [gameScores, setGameScores] = useState<GameScore[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '', gameDate: '' })
  const [scoringForm, setScoringForm] = useState({ teamId: '', points: '' })
  const [isPending, startTransition] = useTransition()
  const [fullscreenMode, setFullscreenMode] = useState(false)
  const [podiumMode, setPodiumMode] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const emptyForm = { name: '', description: '', gameDate: '' }
  const loading = gamesLoading || teamsLoading || scoresLoading

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingId(null)
      setForm({ ...emptyForm })
      setDialogOpen(true)
    }
  }, [searchParams])

  function clearNewParam() {
    if (searchParams.get('new') === '1') {
      router.replace(pathname, { scroll: false })
    }
  }

  // Effect para sincronizar game scores cuando cambian los datos
  useEffect(() => {
    if (selectedGameId && allGameScores.length > 0) {
      const selected = allGameScores.filter(score => score.gameId === selectedGameId)
      setGameScores(selected)
    }
  }, [selectedGameId, allGameScores])

  async function loadScoresForGame(gameId: number) {
    try {
      const [gameScoresData, allScoresData] = await Promise.all([
        getGameScores(userId, gameId),
        getAllGameScores(userId),
      ])
      setGameScores(gameScoresData)
      setAllGameScores(allScoresData)
    } catch (error) {
      toast.error('Error al cargar puntuaciones')
      console.error(error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre del juego es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateGame(userId, editingId, form)
          toast.success('Juego actualizado')
        } else {
          await createGame(userId, form)
          toast.success('Juego creado')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        clearNewParam()
        // Los hooks SWR se actualizan automáticamente via mutate()
      } catch (error) {
        toast.error('Error al guardar el juego')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteGame(userId, id)
        toast.success('Juego eliminado')
        setDeleteDialogOpen(false)
        await loadGames()
      } catch (error) {
        toast.error('Error al eliminar el juego')
        console.error(error)
      }
    })
  }

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault()
    if (!scoringForm.teamId) {
      toast.error('Selecciona un equipo')
      return
    }
    if (!scoringForm.points || isNaN(Number(scoringForm.points))) {
      toast.error('Ingresa un número válido de puntos')
      return
    }
    if (!selectedGameId) return

    startTransition(async () => {
      try {
        await addGameScore(userId, selectedGameId, parseInt(scoringForm.teamId, 10), parseInt(scoringForm.points, 10))
        toast.success('Puntos registrados')
        setScoringForm({ teamId: '', points: '' })
        await loadScoresForGame(selectedGameId)
      } catch (error) {
        toast.error('Error al registrar puntos')
        console.error(error)
      }
    })
  }

  async function handleDeleteScore(scoreId: number, gameId: number) {
    startTransition(async () => {
      try {
        await deleteGameScore(userId, scoreId)
        toast.success('Puntos eliminados')
        await loadScoresForGame(gameId)
      } catch (error) {
        toast.error('Error al eliminar los puntos')
        console.error(error)
      }
    })
  }

  const openScoring = (gameId: number) => {
    setSelectedGameId(gameId)
    loadScoresForGame(gameId)
    setScoringDialogOpen(true)
  }

  const teamMap = new Map(teams.map((t) => [t.id, t]))

  const getTeamTotalPoints = (teamId: number): number => {
    return allGameScores
      .filter((gs) => gs.teamId === teamId)
      .reduce((sum, gs) => sum + gs.points, 0)
  }

  const getTeamPointsPerGame = (teamId: number): Record<number, number> => {
    const pointsPerGame: Record<number, number> = {}
    allGameScores
      .filter((gs) => gs.teamId === teamId)
      .forEach((gs) => {
        pointsPerGame[gs.gameId] = (pointsPerGame[gs.gameId] || 0) + gs.points
      })
    return pointsPerGame
  }

  const leaderboard = teams
    .map((team) => ({
      team,
      totalPoints: getTeamTotalPoints(team.id),
      pointsPerGame: getTeamPointsPerGame(team.id),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  // Show skeleton while loading
  if (gamesLoading || teamsLoading || scoresLoading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
        <ListSkeleton count={5} variant="card" />
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Juegos y Puntaje">
        <div className="flex flex-wrap gap-2">
          {teams.length > 0 && (
            <>
              <Button onClick={() => setPodiumMode(true)} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Proyectar ganador</span>
              </Button>
              <Button onClick={() => setFullscreenMode(true)} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Proyectar ranking</span>
              </Button>
            </>
          )}
          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Nuevo juego</span>
          </Button>
        </div>
      </PageHeader>

      {/* Stats Bar */}
      {!loading && gameList.length > 0 && (
        <StatsBar
          items={[
            { label: 'Juegos Creados', value: gameList.length, icon: <Gamepad2 className="w-5 h-5" />, color: 'primary' },
            { label: 'Equipos Participando', value: teams.length, icon: <Users2 className="w-5 h-5" />, color: 'success' },
          ]}
        />
      )}

      {/* Leaderboard */}
      {teams.length > 0 && (
        <Card className="card-vibrant">
          <CardContent className="p-4 md:p-6">
            <h2 className="font-bold text-base md:text-lg mb-3 md:mb-6 text-foreground">Ranking Actual</h2>
            <div className="space-y-2 md:space-y-3">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.team.id}
                  className="rounded-lg border p-2.5 md:p-4 transition-all hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${entry.team.color} 8%, var(--card)) 0%, var(--card) 100%)`,
                    borderColor: entry.team.color,
                    borderWidth: '2px',
                    boxShadow: `0 8px 24px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px -12px ${entry.team.color}40`,
                  }}
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="text-lg md:text-2xl font-black w-8 md:w-10 text-center shrink-0 leading-none" style={{ color: entry.team.color }}>
                      {idx === 0 && '🥇'}
                      {idx === 1 && '🥈'}
                      {idx === 2 && '🥉'}
                      {idx > 2 && `${idx + 1}.`}
                    </div>
                    <TeamFlag
                      country={entry.team.country}
                      color={entry.team.color}
                      shape="rect"
                      className="w-7 h-5 md:w-10 md:h-7 rounded border border-white/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs md:text-base truncate leading-tight">{entry.team.name}</p>
                      {Object.keys(entry.pointsPerGame).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Object.keys(entry.pointsPerGame).length}J
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg md:text-2xl font-black tabular-nums leading-none" style={{ color: entry.team.color }}>
                        {entry.totalPoints}
                      </div>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                  {Object.keys(entry.pointsPerGame).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex flex-wrap gap-1">
                        {gameList
                          .filter((g) => entry.pointsPerGame[g.id])
                          .slice(0, 3)
                          .map((game) => (
                            <div key={game.id} className="text-xs px-1.5 py-0.5 rounded bg-muted/60">
                              <span className="font-semibold tabular-nums" style={{ color: entry.team.color }}>
                                {entry.pointsPerGame[game.id]}
                              </span>
                            </div>
                          ))}
                        {Object.keys(entry.pointsPerGame).length > 3 && (
                          <div className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                            +{Object.keys(entry.pointsPerGame).length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gameList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Gamepad2 className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay juegos registrados</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Crear primer juego
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {gameList.map((game, index) => (
            <Card key={game.id} className="card-vibrant overflow-hidden border-2 md:border" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-3 md:p-5">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="text-lg md:text-2xl font-black text-primary shrink-0">
                        🎮
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm md:text-lg truncate text-foreground leading-tight">{game.name}</h3>
                        {game.description && (
                          <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5">{game.description}</p>
                        )}
                        {game.gameDate && (
                          <p className="text-xs text-muted-foreground mt-1 font-medium">
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
                      onClick={() => openScoring(game.id)}
                      size="sm"
                      className="h-8 md:h-9 px-2 md:px-3 gap-1 md:gap-1.5 text-xs md:text-sm font-medium bg-primary hover:bg-primary/90"
                      title="Registrar puntos"
                    >
                      <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Puntos</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingId(game.id)
                        setForm({
                          name: game.name,
                          description: game.description || '',
                          gameDate: game.gameDate || '',
                        })
                        setDialogOpen(true)
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 md:h-9 w-8 md:w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-950"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                    </Button>
                    <Button
                      onClick={() => {
                        setDeletingId(game.id)
                        setDeleteDialogOpen(true)
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 md:h-9 w-8 md:w-9 p-0 hover:bg-red-100 dark:hover:bg-red-950"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Game Modal - MobileSheet (adaptive: Dialog on desktop, Drawer on mobile) */}
      <MobileSheet 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setForm({ ...emptyForm })
            setEditingId(null)
            clearNewParam()
          }
        }}
        title={editingId ? 'Editar juego' : 'Crear juego'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Rally, Volley"
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ej: reto"
            />
          </div>
          <div>
            <Label htmlFor="gameDate">Fecha</Label>
            <Input
              id="gameDate"
              type="date"
              value={form.gameDate}
              onChange={(e) => setForm({ ...form, gameDate: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setDialogOpen(false); clearNewParam() }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingId ? 'Guardar cambios' : 'Crear juego'}
            </Button>
          </div>
        </form>
      </MobileSheet>

      {/* Scoring Modal - MobileSheet (adaptive: Dialog on desktop, Drawer on mobile) */}
      <MobileSheet 
        open={scoringDialogOpen} 
        onOpenChange={setScoringDialogOpen}
        title="Registrar puntos"
        description={selectedGameId && gameList.find((g) => g.id === selectedGameId)?.name}
        size="md"
      >
        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Crea equipos primero para registrar puntos
          </p>
        ) : (
          <div className="space-y-4">
            {/* Current Scores */}
            <div>
              <Label className="font-semibold">Puntuación actual</Label>
              <div className="space-y-2 mt-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <TeamFlag country={team.country} color={team.color} shape="rect" className="w-6 h-4" />
                      <span className="text-sm font-medium">{team.name}</span>
                    </div>
                    <span className="font-bold">{getTeamTotalPoints(team.id)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Score Form */}
            <form onSubmit={handleAddScore} className="space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="teamId">Equipo</Label>
                <select
                  id="teamId"
                  value={scoringForm.teamId}
                  onChange={(e) => setScoringForm({ ...scoringForm, teamId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background h-10"
                >
                  <option value="">Selecciona un equipo</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="points">Puntos</Label>
                <Input
                  id="points"
                  type="number"
                  value={scoringForm.points}
                  onChange={(e) => setScoringForm({ ...scoringForm, points: e.target.value })}
                  placeholder="10"
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                Registrar puntos
              </Button>
            </form>

            {/* Score History */}
            {gameScores.length > 0 && (
              <div className="border-t pt-4">
                <Label className="font-semibold">Registro</Label>
                <div className="space-y-1 mt-2 max-h-40 overflow-y-auto">
                  {gameScores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-2 min-w-0">
                        {teamMap.get(score.teamId) && (
                          <>
                            <TeamFlag
                              country={teamMap.get(score.teamId)!.country}
                              color={teamMap.get(score.teamId)!.color}
                              shape="rect"
                              className="w-5 h-3.5"
                            />
                            <span className="truncate">{teamMap.get(score.teamId)!.name}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold">+{score.points}</span>
                        <Button
                          onClick={() => handleDeleteScore(score.id, score.gameId)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-red-100"
                        >
                          <Minus className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </MobileSheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar juego?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán el juego y todos los puntos registrados para este juego.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isPending}
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fullscreen Scoreboard - Standard */}
      {fullscreenMode && (
        <ScoreboardFullscreen
          leaderboard={leaderboard}
          onClose={() => setFullscreenMode(false)}
          gameList={gameList}
        />
      )}

      {/* Fullscreen Podium */}
      {podiumMode && (
        <PodiumFullscreen
          leaderboard={leaderboard}
          onClose={() => setPodiumMode(false)}
          gameList={gameList}
        />
      )}
    </div>
  )
}
