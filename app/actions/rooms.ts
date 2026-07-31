'use server'

import { db } from '@/lib/db'
import { rooms, attendees, events } from '@/lib/db/schema'
import { eq, and, asc, count } from 'drizzle-orm'

const ROOMS_PER_PAGE = 20

// Get ALL rooms (no pagination)
export async function getAllRooms(userId: string, eventId?: number | null) {
  const conditions = [eq(rooms.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(rooms.eventId, eventId))
  }
  return db
    .select()
    .from(rooms)
    .where(and(...(conditions as any)))
    .orderBy(asc(rooms.name))
}

export async function getRooms(userId: string, eventId?: number | null, page: number = 1) {
  const offset = (page - 1) * ROOMS_PER_PAGE
  const conditions = [eq(rooms.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(rooms.eventId, eventId))
  }
  return db
    .select()
    .from(rooms)
    .where(and(...(conditions as any)))
    .orderBy(asc(rooms.name))
    .limit(ROOMS_PER_PAGE)
    .offset(offset)
}

export async function getRoomsCount(userId: string, eventId?: number | null) {
  const conditions = [eq(rooms.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(rooms.eventId, eventId))
  }
  const result = await db
    .select({ count: count() })
    .from(rooms)
    .where(and(...(conditions as any)))
  return Number(result[0]?.count ?? 0)
}

export async function createRoom(
  userId: string,
  data: { name: string; capacity?: number | null; eventId?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre de la habitación es requerido')
  }

  // CRITICAL: Validate eventId is provided and exists
  if (!data.eventId || data.eventId === null) {
    throw new Error('INVALID_EVENT: Debe seleccionar un evento para crear una habitación')
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

  const dupConditions = [eq(rooms.userId, userId), eq(rooms.name, data.name.trim()), eq(rooms.eventId, data.eventId)]
  const existing = await db
    .select()
    .from(rooms)
    .where(and(...(dupConditions as any)))
    .limit(1)
    .then(r => r[0])

  if (existing) {
    throw new Error('Esta habitación ya existe')
  }

  await db.insert(rooms).values({
    userId,
    eventId: data.eventId,
    name: data.name.trim(),
    capacity: data.capacity ?? null,
  })
}

export async function updateRoom(
  userId: string,
  roomId: number,
  data: { name: string; capacity?: number | null; eventId?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre de la habitación es requerido')
  }

  const dupConditions = [eq(rooms.userId, userId), eq(rooms.name, data.name.trim())]
  if (data.eventId !== undefined && data.eventId !== null) {
    dupConditions.push(eq(rooms.eventId, data.eventId))
  }
  const existing = await db
    .select()
    .from(rooms)
    .where(and(...(dupConditions as any)))
    .limit(1)
    .then(r => r[0])

  if (existing && existing.id !== roomId) {
    throw new Error('Esta habitación ya existe')
  }

  await db
    .update(rooms)
    .set({ name: data.name.trim(), capacity: data.capacity ?? null, updatedAt: new Date() })
    .where(and(eq(rooms.userId, userId), eq(rooms.id, roomId)))
}

export async function deleteRoom(userId: string, roomId: number, eventId?: number | null) {
  // Unassign room from any campers first
  const attendeeConditions = [eq(attendees.userId, userId), eq(attendees.roomId, roomId)]
  if (eventId !== undefined && eventId !== null) {
    attendeeConditions.push(eq(attendees.eventId, eventId))
  }
  await db
    .update(attendees)
    .set({ roomId: null })
    .where(and(...(attendeeConditions as any)))

  await db.delete(rooms).where(and(eq(rooms.userId, userId), eq(rooms.id, roomId)))
}

export async function getRoomOccupancy(userId: string, eventId?: number | null) {
  const conditions = [eq(attendees.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(attendees.eventId, eventId))
  }
  const all = await db
    .select({ roomId: attendees.roomId })
    .from(attendees)
    .where(and(...(conditions as any)))
  const counts: Record<number, number> = {}
  for (const a of all) {
    if (a.roomId) counts[a.roomId] = (counts[a.roomId] || 0) + 1
  }
  return counts
}

export async function getRoomOccupants(userId: string, roomId: number, eventId?: number | null) {
  const conditions = [eq(attendees.userId, userId), eq(attendees.roomId, roomId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(attendees.eventId, eventId))
  }
  return db
    .select()
    .from(attendees)
    .where(and(...(conditions as any)))
    .orderBy(asc(attendees.name))
}
