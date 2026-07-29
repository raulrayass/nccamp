'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { TransactionsClient } from '@/components/transactions-client'

export default function TransactionsPage() {
  const { user } = useUser()
  const { eventId } = useEventSession()

  if (!user) return null
  return <TransactionsClient userId={user.id} eventId={eventId} />
}
