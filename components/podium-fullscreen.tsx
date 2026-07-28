'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Minimize2 } from 'lucide-react'

interface Team {
  id: number
  name: string
  color: string
  country?: string | null
}

interface PodiumProps {
  leaderboard: Array<{
    team: Team
    totalPoints: number
    pointsPerGame: Record<number, number>
  }>
  onClose: () => void
  gameList: Array<{ id: number; name: string }>
}

function useCountUp(target: number, duration = 1400, delay = 0) {
  const [val, setVal] = useState(0)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    let start: number | null = null
    let timeout: any
    function step(ts: number) {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / duration)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.round(target * eased))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    timeout = setTimeout(() => { raf.current = requestAnimationFrame(step) }, delay)
    return () => { clearTimeout(timeout); if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration, delay])
  return val
}

export function PodiumFullscreen({ leaderboard, onClose, gameList }: PodiumProps) {
  const top3 = leaderboard.slice(0, 3)
  const order = [top3[1], top3[0], top3[2]]
  const medals = ['🥈', '🥇', '🥉']
  const ranks = ['2º', '1º', '3º']
  const heights = ['h-44 md:h-64', 'h-60 md:h-96', 'h-36 md:h-52']
  const delays = [0.5, 0.15, 0.85] // el 1º entra primero, luego 2º y 3º
  const gameName = (id: number) => gameList.find((g) => g.id === id)?.name ?? ''

  const [confetti, setConfetti] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setConfetti(true), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pitch-bg">
      {/* Reflectores */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="beam beam-1" />
        <div className="beam beam-2" />
        <div className="absolute -top-24 left-1/3 w-[600px] h-[600px] bg-yellow-300/14 rounded-full blur-3xl animate-glow" />
        <div className="absolute -top-24 right-1/3 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 vignette" />
      </div>

      {/* Confeti */}
      {confetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                background: ['#fde047', '#f97316', '#22c55e', '#3b82f6', '#ec4899', '#fff'][i % 6],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 md:top-5 md:right-5 text-white hover:bg-white/20 z-20 w-9 h-9 md:w-11 md:h-11"
      >
        <Minimize2 className="w-5 h-5" />
      </Button>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 md:px-8 py-6 gap-5 md:gap-9">
        {/* Título */}
        <div className="text-center flex-shrink-0" style={{ animation: 'dropIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <p className="text-yellow-300 text-sm md:text-2xl font-black tracking-[0.3em] mb-1 animate-bounce-soft">🏆 CAMPEONES 🏆</p>
          <h1 className="text-4xl md:text-7xl font-black text-white title-shine leading-none">PERMANECE 2026</h1>
          <div className="h-1.5 md:h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full mx-auto w-2/3 mt-3 shadow-[0_0_24px_rgba(251,191,36,0.9)]" />
        </div>

        {/* Podio */}
        <div className="flex items-end justify-center gap-2 md:gap-5 w-full max-w-4xl flex-shrink-0">
          {order.map((entry, idx) => {
            if (!entry) return null
            const isWinner = idx === 1
            return (
              <PodiumColumn
                key={entry.team.id}
                entry={entry}
                idx={idx}
                isWinner={isWinner}
                medal={medals[idx]}
                rank={ranks[idx]}
                heightClass={heights[idx]}
                delay={delays[idx]}
                gameName={gameName}
              />
            )
          })}
        </div>
      </div>

      <style jsx global>{`
        .pitch-bg {
          background:
            repeating-linear-gradient(115deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 70px, rgba(255,255,255,0.045) 70px, rgba(255,255,255,0.045) 140px),
            radial-gradient(ellipse at 50% -10%, #37a24a 0%, #1b6b2b 45%, #0a2e12 100%);
        }
        .vignette { background: radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.6) 100%); }
        .beam { position:absolute; top:-30%; width:40%; height:160%; background: linear-gradient(to bottom, rgba(255,255,255,0.10), transparent 70%); filter: blur(20px); transform-origin: top center; }
        .beam-1 { left: 8%; transform: rotate(14deg); animation: sway 6s ease-in-out infinite; }
        .beam-2 { right: 8%; transform: rotate(-14deg); animation: sway 7s ease-in-out infinite reverse; }
        @keyframes sway { 0%,100% { opacity:.5;} 50% { opacity:1;} }
        @keyframes animate-glow { 0%,100% { opacity:.5; transform:scale(1);} 50%{opacity:.95; transform:scale(1.1);} }
        .animate-glow { animation: animate-glow 4s ease-in-out infinite; }
        @keyframes dropIn { from { opacity:0; transform: translateY(-40px);} to {opacity:1; transform:translateY(0);} }
        @keyframes podiumRise { from { opacity:0; transform: translateY(120px) scale(0.6);} to {opacity:1; transform:translateY(0) scale(1);} }
        @keyframes bounce-soft { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-12px);} }
        .animate-bounce-soft { animation: bounce-soft 2s cubic-bezier(0.34,1.56,0.64,1) infinite; }
        .title-shine {
          background: linear-gradient(100deg, #fff 30%, #fde047 50%, #fff 70%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          background-size:200% auto; animation: shine 3s linear infinite;
          filter: drop-shadow(0 2px 14px rgba(0,0,0,0.6));
        }
        @keyframes shine { to { background-position: 200% center; } }
        .confetti {
          position:absolute; top:-10px; width:10px; height:14px; border-radius:2px;
          animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite;
        }
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity:1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity:0.9; }
        }
        .fi { border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.5); background-size: cover; }
      `}</style>
    </div>
  )
}

function PodiumColumn({
  entry, idx, isWinner, medal, rank, heightClass, delay, gameName,
}: {
  entry: PodiumProps['leaderboard'][number]
  idx: number
  isWinner: boolean
  medal: string
  rank: string
  heightClass: string
  delay: number
  gameName: (id: number) => string
}) {
  const count = useCountUp(entry.totalPoints, 1500, delay * 1000 + 400)
  const color = entry.team.color
  const games = Object.entries(entry.pointsPerGame)
    .map(([gid, pts]) => ({ name: gameName(Number(gid)), pts }))
    .filter((g) => g.name)
    .slice(0, 3)

  return (
    <div
      className="flex flex-col items-center flex-1 min-w-0"
      style={{ animation: `podiumRise 1s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both` }}
    >
      {/* Medalla */}
      <div className={`${isWinner ? 'text-5xl md:text-7xl' : 'text-4xl md:text-6xl'} mb-2 animate-bounce-soft`} style={{ animationDelay: `${idx * 0.15}s` }}>
        {medal}
      </div>

      {/* Bandera */}
      <div
        className={`${isWinner ? 'w-20 h-14 md:w-32 md:h-24' : 'w-16 h-12 md:w-28 md:h-20'} rounded-lg overflow-hidden border-4 shadow-2xl mb-2 flex items-center justify-center bg-black/20`}
        style={{ borderColor: color, boxShadow: `0 0 34px ${color}90` }}
      >
        {entry.team.country ? (
          <span className={`fi fi-${entry.team.country.toLowerCase()}`} style={{ width: '100%', height: '100%', display: 'block' }} />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: color }} />
        )}
      </div>

      {/* Nombre */}
      <h2 className={`${isWinner ? 'text-base md:text-2xl' : 'text-sm md:text-xl'} font-black text-white text-center truncate w-full px-1 drop-shadow-md mb-1`}>
        {entry.team.name.toUpperCase()}
      </h2>

      {/* Chips por juego */}
      {games.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mb-2 px-1">
          {games.map((g, i) => (
            <span key={i} className="text-[9px] md:text-[11px] font-semibold text-white/90 bg-white/15 border border-white/20 rounded-full px-1.5 py-0.5">
              {g.name}: <span className="text-yellow-300 font-bold tabular-nums">{g.pts}</span>
            </span>
          ))}
        </div>
      )}

      {/* Bloque de podio */}
      <div
        className={`${heightClass} w-full rounded-t-2xl border-4 border-b-0 flex flex-col items-center justify-start pt-3 md:pt-5 relative overflow-hidden`}
        style={{
          borderColor: color,
          background: `linear-gradient(180deg, ${color}45, ${color}12)`,
          boxShadow: `0 0 44px ${color}55, inset 0 0 44px ${color}22`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        <span className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">{rank}</span>
        <div className="mt-auto mb-4 text-center relative z-10">
          <div className="text-3xl md:text-6xl font-black tabular-nums text-white" style={{ textShadow: `0 0 22px ${color}` }}>
            {count}
          </div>
          <p className="text-white/85 text-xs md:text-base font-bold tracking-wider">PUNTOS</p>
        </div>
      </div>
    </div>
  )
}
