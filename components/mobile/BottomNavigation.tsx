'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { Gamepad2, Users2, BarChart3, Plus } from 'lucide-react'

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
  const [isHidden, setIsHidden] = useState(false)
  useEffect(() => {
    let previousY = window.scrollY
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY < 24) setIsHidden(false)
      else if (currentY > previousY + 8) setIsHidden(true)
      else if (currentY < previousY - 8) setIsHidden(false)
      previousY = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isMobile) return null

  return (
    <nav className={cn('mobile-dock fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 safe-bottom transition-transform duration-200', isHidden && 'translate-y-[calc(100%+1rem)]', className)} aria-label="Navegación principal">
        <div className="mx-auto flex h-[68px] max-w-md items-center gap-2 finance-dock rounded-[1.25rem] border border-border/70 bg-card/95 p-2 backdrop-blur-xl">
        <div className="relative flex min-w-0 flex-1 items-center justify-around">
          {DEFAULT_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative z-10 flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 transition-all active:scale-95',
                  'text-[10px] font-semibold',
                  isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/70'
                )}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => router.push('/select-event')}
          aria-label="Cambiar evento"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground transition-transform active:scale-90"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </nav>
  )
}
