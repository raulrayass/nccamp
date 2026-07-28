'use server'

import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { and, eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const CATEGORIES_PER_PAGE = 25

// Get ALL categories (no pagination)
export async function getAllCategories(userId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name))
}

export async function getCategories(userId: string, page: number = 1) {
  const offset = (page - 1) * CATEGORIES_PER_PAGE
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name))
    .limit(CATEGORIES_PER_PAGE)
    .offset(offset)
}

export async function getCategoriesCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(categories)
    .where(eq(categories.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function createCategory(
  userId: string,
  data: { name: string; type: string; color: string; icon: string }
) {
  await db.insert(categories).values({ userId, ...data })
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function updateCategory(
  userId: string,
  id: number,
  data: { name: string; type: string; color: string; icon: string }
) {
  await db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function deleteCategory(userId: string, id: number) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}
