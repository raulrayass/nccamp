'use server'

import { db } from '@/lib/db'
import { games, gameScores, teams } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

const GAMES_PER_PAGE = 15

// Get ALL games for leaderboard and calculations (no pagination)
export async function getAllGames(userId: string) {
  return await db.query.games.findMany({
    where: eq(games.userId, userId),
    orderBy: (games, { desc }) => [desc(games.createdAt)],
  })
}

export async function getGames(userId: string, page: number = 1) {
  const offset = (page - 1) * GAMES_PER_PAGE
  return await db.query.games.findMany({
    where: eq(games.userId, userId),
    orderBy: (games, { desc }) => [desc(games.createdAt)],
    limit: GAMES_PER_PAGE,
    offset: offset,
  })
}

export async function getGamesCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(games)
    .where(eq(games.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function createGame(
  userId: string,
  data: { name: string; description?: string; gameDate?: string | null }
) {
  if (!data.name.trim()) {
    throw new Error('El nombre del juego es requerido')
  }
  const [created] = await db
    .insert(games)
    .values({
      userId,
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

export async function getAllGameScores(userId: string) {
  return db
    .select()
    .from(gameScores)
    .where(eq(gameScores.userId, userId))
}

export async function getGameScores(userId: string, gameId: number) {
  return db
    .select()
    .from(gameScores)
    .where(and(eq(gameScores.userId, userId), eq(gameScores.gameId, gameId)))
}

// Add points for a team in a specific game (accumulative)
export async function addGameScore(userId: string, gameId: number, teamId: number, points: number) {
  if (points === 0) return
  await db.insert(gameScores).values({
    userId,
    gameId,
    teamId,
    points,
  })
}

// Set (upsert) the points a team earned in a specific game
export async function setGameScore(userId: string, gameId: number, teamId: number, points: number) {
  const existing = await db.query.gameScores.findFirst({
    where: and(
      eq(gameScores.userId, userId),
      eq(gameScores.gameId, gameId),
      eq(gameScores.teamId, teamId)
    ),
  })

  if (existing) {
    await db
      .update(gameScores)
      .set({ points })
      .where(eq(gameScores.id, existing.id))
  } else {
    await db.insert(gameScores).values({ userId, gameId, teamId, points })
  }
}

export async function deleteGameScore(userId: string, scoreId: number) {
  await db
    .delete(gameScores)
    .where(and(eq(gameScores.userId, userId), eq(gameScores.id, scoreId)))
}

// Leaderboard: total points per team across all games
export async function getLeaderboard(userId: string) {
  const allTeams = await db.query.teams.findMany({
    where: eq(teams.userId, userId),
    orderBy: (teams, { asc }) => [asc(teams.name)],
  })
  const allScores = await db.query.gameScores.findMany({
    where: eq(gameScores.userId, userId),
  })

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
