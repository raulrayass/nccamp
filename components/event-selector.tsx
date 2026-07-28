'use client'

import { useState, useTransition } from 'react'
import { useEvent } from '@/lib/contexts/event-context'
import { useUser } from '@/components/user-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { createEvent } from '@/app/actions/events'
import { toast } from 'sonner'

export function EventSelector() {
  const { user } = useUser()
  const { eventId, events, loading, setEvent, refetch } = useEvent()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    startDate: '',
    endDate: '',
  })

  const currentEvent = events.find(e => e.id === eventId)

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim() || !user) {
      toast.error('El nombre del evento es requerido')
      return
    }

    startTransition(async () => {
      try {
        const event = await createEvent(user.id, formData.name.trim(), formData.country || undefined)
        setEvent(event.id)
        setFormData({ name: '', country: '', startDate: '', endDate: '' })
        setDialogOpen(false)
        await refetch()
        toast.success('Evento creado exitosamente')
      } catch (error) {
        toast.error('Error al crear el evento')
        console.error(error)
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          value={eventId || ''}
          onChange={(e) => {
            const selectedId = parseInt(e.target.value)
            if (!isNaN(selectedId)) {
              setEvent(selectedId)
            }
          }}
          disabled={loading}
          className="h-9 px-3 rounded-md border border-border bg-background text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">
            {loading ? 'Cargando...' : 'Seleccionar evento'}
          </option>
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
        <Button
          onClick={() => setDialogOpen(true)}
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          title="Crear nuevo evento"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo evento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="event-name" className="text-sm font-medium">Nombre del evento</Label>
              <Input
                id="event-name"
                placeholder="Ej: Campamento 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending}
                className="h-10"
                required
              />
            </div>
            <div>
              <Label htmlFor="event-country" className="text-sm font-medium">País</Label>
              <Input
                id="event-country"
                placeholder="Ej: México"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={isPending}
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="event-start" className="text-sm font-medium">Fecha inicio</Label>
                <Input
                  id="event-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isPending}
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="event-end" className="text-sm font-medium">Fecha fin</Label>
                <Input
                  id="event-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isPending}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending ? 'Creando...' : 'Crear evento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
