'use server'

import { auth } from '@/lib/auth'
import { getUserEvents } from '@/app/actions/events'
import { redirect } from 'next/navigation'
import { Topbar } from '@/components/topbar'
import { Dock } from '@/components/dock'

/**
 * CRITICAL: Server-side layout that validates user has a valid event
 * This runs on EVERY request to routes under (app) and PREVENTS rendering if no event exists
 * This is the primary guard against the vulnerability of deleted events
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Get authenticated user
  const session = await auth()
  
  if (!session?.user?.id) {
    // Not authenticated, redirect to login
    redirect('/')
  }

  // 2. Get all events for this user
  let userEvents: { id: number; name: string }[] = []
  try {
    userEvents = await getUserEvents(session.user.id)
  } catch (error) {
    console.error('[v0] Error fetching user events in layout:', error)
    // If we can't fetch events, redirect to select-event to be safe
    redirect('/select-event')
  }

  // 3. CRITICAL: If user has NO events, redirect to select-event
  if (userEvents.length === 0) {
    redirect('/select-event')
  }

  // 4. User has at least one valid event, allow rendering
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Dock />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
