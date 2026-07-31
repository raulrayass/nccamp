'use client'

import { AttendeeFormPage } from '@/components/attendee-form-page'
import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'

export default function AttendeeDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser()
  const { eventId } = useEventSession()

  if (!user?.id || !eventId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const attendeeId = parseInt(params.id, 10)

  if (isNaN(attendeeId)) {
    return <div className="text-center py-8">ID de campero inválido</div>
  }

  return <AttendeeFormPage userId={user.id} eventId={eventId} attendeeId={attendeeId} mode="edit" />
}
