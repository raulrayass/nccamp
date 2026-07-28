'use client'

import { useUser } from '@/components/user-provider'
import { AttendeesClient } from '@/components/attendees-client'

export default function AttendeesPage() {
  const { user } = useUser()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return <AttendeesClient userId={user.id} />
}
