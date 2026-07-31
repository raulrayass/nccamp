'use client'

import { AttendeeFormPage } from '@/components/attendee-form-page'
import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { useRouter } from 'next/navigation'

export default function NewAttendeePage() {
  const { user } = useUser()
  const { eventId, isInitialized } = useEventSession()
  const router = useRouter()

  if (!user?.id) {
    router.push('/sign-in')
    return null
  }

  if (!isInitialized) {
    return null
  }

  if (!eventId) {
    router.push('/select-event')
    return null
  }

  return <AttendeeFormPage userId={user.id} eventId={eventId} mode="create" />
}
