'use client'

import { Button } from '@/components/ui/button'
import { Minimize2 } from 'lucide-react'
import * as FlagIcons from 'country-flag-icons/react/3x2'
import { getCountryISO } from '@/lib/country-codes'

// Importar dinámicamente las banderas
const getFlagComponent = (code: string) => {
  return (FlagIcons as any)[code] || null
}

interface Team {
  id: string
  name: string
  color: string
  country?: string
}

interface ScoreboardFIFAProps {
  leaderboard: Array<{
    team: Team
    totalPoints: number
    pointsPerGame: Record<string, number>
  }>
  onClose: () => void
  gameList: Array<{ id: string; name: string }>
}

export function ScoreboardFIFA({
  leaderboard,
  onClose,
  gameList,
}: ScoreboardFIFAProps) {
  // Top 2 for head-to-head
  const topTwo = leaderboard.slice(0, 2)
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-20 w-10 h-10"
      >
        <Minimize2 className="w-5 h-5" />
      </Button>

      {/* Main Container */}
      <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center w-full">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-2 drop-shadow-lg animate-bounce-trophy">
            RANKING 2026
          </h1>
          <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full mx-auto w-1/2 md:w-1/3" style={{
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.8)'
          }} />
        </div>

        {/* FIFA-style Scoreboard Container */}
        <div className="w-full max-w-6xl flex flex-col gap-4">
          {/* Head-to-head for top 2 */}
          {topTwo.length >= 2 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-4 md:px-8 py-4 rounded-lg" style={{
                background: 'linear-gradient(90deg, rgba(20,40,80,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(20,40,80,0.8) 100%)',
                border: '3px solid rgba(255,255,255,0.2)',
              }}>
                {/* Team 1 */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {topTwo[0] && (
                      <>
                        {(() => {
                          const FlagComponent = getFlagComponent(getCountryISO(topTwo[0].team.country))
                          return FlagComponent ? <FlagComponent className="w-12 h-8 md:w-16 md:h-10 rounded border border-white" /> : null
                        })()}
                        <div>
                          <p className="text-xs text-gray-300">PAÍS</p>
                          <p className="text-lg md:text-2xl font-black text-white">
                            {topTwo[0].team.name.toUpperCase()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-300">PUNTOS</p>
                    <p className="text-3xl md:text-5xl font-black text-cyan-400 animate-bounce-score">
                      {topTwo[0]?.totalPoints}
                    </p>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="mx-4 md:mx-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
                    boxShadow: '0 0 30px rgba(0,255,0,0.6)',
                  }}>
                    <span className="text-xl md:text-3xl font-black text-black">VS</span>
                  </div>
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-300">PUNTOS</p>
                    <p className="text-3xl md:text-5xl font-black text-pink-400 animate-bounce-score">
                      {topTwo[1]?.totalPoints}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {topTwo[1] && (
                      <>
                        <div>
                          <p className="text-xs text-gray-300 text-right">PAÍS</p>
                          <p className="text-lg md:text-2xl font-black text-white text-right">
                            {topTwo[1].team.name.toUpperCase()}
                          </p>
                        </div>
                        {(() => {
                          const FlagComponent = getFlagComponent(getCountryISO(topTwo[1].team.country))
                          return FlagComponent ? <FlagComponent className="w-12 h-8 md:w-16 md:h-10 rounded border border-white" /> : null
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Ranking List */}
          <div className="space-y-2 md:space-y-3">
            <p className="text-xs md:text-sm text-gray-400 px-4 font-bold uppercase tracking-wider">Ranking Completo</p>
            {leaderboard.map((entry, idx) => (
              <div 
                key={entry.team.id}
                className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all duration-300 hover:scale-102"
                style={{
                  background: idx === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.2) 0%, rgba(0,0,0,0.3) 100%)' :
                             idx === 1 ? 'linear-gradient(90deg, rgba(192,192,192,0.2) 0%, rgba(0,0,0,0.3) 100%)' :
                             idx === 2 ? 'linear-gradient(90deg, rgba(205,127,50,0.2) 0%, rgba(0,0,0,0.3) 100%)' :
                             'linear-gradient(90deg, rgba(100,100,100,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
                style={{
                  animation: `slideInLeft 0.6s ease-out ${idx * 0.1}s both`,
                }}
              >
                {/* Rank */}
                <div className="text-2xl md:text-3xl font-black text-white w-12 text-center">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                </div>

                {/* Flag */}
                {(() => {
                  const FlagComponent = getFlagComponent(getCountryISO(entry.team.country))
                  return FlagComponent ? <FlagComponent className="w-8 h-6 md:w-10 md:h-7 rounded border border-white" /> : null
                })()}

                {/* Team Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-black text-white truncate">
                    {entry.team.name.toUpperCase()}
                  </p>
                </div>

                {/* Games */}
                <div className="hidden md:flex gap-2">
                  {gameList.slice(0, 3).map((game) => {
                    const points = entry.pointsPerGame[game.id]
                    if (!points) return null
                    return (
                      <div key={game.id} className="bg-white/10 rounded px-2 py-1 border border-white/20">
                        <p className="text-xs font-bold text-white">{points}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-xs md:text-sm text-gray-300">TOTAL</p>
                  <p className="text-2xl md:text-3xl font-black text-white animate-bounce-score">
                    {entry.totalPoints}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Indicator */}
        <div className="mt-6 md:mt-8 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)'
          }} />
          <p className="text-white text-xs md:text-sm font-bold">EN VIVO - PERMANECE 2026</p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce-trophy {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-score {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-bounce-trophy {
          animation: bounce-trophy 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .animate-bounce-score {
          animation: bounce-score 1.5s ease-in-out infinite;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}
