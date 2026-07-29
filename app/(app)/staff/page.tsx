'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { StaffClient } from '@/components/staff-client'

export default function StaffPage() {
  const { user } = useUser()
  const { eventId } = useEventSession()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return <StaffClient userId={user.id} eventId={eventId} />
}
