'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface GroupTab {
  href: string
  label: string
}

interface GroupTabsProps {
  tabs: GroupTab[]
  className?: string
}

export function GroupTabs({ tabs, className }: GroupTabsProps) {
  const pathname = usePathname()

  return (
    <div className={cn('flex gap-0 bg-muted/40 rounded-2xl p-1 w-full sm:w-fit overflow-hidden', className)}>
      {tabs.map((tab, idx) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex-1 sm:flex-initial text-center px-4 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap',
              active
                ? 'bg-card text-foreground rounded-xl shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

// Definiciones de tabs por grupo — impórtalas donde las necesites.
export const PERSONAS_TABS: GroupTab[] = [
  { href: '/attendees', label: 'Camperos' },
  { href: '/staff', label: 'Staff' },
  { href: '/teams', label: 'Equipos' },
]

export const LOGISTICA_TABS: GroupTab[] = [
  { href: '/rooms', label: 'Habitaciones' },
  { href: '/churches', label: 'Iglesias' },
]

export const FINANZAS_TABS: GroupTab[] = [
  { href: '/transactions', label: 'Transacciones' },
  { href: '/categories', label: 'Categorías' },
]
