'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllRooms } from '@/app/actions/rooms'
import { useSession } from '@/lib/auth-client'

export interface Room {
  id: number
  name: string
  capacity?: number | null
  userId: string
  eventId?: number | null
  createdAt?: Date
}

interface UseRoomsState {
  rooms: Room[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useRooms(eventId?: number | null): UseRoomsState {
  const session = useSession()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadRooms = useCallback(async () => {
    if (!userId) {
      setRooms([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllRooms(userId, eventId)
      setRooms(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rooms'))
      setRooms([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  return {
    rooms,
    isLoading,
    error,
    refetch: loadRooms,
  }
}
