'use server'

import { db } from '@/lib/db'
import { churches, events } from '@/lib/db/schema'
import { eq, and, asc, count } from 'drizzle-orm'

const CHURCHES_PER_PAGE = 25

// Get ALL churches (no pagination)
export async function getAllChurches(userId: string, eventId?: number | null) {
  const conditions = [eq(churches.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(churches.eventId, eventId))
  }
  return db
    .select()
    .from(churches)
    .where(and(...(conditions as any)))
    .orderBy(asc(churches.name))
}

export async function getChurches(userId: string, eventId?: number | null, page: number = 1) {
  const offset = (page - 1) * CHURCHES_PER_PAGE
  const conditions = [eq(churches.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(churches.eventId, eventId))
  }
  return db
    .select()
    .from(churches)
    .where(and(...(conditions as any)))
    .orderBy(asc(churches.name))
    .limit(CHURCHES_PER_PAGE)
    .offset(offset)
}

export async function getChurchesCount(userId: string, eventId?: number | null) {
  const conditions = [eq(churches.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(churches.eventId, eventId))
  }
  const result = await db
    .select({ count: count() })
    .from(churches)
    .where(and(...(conditions as any)))
  return Number(result[0]?.count ?? 0)
}

export async function createChurch(userId: string, name: string, eventId?: number | null) {
  if (!name.trim()) {
    throw new Error('El nombre de la iglesia es requerido')
  }

  // CRITICAL: Validate eventId is provided and exists
  if (!eventId || eventId === null) {
    throw new Error('INVALID_EVENT: Debe seleccionar un evento para crear una iglesia')
  }

  // Verify event exists and belongs to user
  const eventExists = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.adminId, userId)))
    .limit(1)
    .then(r => r.length > 0)

  if (!eventExists) {
    throw new Error('INVALID_EVENT: El evento no existe o no tienes permisos para acceder')
  }

  // Check if church already exists
  const existing = await db
    .select()
    .from(churches)
    .where(and(eq(churches.userId, userId), eq(churches.name, name.trim()), eq(churches.eventId, eventId)))
    .limit(1)
    .then(r => r[0])

  if (existing) {
    throw new Error('Esta iglesia ya existe')
  }

  await db.insert(churches).values({
    userId,
    eventId,
    name: name.trim(),
  })
}

export async function updateChurch(userId: string, churchId: number, name: string, eventId?: number | null) {
  if (!name.trim()) {
    throw new Error('El nombre de la iglesia es requerido')
  }

  // Check if new name already exists (but allow same name)
  const dupConditions = [eq(churches.userId, userId), eq(churches.name, name.trim())]
  if (eventId !== undefined && eventId !== null) {
    dupConditions.push(eq(churches.eventId, eventId))
  }
  const existing = await db
    .select()
    .from(churches)
    .where(and(...(dupConditions as any)))
    .limit(1)
    .then(r => r[0])

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

export async function deleteChurch(userId: string, churchId: number, eventId?: number | null) {
  const conditions = [eq(churches.userId, userId), eq(churches.id, churchId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(churches.eventId, eventId))
  }
  await db.delete(churches).where(and(...(conditions as any)))
}
