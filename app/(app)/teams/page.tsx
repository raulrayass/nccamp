import { TeamsClient } from '@/components/teams-client'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Equipos | Campamento',
  description: 'Gestiona los equipos del campamento',
}

export default async function TeamsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="flex-1 p-4 sm:p-6">
      <TeamsClient userId={session.user.id} />
    </main>
  )
}
