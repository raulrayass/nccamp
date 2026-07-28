'use client'

import { useUser } from '@/components/user-provider'
import { DashboardClient } from '@/components/dashboard-client'

export default function DashboardPage() {
  const { user } = useUser()
  if (!user) return null
  return <DashboardClient userId={user.id} />
}
