'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { DashboardClient } from '@/components/dashboard-client'

export default function DashboardPage() {
  const { user } = useUser()
  const { eventId, isInitialized } = useEventSession()

  console.log("[v0] Dashboard page - user:", user?.id, "eventId:", eventId, "isInitialized:", isInitialized)

  if (!user) {
    console.log("[v0] No user")
    return null
  }

  if (!isInitialized) {
    console.log("[v0] Event session not initialized yet")
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!eventId) {
    console.log("[v0] No eventId")
    return null
  }

  return <DashboardClient userId={user.id} eventId={eventId} />
}
