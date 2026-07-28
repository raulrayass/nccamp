'use client'

import { useUser } from '@/components/user-provider'
import { ChurchesClient } from '@/components/churches-client'

export default function ChurchesPage() {
  const { user } = useUser()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ChurchesClient userId={user.id} />
    </div>
  )
}
