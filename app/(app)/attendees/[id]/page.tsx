'use client'

import { AttendeeFormPage } from '@/components/attendee-form-page'
import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AttendeeDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser()
  const { eventId, isInitialized } = useEventSession()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

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

    const attendeeId = parseInt(params.id, 10)
    if (isNaN(attendeeId)) {
      router.push('/attendees')
      return
    }

    setIsReady(true)
  }, [user, isInitialized, eventId, params.id, router])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const attendeeId = parseInt(params.id, 10)

  return <AttendeeFormPage userId={user!.id} eventId={eventId!} attendeeId={attendeeId} mode="edit" />
}
