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
      // Wait for state update before redirecting
      setTimeout(() => {
        router.push('/')
      }, 500)
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
      setDeleteConfirmId(null)
      
      // If no events remain after deletion, redirect to select-event
      if (updatedEvents.length === 0) {
        toast.success('Evento eliminado exitosamente')
        setEventSession(null)
        // Wait for state update before redirecting
        setTimeout(() => {
          router.push('/select-event')
        }, 500)
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
    <div className="w-full min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configuración</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* User Profile Section */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full"></div>
              Tu Perfil
            </h2>
            <Card className="p-5 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                  <p className="text-foreground mt-2 break-all">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</label>
                  <p className="text-foreground mt-2">{user.name || 'Sin nombre registrado'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Events Management Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                Mis Eventos
              </h2>
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button className="gap-2 h-9 text-sm">
                    <Plus className="w-4 h-4" />
                    Crear
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Crear Evento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="Ej: Campamento 2024"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">País</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Inicio</label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Fin</label>
                        <input
                          type="date"
                          required
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isCreating} className="w-full mt-5">
                      {isCreating ? 'Creando...' : 'Crear Evento'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-5 sm:p-6 shadow-sm">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Cargando eventos...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4 text-sm">No tienes eventos aún</p>
                  <Button onClick={() => setShowCreateForm(true)} variant="outline" className="gap-2 h-9 text-sm">
                    <Plus className="w-4 h-4" />
                    Crear tu primer evento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{event.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">ID: {event.id}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={eventId === event.id ? 'default' : 'outline'}
                          disabled={eventId === event.id || settingDefault !== null}
                          className="gap-1 h-8 text-xs"
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
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                          title="Establecer como predeterminado"
                        >
                          <Star className={`w-4 h-4 ${settingDefault === event.id ? 'animate-spin text-yellow-500' : ''}`} />
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
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-600 transition-all disabled:opacity-50"
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
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <DialogContent className="max-w-md rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl">Editar Evento</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => handleUpdateEvent(e, event)} className="space-y-4">
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Nombre</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">País</label>
                                <input
                                  type="text"
                                  value={formData.country}
                                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                  className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-muted-foreground uppercase">Inicio</label>
                                  <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-muted-foreground uppercase">Fin</label>
                                  <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full mt-2 px-3 py-2 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                              </div>
                              <Button type="submit" disabled={isUpdating} className="w-full mt-5">
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
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-all disabled:opacity-50"
                            title="Eliminar evento"
                            onClick={() => setDeleteConfirmId(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminarán permanentemente el evento "{event.name}" y todos sus datos asociados. Esta acción NO se puede deshacer.
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
          </div>

          {/* Logout Section */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              Cerrar Sesión
            </h2>
            <Card className="p-5 sm:p-6 shadow-sm border-red-500/20 bg-red-500/5">
              <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <Button
                  onClick={() => setLogoutOpen(true)}
                  variant="destructive"
                  className="gap-2 h-9 text-sm"
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
        </div>
      </div>
    </div>
  )
}
