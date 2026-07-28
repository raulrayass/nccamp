'use client'

import { useUser } from '@/components/user-provider'
import { useEvent } from '@/lib/contexts/event-context'
import { TransactionsClient } from '@/components/transactions-client'

export default function TransactionsPage() {
  const { user } = useUser()
  const { eventId } = useEvent()

  if (!user) return null
  return <TransactionsClient userId={user.id} eventId={eventId} />
}
