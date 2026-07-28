'use client'

import { GamesClient } from '@/components/games-client'
import { useUser } from '@/components/user-provider'
import { useEvent } from '@/lib/contexts/event-context'

export default function GamesPage() {
  const { user } = useUser()
  const { eventId } = useEvent()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return (
    <main className="flex-1 p-4 sm:p-6">
      <GamesClient userId={user.id} eventId={eventId} />
    </main>
  )
}
