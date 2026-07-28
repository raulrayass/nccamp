'use server'

import { db } from '@/lib/db'
import { rooms, attendees } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

const ROOMS_PER_PAGE = 20

// Get ALL rooms (no pagination)
export async function getAllRooms(userId: string) {
  return db
    .select()
    .from(rooms)
    .where(eq(rooms.userId, userId))
    .orderBy(asc(rooms.name))
}

export async function getRooms(userId: string, page: number = 1) {
  const offset = (page - 1) * ROOMS_PER_PAGE
  return db
    .select()
    .from(rooms)
    .where(eq(rooms.userId, userId))
    .orderBy(asc(rooms.name))
    .limit(ROOMS_PER_PAGE)
    .offset(offset)
}

export async function getRoomsCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(rooms)
    .where(eq(rooms.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function createRoom(
  userId: string,
  data: { name: string; capacity?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre de la habitación es requerido')
  }

  const existing = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.userId, userId), eq(rooms.name, data.name.trim())))
    .limit(1)
    .then(r => r[0])

  if (existing) {
    throw new Error('Esta habitación ya existe')
  }

  await db.insert(rooms).values({
    userId,
    name: data.name.trim(),
    capacity: data.capacity ?? null,
  })
}

export async function updateRoom(
  userId: string,
  roomId: number,
  data: { name: string; capacity?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre de la habitación es requerido')
  }

  const existing = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.userId, userId), eq(rooms.name, data.name.trim())))
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

export async function deleteRoom(userId: string, roomId: number) {
  // Unassign room from any campers first
  await db
    .update(attendees)
    .set({ roomId: null })
    .where(and(eq(attendees.userId, userId), eq(attendees.roomId, roomId)))

  await db.delete(rooms).where(and(eq(rooms.userId, userId), eq(rooms.id, roomId)))
}

export async function getRoomOccupancy(userId: string) {
  const all = await db
    .select({ roomId: attendees.roomId })
    .from(attendees)
    .where(eq(attendees.userId, userId))
  const counts: Record<number, number> = {}
  for (const a of all) {
    if (a.roomId) counts[a.roomId] = (counts[a.roomId] || 0) + 1
  }
  return counts
}

export async function getRoomOccupants(userId: string, roomId: number) {
  return db
    .select()
    .from(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.roomId, roomId)))
    .orderBy(asc(attendees.name))
}
