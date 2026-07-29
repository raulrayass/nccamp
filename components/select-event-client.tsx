'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { createEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface EventOption {
  id: number
  name: string
}

export function SelectEventClient({
  userId,
  initialEvents,
}: {
  userId: string
  initialEvents: EventOption[]
}) {
  const router = useRouter()
  const { setEventSession } = useEventSession()
  const [isPending, startTransition] = useTransition()
  const [showCreateForm, setShowCreateForm] = useState(initialEvents.length === 0)
  const [formData, setFormData] = useState({
    name: '',
    country: 'Colombia',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const handleSelectEvent = (eventId: number) => {
    setEventSession(eventId)
    router.push('/dashboard')
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('El nombre del evento es requerido')
      return
    }

    startTransition(async () => {
      try {
        const event = await createEvent(
          userId,
          formData.name.trim(),
          formData.country,
          formData.startDate,
          formData.endDate
        )
        setEventSession(event.id)
        router.push('/dashboard')
        toast.success('Evento creado exitosamente')
      } catch (error) {
        toast.error('Error al crear el evento')
        console.error(error)
      }
    })
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
          Selecciona un Evento
        </h1>
        <p className="text-center text-foreground/60 mb-8">
          Elige un evento existente o crea uno nuevo para continuar
        </p>

        {/* Mostrar eventos existentes */}
        {initialEvents.length > 0 && !showCreateForm && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {initialEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => handleSelectEvent(event.id)}
                  disabled={isPending}
                  className="p-6 border border-border rounded-lg hover:bg-muted hover:border-primary transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {event.name}
                  </div>
                  <div className="text-sm text-foreground/60 mt-1">
                    Click para seleccionar
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="flex-1"
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Nuevo Evento
              </Button>
            </div>
          </>
        )}

        {/* Formulario para crear evento */}
        {showCreateForm && (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre del Evento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Campamento 2026"
                disabled={isPending}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-foreground/50 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                País
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder="ej: Colombia"
                disabled={isPending}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-foreground/50 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {initialEvents.length > 0 && (
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isPending}
                >
                  Atrás
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isPending ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
