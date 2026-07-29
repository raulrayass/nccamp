'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@/components/user-provider'
import { getDefaultEvent } from '@/app/actions/events'

interface EventSessionContextType {
  eventId: number | null
  setEventSession: (id: number) => void
  clearEventSession: () => void
  isSessionActive: boolean
}

const EventSessionContext = createContext<EventSessionContextType | undefined>(undefined)

const SESSION_KEY = 'eventSession'

function readSession(key: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const val = localStorage.getItem(key)
    return val ? parseInt(val, 10) : null
  } catch {
    return null
  }
}

function writeSession(key: string, value: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // Silently fail
  }
}

function clearSessionStorage(key: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently fail
  }
}

export function EventSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [eventId, setEventId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from sessionStorage on mount (only once)
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const saved = readSession(SESSION_KEY)
      setEventId(saved)
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Load default event if user is authenticated but no event is selected
  useEffect(() => {
    if (!user?.id || eventId !== null) return

    async function loadDefaultEvent() {
      try {
        const defaultEvent = await getDefaultEvent(user.id)
        if (defaultEvent) {
          setEventId(defaultEvent.id)
          writeSession(SESSION_KEY, defaultEvent.id)
        }
      } catch (error) {
        console.error('Error loading default event:', error)
      }
    }

    loadDefaultEvent()
  }, [user?.id, eventId])

  const setEventSession = (id: number) => {
    setEventId(id)
    writeSession(SESSION_KEY, id)
  }

  const clearEventSession = () => {
    setEventId(null)
    clearSessionStorage(SESSION_KEY)
  }

  return (
    <EventSessionContext.Provider
      value={{
        eventId,
        setEventSession,
        clearEventSession,
        isSessionActive: eventId !== null,
      }}
    >
      {children}
    </EventSessionContext.Provider>
  )
}

export function useEventSession() {
  const context = useContext(EventSessionContext)
  if (!context) {
    throw new Error('useEventSession must be used within EventSessionProvider')
  }
  return context
}
