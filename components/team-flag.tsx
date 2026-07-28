'use client'

// Muestra la bandera del país del equipo (flag-icons). Si el equipo no tiene
// país asignado, cae a un círculo/rectángulo con su color como respaldo.
// Requiere el <link> de flag-icons en app/layout.tsx.

interface TeamFlagProps {
  country?: string | null
  color: string
  // 'circle' para listas compactas (leaderboard, selects),
  // 'rect' para tarjetas o vistas más grandes.
  shape?: 'circle' | 'rect'
  className?: string
}

export function TeamFlag({ country, color, shape = 'circle', className = '' }: TeamFlagProps) {
  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-md'
  const base = `overflow-hidden shrink-0 flex items-center justify-center border ${rounded} ${className}`

  if (country) {
    return (
      <span
        className={base}
        style={{ borderColor: color }}
      >
        <span
          className={`fi fi-${country.toLowerCase()}`}
          style={{ width: '100%', height: '100%', display: 'block', backgroundSize: 'cover' }}
        />
      </span>
    )
  }

  // Respaldo: color liso
  return (
    <span
      className={`${rounded} shrink-0 border ${className}`}
      style={{ backgroundColor: color, borderColor: color }}
    />
  )
}
