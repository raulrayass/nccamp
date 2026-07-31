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
        country: 'México',
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

// Actualizar evento
export async function updateEvent(
  userId: string,
  eventId: number,
  data: {
    name?: string
    country?: string
    startDate?: string
    endDate?: string
  }
): Promise<void> {
  try {
    // Verificar que el usuario es admin del evento
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!event || event.length === 0) {
      throw new Error('EVENT_NOT_FOUND')
    }

    if (event[0].adminId !== userId) {
      throw new Error('UNAUTHORIZED: Solo el admin del evento puede actualizarlo')
    }

    // Validar fechas si se proporcionan
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      if (start >= end) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
      }
    }

    // Actualizar evento
    await db
      .update(events)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.country && { country: data.country }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
  } catch (error) {
    console.error('[v0] Error updating event:', error)
    throw new Error('UPDATE_EVENT: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// Eliminar evento (con validaciones)
export async function deleteEvent(userId: string, eventId: number): Promise<void> {
  try {
    // Verificar que el usuario es admin del evento
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (!event || event.length === 0) {
      throw new Error('EVENT_NOT_FOUND')
    }

    if (event[0].adminId !== userId) {
      throw new Error('UNAUTHORIZED: Solo el admin del evento puede eliminarlo')
    }

    // Eliminar todas las referencias del evento (en cascada)
    // Primero, obtener todos los IDs de entidades relacionadas para borrar en orden correcto
    
    // Eliminar transacciones
    const transactions = await db.query.transactions.findMany({
      where: (t) => eq(t.eventId, eventId),
      columns: { id: true },
    })
    if (transactions.length > 0) {
      const transactionIds = transactions.map(t => t.id)
      await db.delete(db.query.transactions).where((t) => inArray(t.id, transactionIds))
    }

    // Eliminar game scores
    const gameScores = await db.query.gameScores.findMany({
      where: (g) => eq(g.eventId, eventId),
      columns: { id: true },
    })
    if (gameScores.length > 0) {
      const gameScoreIds = gameScores.map(g => g.id)
      await db.delete(db.query.gameScores).where((g) => inArray(g.id, gameScoreIds))
    }

    // Eliminar games
    const games = await db.query.games.findMany({
      where: (g) => eq(g.eventId, eventId),
      columns: { id: true },
    })
    if (games.length > 0) {
      const gameIds = games.map(g => g.id)
      await db.delete(db.query.games).where((g) => inArray(g.id, gameIds))
    }

    // Eliminar equipos
    const teams = await db.query.teams.findMany({
      where: (t) => eq(t.eventId, eventId),
      columns: { id: true },
    })
    if (teams.length > 0) {
      const teamIds = teams.map(t => t.id)
      await db.delete(db.query.teams).where((t) => inArray(t.id, teamIds))
    }

    // Eliminar habitaciones
    const rooms = await db.query.rooms.findMany({
      where: (r) => eq(r.eventId, eventId),
      columns: { id: true },
    })
    if (rooms.length > 0) {
      const roomIds = rooms.map(r => r.id)
      await db.delete(db.query.rooms).where((r) => inArray(r.id, roomIds))
    }

    // Eliminar pagos de asistentes
    const attendeePayments = await db.query.attendeePayments.findMany({
      where: (a) => eq(a.eventId, eventId),
      columns: { id: true },
    })
    if (attendeePayments.length > 0) {
      const paymentIds = attendeePayments.map(p => p.id)
      await db.delete(db.query.attendeePayments).where((a) => inArray(a.id, paymentIds))
    }

    // Eliminar asistentes
    const attendees = await db.query.attendees.findMany({
      where: (a) => eq(a.eventId, eventId),
      columns: { id: true },
    })
    if (attendees.length > 0) {
      const attendeeIds = attendees.map(a => a.id)
      await db.delete(db.query.attendees).where((a) => inArray(a.id, attendeeIds))
    }

    // Eliminar pagos de staff
    const staffPayments = await db.query.staffPayments.findMany({
      where: (s) => eq(s.eventId, eventId),
      columns: { id: true },
    })
    if (staffPayments.length > 0) {
      const paymentIds = staffPayments.map(p => p.id)
      await db.delete(db.query.staffPayments).where((s) => inArray(s.id, paymentIds))
    }

    // Eliminar staff
    const staffRecords = await db.query.staff.findMany({
      where: (s) => eq(s.eventId, eventId),
      columns: { id: true },
    })
    if (staffRecords.length > 0) {
      const staffIds = staffRecords.map(s => s.id)
      await db.delete(db.query.staff).where((s) => inArray(s.id, staffIds))
    }

    // Eliminar miembros del evento
    await db.delete(eventMembers).where(eq(eventMembers.eventId, eventId))

    // Finalmente, eliminar el evento
    await db.delete(events).where(eq(events.id, eventId))
  } catch (error) {
    console.error('[v0] Error deleting event:', error)
    throw new Error('DELETE_EVENT: ' + (error instanceof Error ? error.message : String(error)))
  }
}
