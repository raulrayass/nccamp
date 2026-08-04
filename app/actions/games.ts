'use server'

import { db } from '@/lib/db'
import { games, gameScores, teams, events } from '@/lib/db/schema'
import { eq, and, asc, desc, count } from 'drizzle-orm'

const GAMES_PER_PAGE = 15

// Get ALL games for leaderboard and calculations (no pagination)
export async function getAllGames(userId: string, eventId?: number | null) {
  const conditions = [eq(games.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(games.eventId, eventId))
  }
  return db
    .select()
    .from(games)
    .where(and(...(conditions as any)))
    .orderBy(desc(games.createdAt))
}

export async function getGames(userId: string, page: number = 1, eventId?: number | null) {
  const offset = (page - 1) * GAMES_PER_PAGE
  const conditions = [eq(games.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(games.eventId, eventId))
  }
  return db
    .select()
    .from(games)
    .where(and(...(conditions as any)))
    .orderBy(desc(games.createdAt))
    .limit(GAMES_PER_PAGE)
    .offset(offset)
}

export async function getGamesCount(userId: string, eventId?: number | null) {
  const conditions = [eq(games.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(games.eventId, eventId))
  }
  const result = await db
    .select({ count: count() })
    .from(games)
    .where(and(...(conditions as any)))
  return Number(result[0]?.count ?? 0)
}

export async function createGame(
  userId: string,
  data: { name: string; description?: string; gameDate?: string | null; eventId?: number | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del juego es requerido')
  }

  // CRITICAL: Validate eventId is provided and exists
  if (!data.eventId || data.eventId === null) {
    throw new Error('INVALID_EVENT: Debe seleccionar un evento para crear un juego')
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

  const [created] = await db
    .insert(games)
    .values({
      userId,
      eventId: data.eventId,
      name: data.name.trim(),
      description: data.description || '',
      gameDate: data.gameDate || null,
    })
    .returning()
  return created
}

export async function updateGame(
  userId: string,
  gameId: number,
  data: { name: string; description?: string; gameDate?: string | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del juego es requerido')
  }
  await db
    .update(games)
    .set({
      name: data.name.trim(),
      description: data.description || '',
      gameDate: data.gameDate || null,
      updatedAt: new Date(),
    })
    .where(and(eq(games.userId, userId), eq(games.id, gameId)))
}

export async function deleteGame(userId: string, gameId: number) {
  await db.delete(gameScores).where(and(eq(gameScores.userId, userId), eq(gameScores.gameId, gameId)))
  await db.delete(games).where(and(eq(games.userId, userId), eq(games.id, gameId)))
}

export async function getAllGameScores(userId: string, eventId?: number | null) {
  const conditions = [eq(gameScores.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(gameScores.eventId, eventId))
  }
  return db
    .select()
    .from(gameScores)
    .where(and(...(conditions as any)))
}

export async function getGameScores(userId: string, gameId: number, eventId?: number | null) {
  const conditions = [eq(gameScores.userId, userId), eq(gameScores.gameId, gameId)]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(gameScores.eventId, eventId))
  }
  return db
    .select()
    .from(gameScores)
    .where(and(...(conditions as any)))
}

// Add points for a team in a specific game (accumulative)
export async function addGameScore(
  userId: string,
  gameId: number,
  teamId: number,
  points: number,
  eventId?: number | null
) {
  if (points === 0) return
  await db.insert(gameScores).values({
    userId,
    eventId: eventId ?? null,
    gameId,
    teamId,
    points,
  })
}

// Set (upsert) the points a team earned in a specific game
export async function setGameScore(
  userId: string,
  gameId: number,
  teamId: number,
  points: number,
  eventId?: number | null
) {
  const conditions = [
    eq(gameScores.userId, userId),
    eq(gameScores.gameId, gameId),
    eq(gameScores.teamId, teamId),
  ]
  if (eventId !== undefined && eventId !== null) {
    conditions.push(eq(gameScores.eventId, eventId))
  }
  const existing = await db
    .select()
    .from(gameScores)
    .where(and(...(conditions as any)))
    .limit(1)
    .then((r) => r[0])

  if (existing) {
    await db
      .update(gameScores)
      .set({ points })
      .where(eq(gameScores.id, existing.id))
  } else {
    await db.insert(gameScores).values({ userId, eventId: eventId ?? null, gameId, teamId, points })
  }
}

export async function deleteGameScore(userId: string, scoreId: number) {
  await db
    .delete(gameScores)
    .where(and(eq(gameScores.userId, userId), eq(gameScores.id, scoreId)))
}

// Leaderboard: total points per team across all games
export async function getRankingTimeline(userId: string, eventId?: number | null) {
  const gameConditions = [eq(games.userId, userId)]
  const scoreConditions = [eq(gameScores.userId, userId)]
  const teamConditions = [eq(teams.userId, userId)]

  if (eventId !== undefined && eventId !== null) {
    gameConditions.push(eq(games.eventId, eventId))
    scoreConditions.push(eq(gameScores.eventId, eventId))
    teamConditions.push(eq(teams.eventId, eventId))
  }

  const [allGames, allScores, allTeams] = await Promise.all([
    db.select().from(games).where(and(...(gameConditions as any))),
    db.select().from(gameScores).where(and(...(scoreConditions as any))),
    db.select().from(teams).where(and(...(teamConditions as any))),
  ])

  const gameDates = new Map(allGames.map((game) => [game.id, game.gameDate]))
  const teamNames = new Map(allTeams.map((team) => [team.id, team.name]))
  const teamColors = new Map(allTeams.map((team) => [team.id, team.color]))
  const scoresByDate = new Map<string, Map<number, number>>()

  for (const score of allScores) {
    const date = gameDates.get(score.gameId)
    if (!date) continue
    if (!scoresByDate.has(date)) scoresByDate.set(date, new Map())
    const dateScores = scoresByDate.get(date)!
    dateScores.set(score.teamId, (dateScores.get(score.teamId) || 0) + score.points)
  }

  const totals = new Map<number, number>()
  return Array.from(scoresByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dateScores]) => {
      for (const [teamId, points] of dateScores) {
        totals.set(teamId, (totals.get(teamId) || 0) + points)
      }
      const orderedTeams = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
      const row: Record<string, string | number> = { date }
      for (const [teamId, points] of orderedTeams) {
        row[`team_${teamId}`] = points
      }
      return {
        date,
        teams: orderedTeams.map(([teamId, points]) => ({
          id: teamId,
          name: teamNames.get(teamId) || 'Equipo',
          color: teamColors.get(teamId) || '#4a9d67',
          points,
        })),
        values: row,
      }
    })
}

export async function getLeaderboard(userId: string, eventId?: number | null) {
  const teamConditions = [eq(teams.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    teamConditions.push(eq(teams.eventId, eventId))
  }
  const allTeams = await db
    .select()
    .from(teams)
    .where(and(...(teamConditions as any)))
    .orderBy(asc(teams.name))

  const scoreConditions = [eq(gameScores.userId, userId)]
  if (eventId !== undefined && eventId !== null) {
    scoreConditions.push(eq(gameScores.eventId, eventId))
  }
  const allScores = await db
    .select()
    .from(gameScores)
    .where(and(...(scoreConditions as any)))

  const totals: Record<number, number> = {}
  for (const s of allScores) {
    totals[s.teamId] = (totals[s.teamId] || 0) + s.points
  }

  return allTeams
    .map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      totalPoints: totals[t.id] || 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
}
