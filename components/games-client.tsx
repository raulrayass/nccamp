'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Gamepad2, Trophy, Minus, Maximize2 } from 'lucide-react'
import { toast } from 'sonner'
import { createGame, updateGame, deleteGame, addGameScore, deleteGameScore, getGameScores } from '@/app/actions/games'
import { Game, GameScore, Team } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { TeamFlag } from '@/components/team-flag'
import { ScoreboardFullscreen } from '@/components/scoreboard-fullscreen'
import { PodiumFullscreen } from '@/components/podium-fullscreen'
import { useGames, useTeams, useGameScores } from '@/lib/hooks'
import { MobileSheet } from '@/components/mobile'
import { ListSkeleton } from '@/components/list-skeleton'

interface Props {
  userId: string
  eventId: number | null
}

export function GamesClient({ userId, eventId }: Props) {
  // Hooks centralizados para sincronización cross-module
  const { games: gameList, isLoading: gamesLoading, error: gamesError, refetch: refetchGames } = useGames(eventId)
  const { teams, isLoading: teamsLoading, error: teamsError } = useTeams(eventId)
  const { scores: allGameScores, isLoading: scoresLoading, refetch: refetchScores } = useGameScores(eventId)

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
      const gameScoresData = await getGameScores(userId, gameId, eventId)
      setGameScores(gameScoresData)
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
          await updateGame(userId, editingId, { ...form, eventId })
          toast.success('Juego actualizado')
        } else {
          await createGame(userId, { ...form, eventId })
          toast.success('Juego creado')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        clearNewParam()
        await refetchGames()
      } catch (error) {
        toast.error('Error al guardar el juego')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteGame(userId, id, eventId)
        toast.success('Juego eliminado')
        setDeleteDialogOpen(false)
        await refetchGames()
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
        await addGameScore(userId, selectedGameId, parseInt(scoringForm.teamId, 10), parseInt(scoringForm.points, 10), eventId)
        toast.success('Puntos registrados')
        setScoringForm({ teamId: '', points: '' })
        await loadScoresForGame(selectedGameId)
        await refetchScores()
      } catch (error) {
        toast.error('Error al registrar puntos')
        console.error(error)
      }
    })
  }

  async function handleDeleteScore(scoreId: number, gameId: number) {
    startTransition(async () => {
      try {
        await deleteGameScore(userId, scoreId, eventId)
        toast.success('Puntos eliminados')
        await loadScoresForGame(gameId)
        await refetchScores()
      } catch (error) {
        toast.error('Error al eliminar los puntos')
        console.error(error)
      }
    })
  }

  const openScoring = async (gameId: number) => {
    setSelectedGameId(gameId)
    await loadScoresForGame(gameId)
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
      <div className="games-shell mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-4 sm:py-4 lg:px-6">
        <ListSkeleton count={5} variant="card" />
      </div>
    )
  }

  return (
    <div className="games-shell mx-auto flex w-full max-w-7xl flex-col gap-3 px-2.5 py-2.5 sm:gap-5 sm:px-4 sm:py-4 lg:px-6">
      <div className="games-mobile-chrome flex flex-col gap-3 sm:gap-5">
        <PageHeader title="Juegos y Puntaje">
          <div className="flex flex-wrap gap-2">
            {teams.length > 0 && (
              <Button onClick={() => setPodiumMode(true)} variant="outline" size="sm" className="h-9 gap-1.5 px-2 text-xs sm:h-10 sm:px-3 sm:text-sm">
                <Trophy className="h-4 w-4 shrink-0" />
                <span>Proyectar ganador</span>
              </Button>
            )}
            <Button onClick={() => setDialogOpen(true)} size="sm" className="hidden gap-1.5 bg-green-600 px-2 text-xs text-white hover:bg-green-700 sm:flex sm:h-10 sm:px-3 sm:text-sm">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Nuevo juego</span>
            </Button>
          </div>
        </PageHeader>

        {/* Ranking preview */}
      {teams.length > 0 && gameList.length > 0 && (
        <Card className="games-ranking-panel overflow-hidden">
          <CardContent className="p-3 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Trophy className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-foreground sm:text-base">Tabla de puntos</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Cada registro suma al total del equipo</p>
                </div>
              </div>
              <Button onClick={() => setFullscreenMode(true)} variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-xs">
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Proyectar</span>
              </Button>
            </div>
            <div className="games-ranking-board space-y-1.5">
              {leaderboard.map(({ team, totalPoints, pointsPerGame }, index) => (
                <div key={team.id} className="games-ranking-row flex items-center gap-2.5 rounded-2xl px-2.5 py-2">
                  <span className={cn('games-rank-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', index === 0 && 'games-rank-gold', index === 1 && 'games-rank-silver', index === 2 && 'games-rank-bronze')}>{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-foreground sm:text-sm">{team.name}</span>
                      <span className="shrink-0 text-sm font-black text-primary">{totalPoints} puntos</span>
                    </div>
                    <div className="mt-1 flex gap-1 overflow-x-auto pb-0.5">
                      {gameList.map((game) => <span key={game.id} title={`${game.name}: ${pointsPerGame[game.id] || 0} puntos`} className="games-score-chip shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{game.name}: {pointsPerGame[game.id] || 0}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>

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
            <Button onClick={() => setDialogOpen(true)} className="mt-2 hidden gap-2 sm:flex">
              <Plus className="w-4 h-4" />
              Crear primer juego
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {gameList.map((game, index) => (
            <Card key={game.id} className="games-card group overflow-hidden" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-2.5 sm:p-3 md:p-5">
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <span className="text-[11px] font-medium text-muted-foreground">Resultado del juego</span>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => { setEditingId(game.id); setForm({ name: game.name, description: game.description || '', gameDate: game.gameDate || '' }); setDialogOpen(true) }} variant="ghost" size="sm" className="h-7 px-2 text-xs">Editar</Button>
                    <Button onClick={() => { setDeletingId(game.id); setDeleteDialogOpen(true) }} variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive">Eliminar</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="games-card-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-primary sm:h-9 sm:w-9 md:h-12 md:w-12">
                        <Gamepad2 className="h-5 w-5 md:h-6 md:w-6" />
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
                        {(() => {
                          const gameLeaders = teams
                            .map((team) => ({ team, points: allGameScores.filter((score) => score.gameId === game.id && score.teamId === team.id).reduce((sum, score) => sum + score.points, 0) }))
                            .filter(({ points }) => points > 0)
                            .sort((a, b) => b.points - a.points)
                          const leader = gameLeaders[0]
                          return leader ? <p className="mt-1 truncate text-[11px] font-semibold text-primary">Más puntos: {leader.team.name} · {leader.points} pts</p> : <p className="mt-1 text-[11px] text-muted-foreground">Sin puntos registrados</p>
                        })()}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => openScoring(game.id)} size="sm" className="games-score-action shrink-0 gap-1.5 rounded-full px-3 text-xs">
                    <Trophy data-icon="inline-start" />
                    <span>Registrar puntos</span>
                  </Button>
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
                  <div key={team.id} className="games-score-row flex items-center justify-between rounded-2xl p-3">
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
                  className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm shadow-sm"
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
