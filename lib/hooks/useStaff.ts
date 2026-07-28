'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllStaff } from '@/app/actions/staff'
import { useSession } from '@/lib/auth-client'
import { Staff } from '@/lib/db/schema'

interface UseStaffState {
  staff: Staff[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStaff(eventId?: number | null): UseStaffState {
  const session = useSession()
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadStaff = useCallback(async () => {
    if (!userId) {
      setStaffList([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllStaff(userId, eventId)
      setStaffList(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch staff'))
      setStaffList([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  return {
    staff: staffList,
    isLoading,
    error,
    refetch: loadStaff,
  }
}
