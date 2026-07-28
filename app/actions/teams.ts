'use server'

import { db } from '@/lib/db'
import { teams, attendees } from '@/lib/db/schema'
import { eq, and, asc, desc, count } from 'drizzle-orm'

const TEAMS_PER_PAGE = 20

// Get ALL teams (no pagination)
export async function getAllTeams(userId: string, eventId?: number | null) {
  const conditions = [eq(teams.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(teams.eventId, eventId))
  }
  return db
    .select()
    .from(teams)
    .where(and(...(conditions as any)))
    .orderBy(asc(teams.name))
}

export async function getTeams(userId: string, page: number = 1, eventId?: number | null) {
  const offset = (page - 1) * TEAMS_PER_PAGE
  const conditions = [eq(teams.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(teams.eventId, eventId))
  }
  return db
    .select()
    .from(teams)
    .where(and(...(conditions as any)))
    .orderBy(asc(teams.name))
    .limit(TEAMS_PER_PAGE)
    .offset(offset)
}

export async function getTeamsCount(userId: string, eventId?: number | null) {
  const conditions = [eq(teams.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(teams.eventId, eventId))
  }
  const result = await db
    .select({ count: count() })
    .from(teams)
    .where(and(...(conditions as any)))
  return Number(result[0]?.count ?? 0)
}

export async function createTeam(
  userId: string,
  data: { name: string; color?: string; country?: string | null; useCountry?: boolean; eventId?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  const dupConditions = [eq(teams.userId, userId), eq(teams.name, data.name.trim())]
  if (data.eventId !== undefined && data.eventId !== null) {
    dupConditions.push(eq(teams.eventId, data.eventId))
  }
  const existing = await db
    .select()
    .from(teams)
    .where(and(...(dupConditions as any)))
    .limit(1)
    .then(r => r[0])

  if (existing) {
    throw new Error('Este equipo ya existe')
  }

  await db.insert(teams).values({
    userId,
    eventId: data.eventId ?? null,
    name: data.name.trim(),
    color: data.color || '#4a9d67',
    country: data.useCountry ? data.country || null : null,
  })
}

export async function updateTeam(
  userId: string,
  teamId: number,
  data: { name: string; color?: string; country?: string | null; useCountry?: boolean; eventId?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del equipo es requerido')
  }

  const dupConditions = [eq(teams.userId, userId), eq(teams.name, data.name.trim())]
  if (data.eventId !== undefined && data.eventId !== null) {
    dupConditions.push(eq(teams.eventId, data.eventId))
  }
  const existing = await db
    .select()
    .from(teams)
    .where(and(...(dupConditions as any)))
    .limit(1)
    .then(r => r[0])

  if (existing && existing.id !== teamId) {
    throw new Error('Este equipo ya existe')
  }

  await db
    .update(teams)
    .set({
      name: data.name.trim(),
      color: data.color || '#4a9d67',
      country: data.useCountry ? data.country || null : null,
      updatedAt: new Date(),
    })
    .where(and(eq(teams.userId, userId), eq(teams.id, teamId)))
}

export async function deleteTeam(userId: string, teamId: number) {
  // Unassign team from any campers first
  await db
    .update(attendees)
    .set({ teamId: null })
    .where(and(eq(attendees.userId, userId), eq(attendees.teamId, teamId)))

  await db.delete(teams).where(and(eq(teams.userId, userId), eq(teams.id, teamId)))
}

export async function getTeamMemberCounts(userId: string, eventId?: number | null) {
  const conditions = [eq(attendees.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(attendees.eventId, eventId))
  }
  const all = await db
    .select({ teamId: attendees.teamId })
    .from(attendees)
    .where(and(...(conditions as any)))
  const counts: Record<number, number> = {}
  for (const a of all) {
    if (a.teamId) counts[a.teamId] = (counts[a.teamId] || 0) + 1
  }
  return counts
}

export async function getTeamMembers(userId: string, teamId: number, eventId?: number | null) {
  const conditions = [eq(attendees.userId, userId), eq(attendees.teamId, teamId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(attendees.eventId, eventId))
  }
  return db
    .select()
    .from(attendees)
    .where(and(...(conditions as any)))
    .orderBy(asc(attendees.name))
}
