'use server'

import { db } from '@/lib/db'
import { events, eventMembers, Event } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// Obtener o crear el evento por defecto para el usuario
// En Fase A, este es el único evento. En Fase B+, los módulos usarán este eventId
export async function getOrCreateDefaultEvent(userId: string): Promise<Event> {
  try {
    // Buscar evento por defecto existente
    const existing = await db
      .select()
      .from(events)
      .where(and(eq(events.userId, userId), eq(events.isDefault, true)))
      .limit(1)

    if (existing.length > 0) {
      return existing[0]
    }

    // Crear nuevo evento por defecto si no existe
    const [newEvent] = await db
      .insert(events)
      .values({
        userId,
        name: 'Evento Campestre',
        isDefault: true,
      })
      .returning()

    return newEvent
  } catch (error) {
    console.error('[v0] Error in getOrCreateDefaultEvent:', error)
    throw error
  }
}

// Obtener todos los eventos del usuario
export async function getUserEvents(userId: string): Promise<Event[]> {
  try {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.createdAt))
  } catch (error) {
    console.error('[v0] Error fetching events:', error)
    throw error
  }
}

// Crear un nuevo evento
export async function createEvent(userId: string, name: string, description?: string): Promise<Event> {
  try {
    const [event] = await db
      .insert(events)
      .values({
        userId,
        name,
        description: description || null,
        isDefault: false,
      })
      .returning()

    return event
  } catch (error) {
    console.error('[v0] Error creating event:', error)
    throw error
  }
}
