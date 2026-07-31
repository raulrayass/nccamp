'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { DashboardClient } from '@/components/dashboard-client'

export default function DashboardPage() {
  const { user } = useUser()
  const { eventId, isInitialized } = useEventSession()

  if (!user) return null

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!eventId) return null

  return <DashboardClient userId={user.id} eventId={eventId} />
}
