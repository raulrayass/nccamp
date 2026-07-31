'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Square, Users, DollarSign, MapPin, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/user-provider'
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

  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between h-12 gap-3 sm:gap-4 px-4 py-3 rounded-2xl bg-card border-glow shadow-lg backdrop-blur-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src="/permanece-camp-logo.png"
              alt="Permanece Camp"
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-contain"
              priority
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-foreground text-xs sm:text-sm truncate">Permanece</span>
            </div>
          </Link>

          {/* Nav - Hidden on mobile, shown on md+ */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 ml-6">
            {navItems.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/30 shadow-md'
                      : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User area - Direct link to settings */}
          {user ? (
            <Link href="/settings" className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all duration-200">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:block truncate text-foreground text-sm font-medium max-w-[120px]">
                {user.name || user.email?.split('@')[0] || 'Usuario'}
              </span>
            </Link>
          ) : null}
        </div>
      </div>


    </header>
  )
}
