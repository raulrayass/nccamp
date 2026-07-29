'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/user-provider'
import { getUserEvents } from '@/app/actions/events'
import { SelectEventClient } from '@/components/select-event-client'

interface EventOption {
  id: number
  name: string
}

export function SelectEventPageWrapper() {
  const router = useRouter()
  const { user } = useUser()
  const [events, setEvents] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    async function loadEvents() {
      try {
        const userEvents = await getUserEvents(user.id)
        setEvents(userEvents)
      } catch (error) {
        console.error('Error loading events:', error)
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
          <div className="text-foreground/60">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return null
  }

  return <SelectEventClient userId={user.id} initialEvents={events} />
}
