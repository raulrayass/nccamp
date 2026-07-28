// Performance optimization utilities

/**
 * Debounce function to reduce re-renders
 * Useful for search inputs, filtering, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeoutId = null
      func(...args)
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(later, wait)
  }
}

/**
 * Throttle function to rate-limit function calls
 * Useful for scroll, resize, and other high-frequency events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Memoize function results to avoid recalculation
 * Useful for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map()
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Prefetch data to improve perceived performance
 * Use in route change handlers to load data early
 */
export async function prefetchData(fetcher: () => Promise<any>) {
  try {
    await fetcher()
  } catch (error) {
    console.error('Prefetch error:', error)
  }
}

/**
 * Calculate LCP (Largest Contentful Paint) for performance monitoring
 * Call this in a useEffect to track performance
 */
export function observeLCP(callback?: (metric: { name: string; value: number }) => void) {
  if (typeof window === 'undefined') return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (callback) {
        callback({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
        })
      }
    })
    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    return observer
  } catch (error) {
    console.error('LCP observer error:', error)
  }
}

/**
 * Calculate INP (Interaction to Next Paint) for responsiveness
 * Call this in a useEffect to track performance
 */
export function observeINP(callback?: (metric: { name: string; value: number }) => void) {
  if (typeof window === 'undefined') return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (callback) {
        callback({
          name: 'INP',
          value: (lastEntry as any).duration,
        })
      }
    })
    observer.observe({ type: 'event', buffered: true, durationThreshold: 0 })
    return observer
  } catch (error) {
    console.error('INP observer error:', error)
  }
}

/**
 * Calculate CLS (Cumulative Layout Shift) for visual stability
 * Call this in a useEffect to track performance
 */
export function observeCLS(callback?: (metric: { name: string; value: number }) => void) {
  if (typeof window === 'undefined') return

  let clsValue = 0
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          if (callback) {
            callback({
              name: 'CLS',
              value: clsValue,
            })
          }
        }
      }
    })
    observer.observe({ type: 'layout-shift', buffered: true })
    return observer
  } catch (error) {
    console.error('CLS observer error:', error)
  }
}
