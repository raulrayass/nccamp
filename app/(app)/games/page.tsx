import { GamesClient } from '@/components/games-client'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Juegos & Marcador | Campamento',
  description: 'Gestiona juegos y registra puntos por equipo',
}

export default async function GamesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="flex-1 p-4 sm:p-6">
      <GamesClient userId={session.user.id} />
    </main>
  )
}
