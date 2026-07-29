'use server'

import { db } from '@/lib/db'
import { events, eventMembers, Event } from '@/lib/db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'

// Obtener o crear el evento por defecto para el usuario
// En Fase A, este es el único evento. En Fase B+, los módulos usarán este eventId
export async function getOrCreateDefaultEvent(userId: string): Promise<{ id: number; name: string }> {
  try {
    // Buscar evento existente del usuario (adminId)
    const existing = await db
      .select({ id: events.id, name: events.name })
      .from(events)
      .where(eq(events.adminId, userId))
      .orderBy(desc(events.createdAt))
      .limit(1)

    if (existing.length > 0) {
      return existing[0]
    }

    // Crear nuevo evento por defecto si no existe
    const [newEvent] = await db
      .insert(events)
      .values({
        adminId: userId,
        name: 'Evento Campestre',
        country: 'Colombia',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
      })
      .returning()

    // Insertar al usuario como admin en event_members
    await db.insert(eventMembers).values({
      eventId: newEvent.id,
      userId,
      role: 'admin',
    })

    return { id: newEvent.id, name: newEvent.name }
  } catch (error) {
    console.error('[v0] Error in getOrCreateDefaultEvent:', error)
    throw new Error('DEFAULT_EVENT_REAL: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// Obtener todos los eventos del usuario (como admin o como miembro) - solo id y name
export async function getUserEvents(userId: string): Promise<{ id: number; name: string }[]> {
  const adminEvents = await db
    .select({ id: events.id, name: events.name })
    .from(events)
    .where(eq(events.adminId, userId))
    .orderBy(desc(events.createdAt))
  const memberRows = await db
    .select({ eventId: eventMembers.eventId })
    .from(eventMembers)
    .where(eq(eventMembers.userId, userId))
  const memberEventIds = memberRows.map(r => r.eventId)
  const memberEvents = memberEventIds.length
    ? await db.select({ id: events.id, name: events.name })
        .from(events).where(inArray(events.id, memberEventIds))
        .orderBy(desc(events.createdAt))
    : []
  const all = [...adminEvents, ...memberEvents]
  return Array.from(new Map(all.map(e => [e.id, e])).values())
}

// Crear un nuevo evento
export async function createEvent(
  userId: string,
  name: string,
  country: string,
  startDate: string,
  endDate: string
): Promise<{ id: number; name: string }> {
  try {
    const [event] = await db
      .insert(events)
      .values({
        adminId: userId,
        name,
        country,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active',
      })
      .returning()

    // Insertar al usuario como admin en event_members (y marcar como default si es el primero)
    const existingCount = await db
      .select({ id: eventMembers.id })
      .from(eventMembers)
      .where(eq(eventMembers.userId, userId))

    await db.insert(eventMembers).values({
      eventId: event.id,
      userId,
      role: 'admin',
      isDefault: existingCount.length === 0, // Si es el primer evento, marcarlo como default
    })

    return { id: event.id, name: event.name }
  } catch (error) {
    console.error('[v0] Error creating event:', error)
    throw new Error('CREATE_EVENT_REAL: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// Obtener evento predeterminado del usuario
export async function getDefaultEvent(userId: string): Promise<{ id: number; name: string } | null> {
  try {
    const result = await db
      .select({ id: events.id, name: events.name })
      .from(eventMembers)
      .leftJoin(events, eq(eventMembers.eventId, events.id))
      .where(and(eq(eventMembers.userId, userId), eq(eventMembers.isDefault, true)))
      .limit(1)

    if (result.length === 0) return null
    return result[0]
  } catch (error) {
    console.error('Error getting default event:', error)
    return null
  }
}

// Establecer evento como predeterminado
export async function setDefaultEvent(userId: string, eventId: number): Promise<void> {
  try {
    // Remover default de todos los eventos del usuario
    await db
      .update(eventMembers)
      .set({ isDefault: false })
      .where(eq(eventMembers.userId, userId))

    // Establecer el nuevo default
    await db
      .update(eventMembers)
      .set({ isDefault: true })
      .where(and(eq(eventMembers.userId, userId), eq(eventMembers.eventId, eventId)))
  } catch (error) {
    console.error('[v0] Error setting default event:', error)
    throw new Error('SET_DEFAULT_EVENT: ' + (error instanceof Error ? error.message : String(error)))
  }
}
