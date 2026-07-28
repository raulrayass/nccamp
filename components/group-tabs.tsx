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
    <div className={cn('flex gap-1.5 p-1 rounded-xl bg-muted/60 w-full sm:w-fit', className)}>
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
              active
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
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
