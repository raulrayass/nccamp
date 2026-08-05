'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { GroupTabs, PERSONAS_TABS } from '@/components/group-tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, ChevronDown, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createTeam, updateTeam, deleteTeam, getTeams, getTeamMembers, getTeamMemberCounts } from '@/app/actions/teams'
import { Team, Attendee } from '@/lib/db/schema'
import { PageHeader } from '@/components/page-header'
import { COUNTRIES } from '@/lib/countries'
import { CountryFlagSvg } from '@/lib/country-flags-svg'
import { TeamFlag } from '@/components/team-flag'
import { useTeams, useGameScores } from '@/lib/hooks'
import { MobileSheet } from '@/components/mobile'
import { ListSkeleton } from '@/components/list-skeleton'
import { ListItemCard } from '@/components/list-item-card'

interface Props {
  userId: string
  eventId: number | null
}

export function TeamsClient({ userId, eventId }: Props) {
  // Hooks centralizados para sincronización
  const { teams: teamList, isLoading: teamsLoading, refetch: refetchTeams } = useTeams(eventId)
  const { scores: allGameScores } = useGameScores()

  // Local UI state
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({})
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null)
  const [expandedMembers, setExpandedMembers] = useState<Record<number, Attendee[]>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', color: '#4a9d67', country: null as string | null, useCountry: false })
  const [isPending, startTransition] = useTransition()

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const emptyForm = { name: '', color: '#4a9d67', country: null as string | null, useCountry: false }
  const loading = teamsLoading
  const teamPoints = allGameScores.reduce<Record<number, number>>((totals, score) => {
    totals[score.teamId] = (totals[score.teamId] || 0) + score.points
    return totals
  }, {})
  const rankedTeams = [...teamList].sort((a, b) => (teamPoints[b.id] || 0) - (teamPoints[a.id] || 0))
  const teamRank = new Map(rankedTeams.map((team, index) => [team.id, index + 1]))

  const PRESET_COLORS = [
    { name: 'Verde', value: '#4a9d67' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Rojo', value: '#dc2626' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Púrpura', value: '#9333ea' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Naranja', value: '#ea580c' },
    { name: 'Cian', value: '#06b6d4' },
  ]

  // Cargar conteos de miembros al montar
  useEffect(() => {
    async function loadMemberCounts() {
      try {
        const counts = await getTeamMemberCounts(userId, eventId)
        setMemberCounts(counts)
      } catch (error) {
        console.error('Error loading member counts:', error)
      }
    }
    loadMemberCounts()
  }, [userId, eventId, teamList.length]) // Refetch si cambia cantidad de equipos

  // Abre el modal de agregar cuando el FAB del dock navega con ?new=1
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

  async function toggleTeamMembers(teamId: number) {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null)
    } else {
      setExpandedTeamId(teamId)
      if (!expandedMembers[teamId]) {
        try {
          const members = await getTeamMembers(userId, teamId, eventId)
          setExpandedMembers({ ...expandedMembers, [teamId]: members })
        } catch (error) {
          toast.error('Error al cargar integrantes del equipo')
          console.error(error)
        }
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre del equipo es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateTeam(userId, editingId, { ...form, eventId })
          toast.success('Equipo actualizado')
        } else {
          await createTeam(userId, { ...form, eventId })
          toast.success('Equipo creado')
        }
        await refetchTeams()
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        clearNewParam()
      } catch (error) {
        toast.error('Error al guardar el equipo')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteTeam(userId, id)
        toast.success('Equipo eliminado')
        await refetchTeams()
        setDeleteDialogOpen(false)
      } catch (error) {
        toast.error('Error al eliminar el equipo')
        console.error(error)
      }
    })
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Personas">
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Agregar equipo</span>
        </Button>
      </PageHeader>

      {/* Tabs del grupo Personas */}
      <GroupTabs tabs={PERSONAS_TABS} />

      {/* Quick Stats - same compact visual language as Camperos */}
      {!loading && teamList.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-none dark:from-emerald-500/15 dark:to-emerald-600/5">
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center justify-center gap-2 text-center">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">{teamList.length}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Equipos Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/40 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-none dark:from-blue-500/15 dark:to-blue-600/5">
            <CardContent className="p-2.5 sm:p-3">
              <div className="flex items-center justify-center gap-2 text-center">
                <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">{allGameScores.reduce((total, score) => total + score.points, 0)}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Puntos acumulados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <ListSkeleton count={4} variant="row" />
      ) : teamList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <p className="text-sm text-muted-foreground">No hay equipos registrados</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Crear primer equipo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {teamList.map((team) => (
            <div key={team.id}>
              <ListItemCard
                className="overflow-hidden border-2 border-border/70 bg-gradient-to-r from-card via-card to-muted/30 shadow-sm transition-shadow hover:shadow-md dark:to-muted/10"
                style={{ borderLeftColor: team.color || '#4a9d67' }}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleTeamMembers(team.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-90 transition-all active:scale-95"
                    >
                      <TeamFlag
                        country={team.country}
                        color={team.color || '#4a9d67'}
                        shape="rect"
                        className="w-10 h-8"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate text-foreground">{team.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {memberCounts[team.id] || 0} integrante{(memberCounts[team.id] || 0) !== 1 ? 's' : ''}
                          </span>
                          <span className="font-semibold text-foreground/80">
                            #{teamRank.get(team.id) || '-'} · {teamPoints[team.id] || 0} pts
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        onClick={() => toggleTeamMembers(team.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title={expandedTeamId === team.id ? 'Contraer' : 'Expandir'}
                      >
                        <ChevronDown
                          className="w-4 h-4 transition-transform"
                          style={{
                            transform: expandedTeamId === team.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(team.id)
                          setForm({
                            name: team.name,
                            color: team.color,
                            country: team.country || null,
                            useCountry: !!team.country
                          })
                          setDialogOpen(true)
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        title="Editar equipo"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        onClick={() => {
                          setDeletingId(team.id)
                          setDeleteDialogOpen(true)
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </ListItemCard>

              {/* Expanded Members List */}
              {expandedTeamId === team.id && expandedMembers[team.id] && (
                <div className="mt-1 ml-4 border-l-2 border-muted pl-4 space-y-1">
                  {expandedMembers[team.id]?.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Sin integrantes</p>
                  ) : (
                    expandedMembers[team.id]?.map((member) => (
                      <div key={member.id} className="text-xs py-1">
                        <p className="font-medium text-foreground">{member.name}</p>
                        {member.phone && <p className="text-muted-foreground">{member.phone}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Team Modal - MobileSheet (adaptive: Dialog on desktop, Drawer on mobile) */}
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
        title={editingId ? 'Editar equipo' : 'Agregar equipo'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Nombre del equipo"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.useCountry}
                onChange={(e) => setForm({ ...form, useCountry: e.target.checked, country: e.target.checked ? form.country || 'MX' : null })}
                className="w-4 h-4 rounded"
              />
              Usar bandera de país en lugar de color
            </Label>
          </div>

          {form.useCountry ? (
            <div>
              <Label>País *</Label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-muted/20">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setForm({ ...form, country: country.code })}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      form.country === country.code
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-muted hover:border-emerald-300'
                    }`}
                  >
                    <div className="w-8 h-6">
                      <CountryFlagSvg code={country.code} className="w-full h-full" />
                    </div>
                    <span className="truncate text-xs font-medium">{country.code}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label>Color *</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: preset.value })}
                    className="relative flex items-center justify-center h-10 rounded-lg border-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: preset.value,
                      borderColor: form.color === preset.value ? '#000' : 'transparent',
                    }}
                    title={preset.name}
                  >
                    {form.color === preset.value && (
                      <span className="text-white font-bold text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="Código hex"
                  className="text-xs"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setDialogOpen(false); clearNewParam() }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingId ? 'Guardar cambios' : 'Crear equipo'}
            </Button>
          </div>
        </form>
      </MobileSheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el equipo pero los camperos asignados a este equipo no ser��n eliminados.
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
    </div>
  )
}
