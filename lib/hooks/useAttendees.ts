'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllAttendees, getAttendeesCount } from '@/app/actions/attendees'
import { useSession } from '@/lib/auth-client'

export interface Attendee {
  id: number
  name: string
  age?: number | null
  shirtSize?: string | null
  sex?: string | null
  phone: string
  church: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactName2?: string | null
  emergencyContactPhone2?: string | null
  allergies: string
  roomId?: number | null
  teamId?: number | null
  totalAmount: number
  amountPaid: number
  discount: number
  status: string
  checkedIn: boolean
  notes: string
  userId: string
  eventId?: number | null
  createdAt?: Date
  updatedAt?: Date
}

interface UseAttendeesState {
  attendees: Attendee[]
  count: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAttendees(eventId?: number | null): UseAttendeesState {
  const session = useSession()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadAttendees = useCallback(async () => {
    if (!userId) {
      setAttendees([])
      setCount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllAttendees(userId, eventId)
      const countData = await getAttendeesCount(userId, eventId)
      setAttendees(data || [])
      setCount(countData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch attendees'))
      setAttendees([])
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadAttendees()
  }, [loadAttendees])

  return {
    attendees,
    count,
    isLoading,
    error,
    refetch: loadAttendees,
  }
}
