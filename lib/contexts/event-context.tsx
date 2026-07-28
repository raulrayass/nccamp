'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getOrCreateDefaultEvent } from '@/app/actions/events'
import { useUser } from '@/components/user-provider'

interface EventContextType {
  eventId: number | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [eventId, setEventId] = useState<number | null>(null)
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
      const event = await getOrCreateDefaultEvent(user.id)
      setEventId(event.id)
    } catch (err) {
      console.error('[v0] Error initializing event:', err)
      setError(err instanceof Error ? err.message : 'Error al inicializar evento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeEvent()
  }, [user])

  return (
    <EventContext.Provider value={{ eventId, loading, error, refetch: initializeEvent }}>
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
