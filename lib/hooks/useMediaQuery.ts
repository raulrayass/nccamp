'use client'

import { useEffect, useState, useRef } from 'react'

// Cache for media query results to avoid duplicate listeners
const mediaQueryCache = new Map<string, boolean>()

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Return cached value if available (SSR safe)
    if (typeof window === 'undefined') return false
    if (mediaQueryCache.has(query)) {
      return mediaQueryCache.get(query)!
    }
    return window.matchMedia(query).matches
  })

  const mediaQueryRef = useRef<MediaQueryList | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    mediaQueryRef.current = mediaQuery
    
    const initialMatches = mediaQuery.matches
    setMatches(initialMatches)
    mediaQueryCache.set(query, initialMatches)

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
      mediaQueryCache.set(query, e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
