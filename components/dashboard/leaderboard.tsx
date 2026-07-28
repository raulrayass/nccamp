'use client'

import { Card } from '@/components/ui/card'
import { Trophy, Medal } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LeaderboardTeam {
  id: number
  name: string
  points: number
  gamesPlayed: number
  color?: string
}

interface LeaderboardProps {
  teams: LeaderboardTeam[]
  isLoading?: boolean
}

export function Leaderboard({ teams, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </Card>
    )
  }

  const sortedTeams = [...teams].sort((a, b) => b.points - a.points).slice(0, 10)
  const maxPoints = Math.max(...sortedTeams.map(t => t.points), 1)

  const chartData = sortedTeams.map((team) => ({
    name: team.name.length > 10 ? team.name.substring(0, 10) : team.name,
    points: team.points,
    fullName: team.name,
  }))

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {sortedTeams.length > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold">Podio</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {sortedTeams.slice(0, 3).map((team, idx) => {
              const medals = [null, '🥇', '🥈', '🥉']
              const heights = ['h-24', 'h-32', 'h-28']
              return (
                <div key={team.id} className="flex flex-col items-center">
                  <div className={`w-full ${heights[idx]} bg-gradient-to-t from-primary/10 to-primary/5 rounded-lg mb-2 flex flex-col items-center justify-end pb-3 border border-primary/20`}>
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{team.points}</div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-center truncate w-full">{team.name}</p>
                  <p className="text-muted-foreground text-xs">{team.gamesPlayed} juegos</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Rankings Table */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary" />
          Ranking completo
        </h3>

        <div className="space-y-2">
          {sortedTeams.map((team, idx) => {
            const percentage = (team.points / maxPoints) * 100
            return (
              <div key={team.id} className="flex items-center gap-2 sm:gap-4">
                <div className="w-6 sm:w-8 font-bold text-center text-muted-foreground">#{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium truncate">{team.name}</p>
                    <p className="text-sm font-bold text-primary">{team.points} pts</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Chart */}
      {sortedTeams.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4">Comparativa de puntos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    return (
                      <div className="bg-card border border-border rounded p-2 shadow-lg">
                        <p className="text-sm font-semibold">{payload[0].payload.fullName}</p>
                        <p className="text-sm text-primary">{payload[0].value} puntos</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="points" fill="#1db854" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
