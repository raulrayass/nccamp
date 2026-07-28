'use client'

import { useCallback, useEffect, useState } from 'react'
import { getTransactions } from '@/app/actions/transactions'
import { useSession } from '@/lib/auth-client'

export interface Transaction {
  id: number
  userId: string
  eventId?: number | null
  categoryId: number
  type: string
  amount: string
  description: string
  date: string
  paymentMethod?: string
  categoryName?: string | null
  categoryColor?: string | null
  categoryIcon?: string | null
  createdAt?: Date
  updatedAt?: Date
}

interface UseTransactionsState {
  transactions: Transaction[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTransactions(
  eventId?: number | null,
  filters?: { type?: string; categoryId?: number; from?: string; to?: string }
): UseTransactionsState {
  const session = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getTransactions(userId, { ...filters, eventId })
      setTransactions(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'))
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId, filters])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    isLoading,
    error,
    refetch: loadTransactions,
  }
}
