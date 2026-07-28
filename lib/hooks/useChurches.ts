'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllChurches } from '@/app/actions/churches'
import { useSession } from '@/lib/auth-client'

export interface Church {
  id: number
  name: string
  userId: string
  eventId?: number | null
  createdAt?: Date
  updatedAt?: Date
}

interface UseChurchesState {
  churches: Church[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useChurches(eventId?: number | null): UseChurchesState {
  const session = useSession()
  const [churches, setChurches] = useState<Church[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadChurches = useCallback(async () => {
    if (!userId) {
      setChurches([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllChurches(userId, eventId)
      setChurches(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch churches'))
      setChurches([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadChurches()
  }, [loadChurches])

  return {
    churches,
    isLoading,
    error,
    refetch: loadChurches,
  }
}
