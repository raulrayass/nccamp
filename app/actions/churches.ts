'use server'

import { db } from '@/lib/db'
import { churches } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

const CHURCHES_PER_PAGE = 25

// Get ALL churches (no pagination)
export async function getAllChurches(userId: string) {
  return db
    .select()
    .from(churches)
    .where(eq(churches.userId, userId))
    .orderBy(asc(churches.name))
}

export async function getChurches(userId: string, page: number = 1) {
  const offset = (page - 1) * CHURCHES_PER_PAGE
  return db
    .select()
    .from(churches)
    .where(eq(churches.userId, userId))
    .orderBy(asc(churches.name))
    .limit(CHURCHES_PER_PAGE)
    .offset(offset)
}

export async function getChurchesCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(churches)
    .where(eq(churches.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function createChurch(userId: string, name: string) {
  if (!name.trim()) {
    throw new Error('El nombre de la iglesia es requerido')
  }

  // Check if church already exists
  const existing = await db.query.churches.findFirst({
    where: and(eq(churches.userId, userId), eq(churches.name, name.trim())),
  })

  if (existing) {
    throw new Error('Esta iglesia ya existe')
  }

  await db.insert(churches).values({
    userId,
    name: name.trim(),
  })
}

export async function updateChurch(userId: string, churchId: number, name: string) {
  if (!name.trim()) {
    throw new Error('El nombre de la iglesia es requerido')
  }

  // Check if new name already exists (but allow same name)
  const existing = await db.query.churches.findFirst({
    where: and(eq(churches.userId, userId), eq(churches.name, name.trim())),
  })

  if (existing && existing.id !== churchId) {
    throw new Error('Esta iglesia ya existe')
  }

  await db
    .update(churches)
    .set({
      name: name.trim(),
      updatedAt: new Date(),
    })
    .where(and(eq(churches.userId, userId), eq(churches.id, churchId)))
}

export async function deleteChurch(userId: string, churchId: number) {
  await db.delete(churches).where(and(eq(churches.userId, userId), eq(churches.id, churchId)))
}
