'use client'

import { ReactNode, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { Gamepad2, Users2, BarChart3 } from 'lucide-react'

export interface NavItem {
  label: string
  icon: ReactNode
  href: string
  badge?: number
}

interface BottomNavigationProps {
  className?: string
}

const DEFAULT_ITEMS: NavItem[] = [
  {
    label: 'Juegos',
    icon: <Gamepad2 className="w-5 h-5" />,
    href: '/games',
  },
  {
    label: 'Equipos',
    icon: <Users2 className="w-5 h-5" />,
    href: '/teams',
  },
  {
    label: 'Ranking',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/ranking',
  },
]

export function BottomNavigation({ className }: BottomNavigationProps) {
  const isMobile = !useMediaQuery('(min-width: 768px)')
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  if (!isMobile) return null

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-40', className)}>
      <div className="flex items-center justify-around h-16 px-2 max-w-full">
        {DEFAULT_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => startTransition(() => router.push(item.href))}
              aria-current={isActive ? 'page' : undefined}
              aria-busy={isPending && isActive}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors relative h-full flex-1 active:scale-[0.98]',
                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted',
                isPending && isActive && 'opacity-60'
              )}
            >
              <div>{item.icon}</div>
              <span className="truncate text-xs">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1 bg-destructive text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
