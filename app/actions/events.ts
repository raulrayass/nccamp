'use server'

import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'

// Tipos para events y event_members (nota: estas tablas se crearán con migraciones posteriores)
interface Event {
  id: number
  userId: string
  name: string
  createdAt: Date
}

interface EventMember {
  id: number
  eventId: number
  userId: string
  role: string
  createdAt: Date
}

// Obtener o crear el evento por defecto para el usuario
// En Fase A, este es el único evento. En Fase B+, los módulos usarán este eventId
export async function getOrCreateDefaultEvent(userId: string): Promise<Event> {
  try {
    // NOTA: Cuando se creen las tablas events y event_members en migraciones,
    // descomentar estas líneas:
    // 
    // const existing = await db.query.events.findFirst({
    //   where: (e) => eq(e.userId, userId),
    // })
    // if (existing) return existing
    //
    // const [newEvent] = await db
    //   .insert(events)
    //   .values({
    //     userId,
    //     name: 'Evento por defecto',
    //   })
    //   .returning()
    // return newEvent

    // Por ahora, placeholder (esto fallará hasta que se creen las tablas)
    console.log('[v0] getOrCreateDefaultEvent called for userId:', userId)
    throw new Error('Tabla events no existe. Ejecuta migraciones.')
  } catch (error) {
    console.error('[v0] Error in getOrCreateDefaultEvent:', error)
    throw error
  }
}

// Obtener todos los eventos del usuario
export async function getUserEvents(userId: string): Promise<Event[]> {
  try {
    // NOTA: Descomentar cuando se creen las tablas
    // return await db.query.events.findMany({
    //   where: (e) => eq(e.userId, userId),
    //   orderBy: (e) => desc(e.createdAt),
    // })
    return []
  } catch (error) {
    console.error('[v0] Error fetching events:', error)
    throw error
  }
}

// Crear un nuevo evento
export async function createEvent(userId: string, name: string): Promise<Event> {
  try {
    // NOTA: Descomentar cuando se creen las tablas
    // const [event] = await db
    //   .insert(events)
    //   .values({
    //     userId,
    //     name,
    //   })
    //   .returning()
    // return event
    throw new Error('Tabla events no existe')
  } catch (error) {
    console.error('[v0] Error creating event:', error)
    throw error
  }
}
