'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Square, Users, DollarSign, MapPin, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/user-provider'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Mismas 5 categorías consolidadas que en FloatingDock (mobile),
// para que el resaltado activo sea consistente en toda la app.
const navItems = [
  {
    href: '/',
    label: 'Inicio',
    icon: Square,
    match: (p: string) => p === '/',
  },
  {
    href: '/attendees',
    label: 'Personas',
    icon: Users,
    match: (p: string) => ['/attendees', '/staff', '/teams'].some((r) => p.startsWith(r)),
  },
  {
    href: '/transactions',
    label: 'Finanzas',
    icon: DollarSign,
    match: (p: string) => ['/transactions', '/categories'].some((r) => p.startsWith(r)),
  },
  {
    href: '/rooms',
    label: 'Logística',
    icon: MapPin,
    match: (p: string) => ['/rooms', '/churches'].some((r) => p.startsWith(r)),
  },
  {
    href: '/games',
    label: 'Juegos',
    icon: Trophy,
    match: (p: string) => p.startsWith('/games'),
  },
]

export function Topbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { events, eventId } = useEventSession()
  
  // Obtener el evento actual
  const currentEvent = events.find(e => e.id === eventId)
  const eventName = currentEvent?.name || 'Evento'

  return (
    <header className="sticky top-0 z-40 bg-primary rounded-b-3xl">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 pb-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Greeting */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity">
              <Image
                src="/permanece-camp-logo.png"
                alt="Permanece Camp"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain"
                priority
              />
            </Link>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-primary-foreground leading-tight">
                Hola, {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-primary-foreground/80 truncate font-medium">
                {eventName}
              </p>
            </div>
          </div>

          {/* Nav - Hidden on mobile, shown on md+ */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right: User button */}
          {user ? (
            <Link href="/settings" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary-foreground/10 transition-all duration-200 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="hidden sm:block text-xs text-primary-foreground font-medium">
                Perfil
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
