'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { Topbar } from '@/components/topbar'
import { FloatingDock } from '@/components/floating-dock'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { eventId } = useEventSession()

  useEffect(() => {
    if (eventId === null) {
      router.replace('/select-event')
    }
  }, [eventId, router])

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
