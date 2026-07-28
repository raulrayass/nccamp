'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAllCategories } from '@/app/actions/categories'
import { useSession } from '@/lib/auth-client'
import { Category } from '@/lib/db/schema'

interface UseCategoriesState {
  categories: Category[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCategories(eventId?: number | null): UseCategoriesState {
  const session = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  const loadCategories = useCallback(async () => {
    if (!userId) {
      setCategories([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getAllCategories(userId, eventId)
      setCategories(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'))
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, eventId])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    isLoading,
    error,
    refetch: loadCategories,
  }
}
