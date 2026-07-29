'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { CategoriesClient } from '@/components/categories-client'

export default function CategoriesPage() {
  const { user } = useUser()
  const { eventId } = useEventSession()

  if (!user) return null
  return <CategoriesClient userId={user.id} eventId={eventId} />
}
