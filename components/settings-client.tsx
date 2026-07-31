'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { getUserEvents, setDefaultEvent, createEvent, updateEvent, deleteEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Star, Plus, LogOut, Edit2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface EventOption {
  id: number
  name: string
}

export function SettingsClient() {
  const router = useRouter()
  const { user, signOut } = useUser()
  const { eventId, setEventSession } = useEventSession()
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [settingDefault, setSettingDefault] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    country: 'México',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  useEffect(() => {
    if (!user?.id) return

    async function loadEvents() {
      try {
        const userEvents = await getUserEvents(user.id)
        setEvents(userEvents || [])
      } catch (error) {
        console.error('Error loading events:', error)
        toast.error('Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user?.id])

  const handleSetDefault = async (newEventId: number) => {
    if (!user?.id) return
    setSettingDefault(newEventId)
    try {
      await setDefaultEvent(user.id, newEventId)
      setEventSession(newEventId)  // Actualiza el contexto para reflejar el cambio en el front
      toast.success('Evento establecido como predeterminado')
    } catch (error) {
      toast.error('Error al establecer evento predeterminado')
      console.error(error)
    } finally {
      setSettingDefault(null)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !formData.name.trim()) {
      toast.error('Ingresa un nombre para el evento')
      return
    }

    setIsCreating(true)
    try {
      const newEvent = await createEvent(
        user.id,
        formData.name,
        formData.country,
        formData.startDate,
        formData.endDate
      )

      if (!newEvent || !newEvent.id) {
        throw new Error('Evento creado pero sin ID')
      }

      setEvents([...events, { id: newEvent.id, name: newEvent.name }])
      setEventSession(newEvent.id)
      setShowCreateForm(false)
      setFormData({
        name: '',
        country: 'México',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      toast.success('Evento creado exitosamente')
      // Redirect to dashboard after creating event
      router.push('/')
    } catch (error) {
      toast.error('Error al crear evento')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent, eventToUpdate: EventOption) => {
    e.preventDefault()
    if (!user?.id || !formData.name.trim()) {
      toast.error('Ingresa un nombre para el evento')
      return
    }

    setIsUpdating(true)
    try {
      await updateEvent(user.id, eventToUpdate.id, {
        name: formData.name,
        country: formData.country,
        startDate: formData.startDate,
        endDate: formData.endDate,
      })

      setEvents(events.map(e => 
        e.id === eventToUpdate.id ? { ...e, name: formData.name } : e
      ))
      setEditingEventId(null)
      setFormData({
        name: '',
        country: 'México',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      toast.success('Evento actualizado exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar evento')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteEvent = async (eventIdToDelete: number) => {
    if (!user?.id) return

    setIsDeleting(true)
    try {
      await deleteEvent(user.id, eventIdToDelete)
      const updatedEvents = events.filter(e => e.id !== eventIdToDelete)
      setEvents(updatedEvents)
      
      // If no events remain after deletion, redirect to select-event
      if (updatedEvents.length === 0) {
        setEventSession(null)
        setDeleteConfirmId(null)
        toast.success('Evento eliminado exitosamente')
        router.push('/select-event')
        return
      }
      
      // Si se eliminó el evento actual, cambiar a otro
      if (eventId === eventIdToDelete) {
        const remainingEvent = updatedEvents[0]
        if (remainingEvent) {
          setEventSession(remainingEvent.id)
          await setDefaultEvent(user.id, remainingEvent.id)
        }
      }
      
      setDeleteConfirmId(null)
      toast.success('Evento eliminado exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar evento')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut()
  }

  if (!user) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil, eventos y preferencias</p>
      </div>

      {/* User Profile Card */}
      <Card className="mb-8 p-6 border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Tu Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg text-foreground mt-1">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <p className="text-lg text-foreground mt-1">{user.name || 'Sin nombre registrado'}</p>
          </div>
        </div>
      </Card>

      {/* Events Management Card */}
      <Card className="mb-8 p-6 border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Mis Eventos</h2>
            <p className="text-sm text-muted-foreground mt-1">Gestiona y personaliza tus eventos</p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Evento</DialogTitle>
                <DialogDescription>Completa los detalles de tu nuevo evento</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nombre del Evento</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ej: Campamento 2024"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">País</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Fecha Inicio</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Fecha Fin</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? 'Creando...' : 'Crear Evento'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No tienes eventos aún</p>
            <Button onClick={() => setShowCreateForm(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Crear tu primer evento
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {event.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={eventId === event.id ? 'default' : 'outline'}
                    disabled={eventId === event.id || settingDefault !== null}
                    className="gap-2"
                    onClick={() => {
                      setEventSession(event.id)
                      handleSetDefault(event.id)
                      toast.success(`Usando evento: ${event.name}`)
                      router.push('/')
                    }}
                  >
                    {eventId === event.id ? 'Activo' : 'Usar'}
                  </Button>
                  <button
                    onClick={() => handleSetDefault(event.id)}
                    disabled={settingDefault !== null}
                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    title="Establecer como predeterminado"
                  >
                    <Star className={`w-5 h-5 ${settingDefault === event.id ? 'animate-spin' : ''}`} />
                  </button>
                  <Dialog open={editingEventId === event.id} onOpenChange={(open) => {
                    if (open) {
                      setEditingEventId(event.id)
                      setFormData({
                        name: event.name,
                        country: 'México',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      })
                    } else {
                      setEditingEventId(null)
                    }
                  }}>
                    <button
                      className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                      title="Editar evento"
                      onClick={() => {
                        setEditingEventId(event.id)
                        setFormData({
                          name: event.name,
                          country: 'México',
                          startDate: new Date().toISOString().split('T')[0],
                          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        })
                      }}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar Evento</DialogTitle>
                        <DialogDescription>Actualiza los detalles del evento</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => handleUpdateEvent(e, event)} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground">Nombre del Evento</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">País</label>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">Fecha Inicio</label>
                            <input
                              type="date"
                              required
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">Fecha Fin</label>
                            <input
                              type="date"
                              required
                              value={formData.endDate}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={isUpdating} className="w-full">
                          {isUpdating ? 'Actualizando...' : 'Actualizar Evento'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog open={deleteConfirmId === event.id} onOpenChange={(open) => {
                    if (!open) {
                      setDeleteConfirmId(null)
                    }
                  }}>
                    <button
                      className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Eliminar evento"
                      onClick={() => setDeleteConfirmId(event.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminarán permanentemente el evento "{event.name}" y todos sus datos asociados (camperos, staff, transacciones, etc.). Esta acción NO se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Logout Card */}
      <Card className="p-6 border-red-500/30 bg-red-500/5">
        <h2 className="text-xl font-semibold text-foreground mb-4">Cerrar Sesión</h2>
        <p className="text-muted-foreground mb-4">Cierra tu sesión actual y vuelve a la pantalla de login</p>
        <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <Button
            onClick={() => setLogoutOpen(true)}
            variant="destructive"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar cierre de sesión</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={isLoggingOut}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  )
}
