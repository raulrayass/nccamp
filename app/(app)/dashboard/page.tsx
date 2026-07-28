'use client'

import { useUser } from '@/components/user-provider'
import { useEvent } from '@/lib/contexts/event-context'
import { DashboardClient } from '@/components/dashboard-client'

export default function DashboardPage() {
  const { user } = useUser()
  const { eventId } = useEvent()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return (
    <main className="flex-1">
      <DashboardClient userId={user.id} eventId={eventId} />
    </main>
  )
}
