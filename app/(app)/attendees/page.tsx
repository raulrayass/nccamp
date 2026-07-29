'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { AttendeesClient } from '@/components/attendees-client'

export default function AttendeesPage() {
  const { user } = useUser()
  const { eventId } = useEventSession()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return <AttendeesClient userId={user.id} eventId={eventId} />
}
