'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getOrCreateDefaultEvent, getUserEvents } from '@/app/actions/events'
import { useUser } from '@/components/user-provider'

interface EventOption {
  id: number
  name: string
}

interface EventContextType {
  eventId: number | null
  events: EventOption[]
  loading: boolean
  error: string | null
  setEvent: (id: number) => void
  refetch: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

const COOKIE_NAME = 'selectedEventId'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=31536000`
}

export function EventProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [eventId, setEventId] = useState<number | null>(null)
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initializeEvent = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const userEvents = await getUserEvents(user.id)
      setEvents(userEvents.map((e: any) => ({ id: e.id, name: e.name })))

      const savedId = readCookie(COOKIE_NAME)
      const savedIdNum = savedId ? parseInt(savedId, 10) : null

      if (savedIdNum && userEvents.some((e: any) => e.id === savedIdNum)) {
        setEventId(savedIdNum)
      } else if (userEvents.length > 0) {
        setEventId(userEvents[0].id)
        writeCookie(COOKIE_NAME, String(userEvents[0].id))
      } else {
        const event = await getOrCreateDefaultEvent(user.id)
        setEventId(event.id)
        setEvents([{ id: event.id, name: event.name }])
        writeCookie(COOKIE_NAME, String(event.id))
      }
    } catch (err) {
      console.error('[v0] Error initializing event:', err)
      setError(err instanceof Error ? err.message : 'Error al inicializar evento')
    } finally {
      setLoading(false)
    }
  }

  const setEvent = (id: number) => {
    setEventId(id)
    writeCookie(COOKIE_NAME, String(id))
  }

  useEffect(() => {
    initializeEvent()
  }, [user])

  return (
    <EventContext.Provider value={{ eventId, events, loading, error, setEvent, refetch: initializeEvent }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvent() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvent debe ser usado dentro de EventProvider')
  }
  return context
}
