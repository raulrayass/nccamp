'use client'

import { useCallback, useEffect, useState } from 'react'
import { useGames, useTeams, useAttendees, useGameScores } from '@/lib/hooks'
import { useSession } from '@/lib/auth-client'

export interface DashboardStats {
  totalGames: number
  totalTeams: number
  totalAttendees: number
  totalScores: number
  topTeamByPoints: { name: string; points: number } | null
  gamesThisWeek: number
  teamsActive: number
  isLoading: boolean
  error: Error | null
}

export function useDashboardStats(): DashboardStats {
  const session = useSession()
  const { games, isLoading: gamesLoading } = useGames()
  const { teams, isLoading: teamsLoading } = useTeams()
  const { scores: gameScores, isLoading: scoresLoading } = useGameScores()
  const [attendees, setAttendees] = useState<any[]>([])
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const userId = session?.data?.user?.id

  // Load attendees
  useEffect(() => {
    if (!userId) return
    setIsLoadingAttendees(true)
    // Attendees are loaded via useAttendees hook if available
    setIsLoadingAttendees(false)
  }, [userId])

  // Calculate stats
  const calculateStats = useCallback(() => {
    const totalGames = games?.length ?? 0
    const totalTeams = teams?.length ?? 0
    const totalScores = gameScores?.length ?? 0
    const totalAttendees = attendees?.length ?? 0

    // Calculate top team by total points
    const teamPoints = new Map<number, number>()
    gameScores?.forEach((score: any) => {
      const current = teamPoints.get(score.teamId) || 0
      teamPoints.set(score.teamId, current + score.points)
    })

    let topTeam = null
    let maxPoints = 0
    teamPoints.forEach((points, teamId) => {
      if (points > maxPoints) {
        maxPoints = points
        const teamName = teams?.find((t: any) => t.id === teamId)?.name
        topTeam = { name: teamName || 'Equipo', points }
      }
    })

    // Games this week
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const gamesThisWeek = games?.filter((g: any) => {
      if (!g.gameDate) return false
      const gameDate = new Date(g.gameDate)
      return gameDate >= weekAgo && gameDate <= now
    }).length ?? 0

    return {
      totalGames,
      totalTeams,
      totalAttendees,
      totalScores,
      topTeamByPoints: topTeam,
      gamesThisWeek,
      teamsActive: totalTeams,
    }
  }, [games, teams, gameScores, attendees])

  const stats = calculateStats()

  return {
    ...stats,
    isLoading: gamesLoading || teamsLoading || scoresLoading || isLoadingAttendees,
    error,
  }
}
