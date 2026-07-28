'use client'

import { useUser } from '@/components/user-provider'
import { useEvent } from '@/lib/contexts/event-context'
import { CategoriesClient } from '@/components/categories-client'

export default function CategoriesPage() {
  const { user } = useUser()
  const { eventId } = useEvent()

  if (!user) return null
  return <CategoriesClient userId={user.id} eventId={eventId} />
}
