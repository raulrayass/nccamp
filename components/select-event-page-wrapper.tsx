'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/components/user-provider'
import { getUserEvents } from '@/app/actions/events'
import { SelectEventClient } from '@/components/select-event-client'

interface EventOption {
  id: number
  name: string
}

export function SelectEventPageWrapper() {
  const { user } = useUser()
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    async function loadEvents() {
      try {
        setLoading(true)
        setError(null)
        const userEvents = await getUserEvents(user.id)
        setEvents(userEvents || [])
      } catch (err) {
        console.error('Error loading events:', err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user?.id])

  if (loading) {
    return (
      <div className="w-full max-w-2xl">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border text-center">
          <div className="text-foreground/60">Cargando eventos...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-red-500/50">
          <div className="text-red-600 font-semibold mb-2">Error al cargar eventos:</div>
          <div className="text-red-600 text-sm break-words">{error}</div>
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="w-full max-w-2xl">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border text-center">
          <div className="text-foreground/60">Autenticando...</div>
        </div>
      </div>
    )
  }

  return <SelectEventClient userId={user.id} initialEvents={events} />
}
