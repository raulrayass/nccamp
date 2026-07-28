'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { GroupTabs, LOGISTICA_TABS } from '@/components/group-tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Users, ChevronDown, Home } from 'lucide-react'
import { toast } from 'sonner'
import { createRoom, updateRoom, deleteRoom, getRooms, getRoomOccupancy, getRoomOccupants } from '@/app/actions/rooms'
import { Room, Attendee } from '@/lib/db/schema'
import { StatsBar } from '@/components/stats-bar'
import { PageHeader } from '@/components/page-header'

interface Props {
  userId: string
}

export function RoomsClient({ userId }: Props) {
  const [roomList, setRoomList] = useState<Room[]>([])
  const [occupancy, setOccupancy] = useState<Record<number, number>>({})
  const [expandedRoomId, setExpandedRoomId] = useState<number | null>(null)
  const [expandedOccupants, setExpandedOccupants] = useState<Record<number, Attendee[]>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', capacity: '' })
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const emptyForm = { name: '', capacity: '' }

  useEffect(() => {
    loadRooms()
  }, [userId])

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

  async function loadRooms() {
    setLoading(true)
    try {
      const data = await getRooms(userId)
      const occ = await getRoomOccupancy(userId)
      setRoomList(data)
      setOccupancy(occ)
    } catch (error) {
      toast.error('Error al cargar habitaciones')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleRoomOccupants(roomId: number) {
    if (expandedRoomId === roomId) {
      setExpandedRoomId(null)
    } else {
      setExpandedRoomId(roomId)
      if (!expandedOccupants[roomId]) {
        try {
          const occupants = await getRoomOccupants(userId, roomId)
          setExpandedOccupants({ ...expandedOccupants, [roomId]: occupants })
        } catch (error) {
          toast.error('Error al cargar integrantes de la habitación')
          console.error(error)
        }
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre de la habitación es obligatorio')
      return
    }
    const capacity = form.capacity ? parseInt(form.capacity, 10) : null
    startTransition(async () => {
      try {
        if (editingId) {
          await updateRoom(userId, editingId, { name: form.name, capacity })
          toast.success('Habitación actualizada')
        } else {
          await createRoom(userId, { name: form.name, capacity })
          toast.success('Habitación creada')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        clearNewParam()
        await loadRooms()
      } catch (error) {
        toast.error('Error al guardar la habitación')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteRoom(userId, id)
        toast.success('Habitación eliminada')
        setDeleteDialogOpen(false)
        await loadRooms()
      } catch (error) {
        toast.error('Error al eliminar la habitación')
        console.error(error)
      }
    })
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Logística">
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Agregar habitación</span>
        </Button>
      </PageHeader>

      {/* Tabs del grupo Logística */}
      <GroupTabs tabs={LOGISTICA_TABS} />

      {/* Stats Bar */}
      {!loading && roomList.length > 0 && (
        <StatsBar
          items={[
            { label: 'Habitaciones Totales', value: roomList.length, icon: <Home className="w-5 h-5" />, color: 'primary' },
          ]}
        />
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
      ) : roomList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay habitaciones registradas</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Crear primera habitación
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {roomList.map((room) => (
            <div key={room.id}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleRoomOccupants(room.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {occupancy[room.id] || 0}
                          {room.capacity ? ` / ${room.capacity}` : ''} {room.capacity ? 'ocupadas' : 'habitantes'}
                        </p>
                      </div>
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        onClick={() => toggleRoomOccupants(room.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title={expandedRoomId === room.id ? 'Contraer' : 'Expandir'}
                      >
                        <ChevronDown
                          className="w-4 h-4 transition-transform"
                          style={{
                            transform: expandedRoomId === room.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(room.id)
                          setForm({ name: room.name, capacity: room.capacity ? String(room.capacity) : '' })
                          setDialogOpen(true)
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        title="Editar habitación"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        onClick={() => {
                          setDeletingId(room.id)
                          setDeleteDialogOpen(true)
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        title="Eliminar habitación"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expanded Occupants List */}
              {expandedRoomId === room.id && expandedOccupants[room.id] && (
                <div className="mt-1 ml-4 border-l-2 border-muted pl-4 space-y-1">
                  {expandedOccupants[room.id]?.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Sin habitantes</p>
                  ) : (
                    expandedOccupants[room.id]?.map((occupant) => (
                      <div key={occupant.id} className="text-xs py-1">
                        <p className="font-medium text-foreground">{occupant.name}</p>
                        {occupant.phone && <p className="text-muted-foreground">{occupant.phone}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Room Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setForm({ ...emptyForm })
          setEditingId(null)
          clearNewParam()
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar habitación' : 'Agregar habitación'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Litera A"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacidad (personas)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="0"
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
                {editingId ? 'Guardar cambios' : 'Crear habitación'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar habitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la habitación pero los camperos asignados no serán eliminados.
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
