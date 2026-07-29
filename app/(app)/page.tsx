'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { DashboardClient } from '@/components/dashboard-client'

export default function DashboardPage() {
  const { user } = useUser()
  const { eventId } = useEventSession()

  if (!user || !eventId) return null
  return <DashboardClient userId={user.id} eventId={eventId} />
}
