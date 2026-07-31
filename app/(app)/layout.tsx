'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { Topbar } from '@/components/topbar'
import { FloatingDock } from '@/components/floating-dock'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { eventId, isInitialized } = useEventSession()

  useEffect(() => {
    if (isInitialized && eventId === null) {
      router.replace('/select-event')
    }
  }, [isInitialized, eventId, router])

  // Wait for initialization before rendering anything
  if (!isInitialized) {
    return null
  }

  // If eventId is null, let the polling in EventSessionContext detect and handle redirect
  // Don't render children to avoid errors with invalid eventId
  if (!eventId) {
    return null
  }

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Topbar />
      <main className="flex-1 flex flex-col pb-24 lg:pb-0">
        {children}
      </main>
      <FloatingDock />
    </div>
  )
}
