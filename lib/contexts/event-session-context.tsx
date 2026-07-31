'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/user-provider'
import { getDefaultEvent, getUserEvents } from '@/app/actions/events'

interface EventSessionContextType {
  eventId: number | null
  events: { id: number; name: string }[]
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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [eventId, setEventId] = useState<number | null>(null)
  const [events, setEvents] = useState<{ id: number; name: string }[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from cookie on mount (only once)
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const saved = readSession()
      setEventId(saved)
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Validate event and load/redirect accordingly
  useEffect(() => {
    if (!isInitialized || !user?.id) return

    async function validateAndLoadEvent() {
      try {
        // Get all events for this user
        const userEvents = await getUserEvents(user.id)
        
        // Store events in state
        setEvents(userEvents || [])
        
        // If user has no events, clear session and redirect to select-event
        if (!userEvents || userEvents.length === 0) {
          setEventId(null)
          clearSessionStorage()
          startTransition(() => {
            router.push('/select-event')
          })
          return
        }

        // If eventId from cookie exists in user's events, keep it
        if (eventId !== null && userEvents.some(e => e.id === eventId)) {
          return // Event is valid, keep it
        }

        // If eventId from cookie is invalid (was deleted), try to load default
        if (eventId !== null) {
          const defaultEvent = await getDefaultEvent(user.id)
          if (defaultEvent) {
            setEventId(defaultEvent.id)
            writeSession(defaultEvent.id)
            return
          }
          // No default, use first event from list
          const firstEvent = userEvents[0]
          setEventId(firstEvent.id)
          writeSession(firstEvent.id)
          return
        }

        // No eventId selected yet, try default
        const defaultEvent = await getDefaultEvent(user.id)
        if (defaultEvent && userEvents.some(e => e.id === defaultEvent.id)) {
          setEventId(defaultEvent.id)
          writeSession(defaultEvent.id)
          return
        }

        // Use first event as fallback
        const firstEvent = userEvents[0]
        setEventId(firstEvent.id)
        writeSession(firstEvent.id)
      } catch (error) {
        console.error('[v0] Error validating event:', error)
        setEventId(null)
        clearSessionStorage()
      }
    }

    validateAndLoadEvent()
  }, [isInitialized, user?.id, eventId, router])

  // Periodic validation to detect cross-device deletions and new events
  useEffect(() => {
    if (!isInitialized || !user?.id) return

    const interval = setInterval(async () => {
      try {
        // Always check for user's events
        const userEvents = await getUserEvents(user.id)
        
        if (!userEvents || userEvents.length === 0) {
          // No events - redirect to select-event
          if (eventId !== null) {
            setEventId(null)
            clearSessionStorage()
            clearInterval(interval)
            window.location.href = '/select-event'
          }
          return
        }

        // If we have no eventId but there are events (new event created on other device)
        if (!eventId && userEvents.length > 0) {
          const defaultEvent = userEvents[0]
          setEventId(defaultEvent.id)
          writeSession(defaultEvent.id)
          setEvents(userEvents)
          return
        }
        
        // If current event still exists, just sync the list
        if (eventId && userEvents.some(e => e.id === eventId)) {
          setEvents(userEvents)
        } else if (eventId) {
          // Event was deleted - redirect
          setEventId(null)
          clearSessionStorage()
          clearInterval(interval)
          window.location.href = '/select-event'
        }
      } catch (error) {
        console.error('[v0] Error validating event in polling:', error)
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
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
        events,
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
