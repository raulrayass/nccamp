'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { DashboardClient } from '@/components/dashboard-client'

export default function DashboardPage() {
  const { user } = useUser()
  const { eventId } = useEventSession()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return (
    <main className="flex-1">
      <DashboardClient userId={user.id} eventId={eventId} />
    </main>
  )
}
