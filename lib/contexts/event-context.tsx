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

const STORAGE_KEY = 'selectedEventId'

function readFromStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeToStorage(key: string, value: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Silently fail if storage is not available
  }
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

      // Try to get user events
      let userEvents: any[] = []
      try {
        userEvents = await getUserEvents(user.id)
      } catch (fetchErr) {
        console.warn('[v0] Could not fetch user events, trying default event:', fetchErr)
        // If fetch fails, create/get default event instead
        try {
          const defaultEvent = await getOrCreateDefaultEvent(user.id)
          userEvents = [defaultEvent]
        } catch (defaultErr) {
          console.error('[v0] Could not create default event:', defaultErr)
          setError('No se pudo cargar los eventos')
          setLoading(false)
          return
        }
      }

      setEvents(userEvents.map((e: any) => ({ id: e.id, name: e.name })))

      const savedId = readFromStorage(STORAGE_KEY)
      const savedIdNum = savedId ? parseInt(savedId, 10) : null

      if (savedIdNum && userEvents.some((e: any) => e.id === savedIdNum)) {
        setEventId(savedIdNum)
      } else if (userEvents.length > 0) {
        setEventId(userEvents[0].id)
        writeToStorage(STORAGE_KEY, String(userEvents[0].id))
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
    writeToStorage(STORAGE_KEY, String(id))
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
