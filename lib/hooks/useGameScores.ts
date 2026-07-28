'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllGameScores } from '@/app/actions/games'
import { useSession } from '@/lib/auth-client'

export interface GameScore {
  id: number
  gameId: number
  teamId: number
  points: number
  userId: string
  eventId?: number | null
  createdAt?: Date
}

interface GameScoresState {
  scores: GameScore[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGameScores(eventId?: number | null): GameScoresState {
  const session = useSession()
  const [scores, setScores] = useState<GameScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadScores = useCallback(async () => {
    if (!userId) {
      setScores([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllGameScores(userId, eventId)
      setScores(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch game scores'))
      setScores([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadScores()
  }, [loadScores])

  return {
    scores,
    isLoading,
    error,
    refetch: loadScores,
  }
}
