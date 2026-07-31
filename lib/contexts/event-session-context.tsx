'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@/components/user-provider'
import { getDefaultEvent } from '@/app/actions/events'

interface EventSessionContextType {
  eventId: number | null
  setEventSession: (id: number) => void
  clearEventSession: () => void
  isSessionActive: boolean
  isInitialized: boolean
}

const EventSessionContext = createContext<EventSessionContextType | undefined>(undefined)

const COOKIE_NAME = 'eventSession'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

// Read eventId from cookie
function readSession(): number | null {
  if (typeof document === 'undefined') return null
  try {
    const nameEQ = COOKIE_NAME + '='
    const cookies = document.cookie.split(';')
    for (let c of cookies) {
      c = c.trim()
      if (c.indexOf(nameEQ) === 0) {
        const val = c.substring(nameEQ.length)
        return val ? parseInt(val, 10) : null
      }
    }
    return null
  } catch {
    return null
  }
}

// Write eventId to cookie (1 year expiration, SameSite=Lax, path=/)
function writeSession(value: number) {
  if (typeof document === 'undefined') return
  try {
    const date = new Date()
    date.setTime(date.getTime() + COOKIE_MAX_AGE * 1000)
    const expires = 'expires=' + date.toUTCString()
    document.cookie = `${COOKIE_NAME}=${value};${expires};path=/;SameSite=Lax`
  } catch {
    // Cookie write failed silently
  }
}

// Delete eventId cookie
function clearSessionStorage() {
  if (typeof document === 'undefined') return
  try {
    document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  } catch {
    // Cookie delete failed silently
  }
}

export function EventSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [eventId, setEventId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from cookie on mount (only once)
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const saved = readSession()
      console.log("[v0] EventSessionProvider: Read saved eventId from cookie:", saved)
      setEventId(saved)
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Load default event if user is authenticated but no event is selected (only after initialization)
  useEffect(() => {
    console.log("[v0] Default event effect - isInitialized:", isInitialized, "user:", user?.id, "eventId:", eventId)
    if (!isInitialized || !user?.id || eventId !== null) return

    async function loadDefaultEvent() {
      try {
        console.log("[v0] Loading default event...")
        const defaultEvent = await getDefaultEvent(user.id)
        console.log("[v0] Default event loaded:", defaultEvent)
        if (defaultEvent) {
          setEventId(defaultEvent.id)
          writeSession(defaultEvent.id)
          console.log("[v0] Set event to:", defaultEvent.id)
        }
      } catch (error) {
        console.error('Error loading default event:', error)
      }
    }

    loadDefaultEvent()
  }, [isInitialized, user?.id, eventId])

  const setEventSession = (id: number) => {
    setEventId(id)
    writeSession(id)
  }

  const clearEventSession = () => {
    setEventId(null)
    clearSessionStorage()
  }

  return (
    <EventSessionContext.Provider
      value={{
        eventId,
        setEventSession,
        clearEventSession,
        isSessionActive: eventId !== null,
        isInitialized,
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
