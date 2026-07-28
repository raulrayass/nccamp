'use client'

import { useUser } from '@/components/user-provider'
import { TransactionsClient } from '@/components/transactions-client'

export default function TransactionsPage() {
  const { user } = useUser()
  if (!user) return null
  return <TransactionsClient userId={user.id} />
}
