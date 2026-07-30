'use client'

import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { TransactionsClient } from '@/components/transactions-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TransactionsPage() {
  const { user } = useUser()
  const { eventId, isInitialized } = useEventSession()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !eventId) {
      router.push('/select-event')
    }
  }, [isInitialized, eventId, router])

  if (!isInitialized || !user || !eventId) return null
  return <TransactionsClient userId={user.id} eventId={eventId} />
}
