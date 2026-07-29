'use client'

import { useEventSession } from '@/lib/contexts/event-session-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Topbar } from '@/components/topbar'
import { FloatingDock } from '@/components/floating-dock'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { eventId } = useEventSession()
  const router = useRouter()

  useEffect(() => {
    if (!eventId) {
      router.push('/select-event')
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
