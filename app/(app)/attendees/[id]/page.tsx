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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">ID de campero inválido: {params.id}</p>
          <a href="/attendees" className="text-blue-600 underline">Volver a camperos</a>
        </div>
      </div>
    )
  }

  return <AttendeeFormPage userId={user.id} eventId={eventId} attendeeId={attendeeId} mode="edit" />
}
