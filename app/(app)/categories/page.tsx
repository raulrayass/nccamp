'use client'

import { useUser } from '@/components/user-provider'
import { CategoriesClient } from '@/components/categories-client'

export default function CategoriesPage() {
  const { user } = useUser()
  if (!user) return null
  return <CategoriesClient userId={user.id} />
}
