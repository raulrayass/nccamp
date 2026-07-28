import React from 'react'

const FLAGS_SVG: Record<string, React.ReactNode> = {
  MX: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" fill="#227143" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#c60c30" />
    </svg>
  ),
  BR: (
    <svg viewBox="0 0 10 7" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="7" fill="#009c3b" />
      <polygon points="5,0 8.5,7 1.5,7" fill="#ffd700" />
      <ellipse cx="5" cy="3.5" rx="1.5" ry="1" fill="#002776" />
    </svg>
  ),
  AR: (
    <svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg">
      <rect width="9" height="2" fill="#4da6ff" />
      <rect y="2" width="9" height="2" fill="#fff" />
      <rect y="4" width="9" height="2" fill="#4da6ff" />
    </svg>
  ),
  PT: (
    <svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg">
      <rect width="2" height="3" fill="#003478" />
      <rect x="2" width="3" height="3" fill="#c60c30" />
    </svg>
  ),
  US: (
    <svg viewBox="0 0 7 4" xmlns="http://www.w3.org/2000/svg">
      <rect width="7" height="4" fill="#b22234" />
      <rect width="7" height="0.4" fill="#fff" />
      <rect y="0.8" width="7" height="0.4" fill="#fff" />
      <rect y="1.6" width="7" height="0.4" fill="#fff" />
      <rect width="2.7" height="2" fill="#3c3b6b" />
    </svg>
  ),
  KR: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="3" height="2" fill="#fff" />
      <circle cx="1.5" cy="1" r="0.4" fill="#c60c30" />
      <circle cx="1.5" cy="1" r="0.3" fill="#003478" />
    </svg>
  ),
  ES: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="3" height="0.5" fill="#c60c30" />
      <rect y="0.5" width="3" height="1" fill="#ffc400" />
      <rect y="1.5" width="3" height="0.5" fill="#c60c30" />
    </svg>
  ),
  IT: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#c8102e" />
    </svg>
  ),
  FR: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ed2939" />
    </svg>
  ),
  DE: (
    <svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg">
      <rect width="5" height="1" fill="#000" />
      <rect y="1" width="5" height="1" fill="#d00" />
      <rect y="2" width="5" height="1" fill="#ffce00" />
    </svg>
  ),
  CO: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="3" height="1" fill="#ffc400" />
      <rect y="1" width="3" height="0.5" fill="#003da5" />
      <rect y="1.5" width="3" height="0.5" fill="#ce1126" />
    </svg>
  ),
  CL: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="1.5" height="1" fill="#002a7f" />
      <circle cx="0.75" cy="0.5" r="0.3" fill="#fff" />
      <rect y="1" width="3" height="0.5" fill="#fff" />
      <rect y="1.5" width="3" height="0.5" fill="#d21f3c" />
    </svg>
  ),
  PE: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" fill="#ce1126" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ce1126" />
    </svg>
  ),
  JP: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="3" height="2" fill="#bc002d" />
      <circle cx="1.5" cy="1" r="0.6" fill="#fff" />
    </svg>
  ),
  AU: (
    <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
      <rect width="3" height="2" fill="#00008b" />
      <rect width="1.5" height="1" fill="#fff" />
    </svg>
  ),
}

export function CountryFlagSvg({ code, className }: { code: string; className?: string }) {
  const flag = FLAGS_SVG[code]
  if (!flag) return null

  return (
    <div className={`inline-block ${className || ''}`}>
      {flag}
    </div>
  )
}

export function getCountryFlagSvg(code: string | null | undefined): React.ReactNode {
  if (!code) return null
  return FLAGS_SVG[code] || null
}
