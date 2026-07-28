'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllGames } from '@/app/actions/games'
import { useSession } from '@/lib/auth-client'

export interface Game {
  id: number
  name: string
  description?: string | null
  gameDate?: string | null
  userId: string
  eventId?: number | null
  createdAt?: Date
}

interface UseGamesState {
  games: Game[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGames(eventId?: number | null): UseGamesState {
  const session = useSession()
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadGames = useCallback(async () => {
    if (!userId) {
      setGames([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllGames(userId, eventId)
      setGames(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch games'))
      setGames([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  return {
    games,
    isLoading,
    error,
    refetch: loadGames,
  }
}
