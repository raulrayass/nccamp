'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllTeams } from '@/app/actions/teams'
import { useSession } from '@/lib/auth-client'

export interface Team {
  id: number
  name: string
  color: string
  country?: string | null
  useCountry?: boolean
  userId: string
  eventId?: number | null
  createdAt?: Date
}

interface UseTeamsState {
  teams: Team[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTeams(eventId?: number | null): UseTeamsState {
  const session = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadTeams = useCallback(async () => {
    if (!userId) {
      setTeams([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllTeams(userId, eventId)
      setTeams(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'))
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  return {
    teams,
    isLoading,
    error,
    refetch: loadTeams,
  }
}
