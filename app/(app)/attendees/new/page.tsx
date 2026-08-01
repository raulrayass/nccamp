'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NewAttendeePage() {
  const { user } = useUser()
  const { eventId, isInitialized } = useEventSession()
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) {
      router.push('/sign-in')
      return
    }

    if (!isInitialized) {
      return
    }

    if (!eventId) {
      router.push('/select-event')
      return
    }

    // Redirect to attendees with new parameter to open add drawer
    router.push('/attendees?new=1')
  }, [user?.id, isInitialized, eventId, router])

  return null
}
