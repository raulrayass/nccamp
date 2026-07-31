'use server'

import { db } from '@/lib/db'
import { categories, events } from '@/lib/db/schema'
import { and, eq, asc, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const CATEGORIES_PER_PAGE = 25

// Get ALL categories (no pagination)
export async function getAllCategories(userId: string, eventId?: number | null) {
  const conditions = [eq(categories.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(categories.eventId, eventId))
  }
  return db
    .select()
    .from(categories)
    .where(and(...(conditions as any)))
    .orderBy(asc(categories.name))
}

export async function getCategories(userId: string, page: number = 1, eventId?: number | null) {
  const offset = (page - 1) * CATEGORIES_PER_PAGE
  const conditions = [eq(categories.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(categories.eventId, eventId))
  }
  return db
    .select()
    .from(categories)
    .where(and(...(conditions as any)))
    .orderBy(asc(categories.name))
    .limit(CATEGORIES_PER_PAGE)
    .offset(offset)
}

export async function getCategoriesCount(userId: string, eventId?: number | null) {
  const conditions = [eq(categories.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(categories.eventId, eventId))
  }
  const result = await db
    .select({ count: count() })
    .from(categories)
    .where(and(...(conditions as any)))
  return Number(result[0]?.count ?? 0)
}

export async function createCategory(
  userId: string,
  data: { name: string; type: string; color: string; icon: string; eventId?: number | null }
) {
  // CRITICAL: Validate eventId is provided and exists
  if (!data.eventId || data.eventId === null) {
    throw new Error('INVALID_EVENT: Debe seleccionar un evento para crear una categoría')
  }

  // Verify event exists and belongs to user
  const eventExists = await db
    .select()
    .from(events)
    .where(and(eq(events.id, data.eventId), eq(events.adminId, userId)))
    .limit(1)
    .then(r => r.length > 0)

  if (!eventExists) {
    throw new Error('INVALID_EVENT: El evento no existe o no tienes permisos para acceder')
  }

  await db.insert(categories).values({ userId, eventId: data.eventId, ...data })
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function updateCategory(
  userId: string,
  id: number,
  data: { name: string; type: string; color: string; icon: string; eventId?: number | null }
) {
  const updateData = { ...data }
  delete (updateData as any).eventId // No actualizar eventId
  await db
    .update(categories)
    .set(updateData)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function deleteCategory(userId: string, id: number, eventId?: number | null) {
  const conditions = [eq(categories.id, id), eq(categories.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(categories.eventId, eventId))
  }
  await db
    .delete(categories)
    .where(and(...(conditions as any)))
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/transactions')
}
