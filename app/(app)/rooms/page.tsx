import { RoomsClient } from '@/components/rooms-client'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Habitaciones | Campamento',
  description: 'Gestiona las habitaciones del campamento',
}

export default async function RoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="flex-1 p-4 sm:p-6">
      <RoomsClient userId={session.user.id} />
    </main>
  )
}
