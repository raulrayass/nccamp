'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { getUserEvents } from '@/app/actions/events'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface EventOption {
  id: number
  name: string
}

export function EventSwitcher() {
  const router = useRouter()
  const { user } = useUser()
  const { eventId, setEventSession } = useEventSession()
  const [events, setEvents] = useState<EventOption[]>([])
  const [currentEvent, setCurrentEvent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    async function loadEvents() {
      try {
        const userEvents = await getUserEvents(user.id)
        setEvents(userEvents || [])
        
        // Find current event name
        if (eventId && userEvents) {
          const current = userEvents.find(e => e.id === eventId)
          setCurrentEvent(current?.name || '')
        }
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user?.id, eventId])

  const handleChangeEvent = (newEventId: number) => {
    setEventSession(newEventId)
    router.refresh()
  }

  if (loading || !currentEvent) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Cargando...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="truncate max-w-[150px]">{currentEvent}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mis Eventos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {events.map(event => (
          <DropdownMenuItem
            key={event.id}
            onClick={() => handleChangeEvent(event.id)}
            className={eventId === event.id ? 'bg-accent' : ''}
          >
            {event.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/select-event')}>
          + Cambiar evento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
