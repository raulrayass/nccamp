'use client'

import useSWR from 'swr'

// Global SWR configuration for persistent caching across route navigations
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 60 seconds - keep data in cache
  focusThrottleInterval: 300000, // 5 minutes
}

// Cache keys for different data types
export const CACHE_KEYS = {
  attendees: (userId: string, eventId: number | null) => `attendees-${userId}-${eventId}`,
  staff: (userId: string, eventId: number | null) => `staff-${userId}-${eventId}`,
  churches: (userId: string) => `churches-${userId}`,
  teams: (userId: string, eventId: number | null) => `teams-${userId}-${eventId}`,
  rooms: (userId: string, eventId: number | null) => `rooms-${userId}-${eventId}`,
  dashboard: (userId: string, eventId: number | null) => `dashboard-${userId}-${eventId}`,
  transactions: (userId: string, eventId: number | null) => `transactions-${userId}-${eventId}`,
}

/**
 * Hook for fetching and caching attendees across navigations
 * Prevents reload when switching between attendees and staff
 */
export function useCachedAttendees(
  userId: string,
  eventId: number | null,
  fetcher: () => Promise<any>
) {
  const key = CACHE_KEYS.attendees(userId, eventId)
  const { data, error, isLoading, mutate } = useSWR(
    key,
    fetcher,
    swrConfig
  )

  return {
    data: data || [],
    error,
    isLoading,
    mutate,
  }
}

/**
 * Hook for fetching and caching staff across navigations
 */
export function useCachedStaff(
  userId: string,
  eventId: number | null,
  fetcher: () => Promise<any>
) {
  const key = CACHE_KEYS.staff(userId, eventId)
  const { data, error, isLoading, mutate } = useSWR(
    key,
    fetcher,
    swrConfig
  )

  return {
    data: data || [],
    error,
    isLoading,
    mutate,
  }
}

/**
 * Generic cache hook for any data
 */
export function useCachedData<T extends any[] = any[]>(
  key: string,
  fetcher: () => Promise<T>,
  options?: any
) {
  const { data, error, isLoading, mutate } = useSWR(
    key,
    fetcher,
    { ...swrConfig, ...options }
  )

  return {
    data: (data || []) as T,
    error,
    isLoading,
    mutate,
  }
}
