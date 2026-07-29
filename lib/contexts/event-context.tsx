'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getUserEvents } from '@/app/actions/events'
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
      console.log('[v0] EventContext: No user available')
      setLoading(false)
      return
    }

    try {
      console.log('[v0] EventContext: Starting to load events for user:', user.id)
      setLoading(true)
      setError(null)

      const userEvents = await getUserEvents(user.id)
      console.log('[v0] EventContext: getUserEvents returned:', userEvents)
      
      if (!userEvents || userEvents.length === 0) {
        console.log('[v0] EventContext: No events found for user')
        setEvents([])
        setEventId(null)
        setLoading(false)
        return
      }

      console.log('[v0] EventContext: Setting', userEvents.length, 'events')
      setEvents(userEvents.map((e: any) => ({ id: e.id, name: e.name })))

      // Usar el primer evento del usuario
      console.log('[v0] EventContext: Setting current event to:', userEvents[0].id)
      setEventId(userEvents[0].id)
      writeToStorage(STORAGE_KEY, String(userEvents[0].id))
    } catch (err) {
      console.error('[v0] EventContext Error:', err)
      setError(String(err))
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
