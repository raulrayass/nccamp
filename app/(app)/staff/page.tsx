'use client'

import { useUser } from '@/components/user-provider'
import { useEvent } from '@/lib/contexts/event-context'
import { StaffClient } from '@/components/staff-client'

export default function StaffPage() {
  const { user } = useUser()
  const { eventId } = useEvent()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return <StaffClient userId={user.id} eventId={eventId} />
}
