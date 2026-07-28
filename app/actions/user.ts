'use server'

import { db } from '@/lib/db'
import { appUsers, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const DEFAULT_CATEGORIES = [
  { name: 'Pago de Camperos', type: 'income', color: '#22c55e', icon: 'users' },
  { name: 'Comida', type: 'expense', color: '#f97316', icon: 'utensils' },
  { name: 'Hospedaje', type: 'expense', color: '#3b82f6', icon: 'home' },
  { name: 'Transporte', type: 'expense', color: '#a855f7', icon: 'bus' },
  { name: 'Materiales', type: 'expense', color: '#ec4899', icon: 'package' },
  { name: 'Donaciones', type: 'income', color: '#14b8a6', icon: 'heart' },
  { name: 'Otros Ingresos', type: 'income', color: '#6366f1', icon: 'plus-circle' },
  { name: 'Otros Egresos', type: 'expense', color: '#ef4444', icon: 'minus-circle' },
]

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function getOrCreateUser(email: string): Promise<{ id: string; email: string; name: string | null }> {
  const normalized = email.trim().toLowerCase()

  const existing = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, normalized))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  const id = generateId()
  const [created] = await db
    .insert(appUsers)
    .values({ id, email: normalized, name: null })
    .returning()

  // Seed default camp categories for new users
  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId: id }))
  )

  return created
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const rows = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, normalized))
    .limit(1)
  return rows[0] ?? null
}
