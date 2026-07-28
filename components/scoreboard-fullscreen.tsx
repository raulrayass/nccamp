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

interface ScoreboardProps {
  leaderboard: Array<{
    team: Team
    totalPoints: number
    pointsPerGame: Record<number, number>
  }>
  onClose: () => void
  gameList: Array<{ id: number; name: string }>
}

// Hook: cuenta de 0 al valor final (count-up estilo transmisión)
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    let start: number | null = null
    let timeout: any
    function step(ts: number) {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / duration)
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.round(target * eased))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    timeout = setTimeout(() => { raf.current = requestAnimationFrame(step) }, delay)
    return () => { clearTimeout(timeout); if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration, delay])
  return val
}

export function ScoreboardFullscreen({ leaderboard, onClose, gameList }: ScoreboardProps) {
  const maxPoints = leaderboard[0]?.totalPoints || 1
  const gameName = (id: number) => gameList.find((g) => g.id === id)?.name ?? ''

  const medal = (idx: number) => (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pitch-bg">
      {/* Reflectores de estadio */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="beam beam-1" />
        <div className="beam beam-2" />
        <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-glow" />
        <div className="absolute -top-24 right-1/4 w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1.4s' }} />
        <div className="absolute inset-0 vignette" />
      </div>

      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 md:top-5 md:right-5 text-white hover:bg-white/20 z-20 w-9 h-9 md:w-11 md:h-11"
      >
        <Minimize2 className="w-5 h-5" />
      </Button>

      <div className="relative z-10 w-full h-full flex flex-col items-center px-3 md:px-8 py-4 md:py-7 gap-3 md:gap-5">
        {/* Título */}
        <div className="text-center flex-shrink-0" style={{ animation: 'dropIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 mb-2 shadow-[0_0_20px_rgba(220,38,38,0.7)]">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs md:text-sm font-black tracking-[0.25em]">EN VIVO</span>
          </div>
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-white title-shine tracking-tight leading-none">
            TABLA DE POSICIONES
          </h1>
          <p className="text-yellow-300 text-sm md:text-xl font-bold tracking-[0.3em] mt-2 drop-shadow">PERMANECE 2026</p>
        </div>

        {/* Tabla */}
        <div className="w-full max-w-4xl flex-1 overflow-y-auto space-y-2 md:space-y-3 scrollbar-hide pr-1">
          {leaderboard.map((entry, idx) => (
            <ScoreRow
              key={entry.team.id}
              entry={entry}
              idx={idx}
              maxPoints={maxPoints}
              medal={medal(idx)}
              gameName={gameName}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .pitch-bg {
          background:
            repeating-linear-gradient(115deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 70px, rgba(255,255,255,0.045) 70px, rgba(255,255,255,0.045) 140px),
            radial-gradient(ellipse at 50% -10%, #37a24a 0%, #1b6b2b 45%, #0a2e12 100%);
        }
        .vignette { background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%); }
        .beam {
          position: absolute; top: -30%; width: 40%; height: 160%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.10), transparent 70%);
          filter: blur(20px); transform-origin: top center;
        }
        .beam-1 { left: 8%; transform: rotate(14deg); animation: sway 6s ease-in-out infinite; }
        .beam-2 { right: 8%; transform: rotate(-14deg); animation: sway 7s ease-in-out infinite reverse; }
        @keyframes sway { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
        @keyframes animate-glow { 0%,100% { opacity:.5; transform:scale(1);} 50%{opacity:.9; transform:scale(1.08);} }
        .animate-glow { animation: animate-glow 4s ease-in-out infinite; }
        @keyframes dropIn { from { opacity:0; transform: translateY(-40px);} to {opacity:1; transform:translateY(0);} }
        @keyframes rowIn { from { opacity:0; transform: translateX(-60px) scale(0.96);} to {opacity:1; transform:translateX(0) scale(1);} }
        .title-shine {
          background: linear-gradient(100deg, #fff 30%, #fde047 50%, #fff 70%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          background-size: 200% auto; animation: shine 3s linear infinite;
          filter: drop-shadow(0 2px 12px rgba(0,0,0,0.5));
        }
        @keyframes shine { to { background-position: 200% center; } }
        @keyframes sweep { 0% { transform: translateX(-120%);} 100% { transform: translateX(320%);} }
        .leader-sweep::after {
          content:''; position:absolute; inset:0; width:40%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: sweep 2.6s ease-in-out infinite;
        }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .fi { border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); background-size: cover; }
      `}</style>
    </div>
  )
}

function ScoreRow({
  entry, idx, maxPoints, medal, gameName,
}: {
  entry: ScoreboardProps['leaderboard'][number]
  idx: number
  maxPoints: number
  medal: string | null
  gameName: (id: number) => string
}) {
  const count = useCountUp(entry.totalPoints, 1300, 400 + idx * 120)
  const [barW, setBarW] = useState(0)
  const isLeader = idx === 0
  const progress = Math.min(100, (entry.totalPoints / maxPoints) * 100)

  useEffect(() => {
    const t = setTimeout(() => setBarW(progress), 300 + idx * 120)
    return () => clearTimeout(t)
  }, [progress, idx])

  const games = Object.entries(entry.pointsPerGame)
    .map(([gid, pts]) => ({ name: gameName(Number(gid)), pts }))
    .filter((g) => g.name)

  return (
    <div
      className={`relative rounded-xl md:rounded-2xl overflow-hidden border bg-white/10 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.45)] ${isLeader ? 'border-yellow-300/70 leader-sweep' : 'border-white/15'}`}
      style={{ animation: `rowIn 0.7s cubic-bezier(0.34,1.56,0.64,1) ${idx * 0.1}s both` }}
    >
      {/* barra de progreso de fondo */}
      <div
        className="absolute inset-y-0 left-0 opacity-30 transition-[width] duration-[1400ms] ease-out"
        style={{ width: `${barW}%`, backgroundColor: entry.team.color }}
      />

      <div className="relative flex items-center gap-3 md:gap-5 px-3 md:px-6 py-2.5 md:py-3.5">
        {/* posición */}
        <div className={`shrink-0 w-9 md:w-14 text-center font-black tabular-nums ${isLeader ? 'text-yellow-300' : 'text-white'}`}>
          {medal ? <span className="text-2xl md:text-4xl inline-block animate-medal">{medal}</span>
                 : <span className="text-xl md:text-3xl">{idx + 1}</span>}
        </div>

        {/* bandera */}
        <div
          className="shrink-0 w-14 h-10 md:w-24 md:h-16 rounded-md md:rounded-lg overflow-hidden border-2 flex items-center justify-center bg-black/20"
          style={{ borderColor: entry.team.color, boxShadow: `0 0 18px ${entry.team.color}70` }}
        >
          {entry.team.country ? (
            <span
              className={`fi fi-${entry.team.country.toLowerCase()}`}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: entry.team.color }} />
          )}
        </div>

        {/* nombre + chips por juego */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-3xl font-bold text-white truncate drop-shadow-md leading-tight">
            {entry.team.name}
          </h2>
          {games.length > 0 && (
            <div className="flex gap-1.5 mt-1 overflow-x-auto scrollbar-hide">
              {games.map((g, i) => (
                <span
                  key={i}
                  className="shrink-0 text-[10px] md:text-xs font-semibold text-white/90 bg-white/15 border border-white/20 rounded-full px-2 py-0.5 backdrop-blur-sm"
                >
                  {g.name}: <span className="text-yellow-300 font-bold tabular-nums">{g.pts}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* puntos count-up */}
        <div className="shrink-0 text-right">
          <span className="text-3xl md:text-6xl font-black text-white tabular-nums drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            {count}
          </span>
          <span className="text-white/70 text-xs md:text-lg font-bold ml-1">PTS</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes medal { 0%,100% { transform: translateY(0) rotate(0);} 50% { transform: translateY(-6px) rotate(-6deg);} }
        .animate-medal { animation: medal 2s cubic-bezier(0.34,1.56,0.64,1) infinite; }
      `}</style>
    </div>
  )
}
