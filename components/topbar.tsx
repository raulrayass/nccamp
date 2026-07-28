'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Square, Users, DollarSign, MapPin, Trophy, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/user-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const { user, signOut } = useUser()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    await signOut()
  }

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
              <span className="font-bold text-foreground text-xs sm:text-sm truncate">Permanece Camp</span>
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

          {/* User area */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all duration-200">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="hidden sm:block truncate text-foreground text-sm font-medium max-w-[120px]">
                  {user.name || user.email?.split('@')[0] || 'Usuario'}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal px-2 py-3 bg-muted/30 rounded-t-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"></p>
                    <p className="text-sm font-semibold text-foreground truncate mt-1">{user.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => setLogoutDialogOpen(true)}
                    className="text-destructive/80 focus:text-destructive focus:bg-destructive/5 hover:bg-destructive/5 gap-2.5 cursor-pointer py-2.5 px-3 transition-all duration-200 group/logout"
                  >
                    <div className="w-3.5 h-3.5 flex items-center justify-center rounded-md bg-destructive/10 group-hover/logout:bg-destructive/15">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle>Cerrar sesión</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder a Permanece Camp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end pt-2">
            <AlertDialogCancel disabled={isLoggingOut} className="gap-2">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {isLoggingOut && (
                <div className="w-4 h-4 border-2 border-transparent border-t-current border-r-current rounded-full animate-spin" />
              )}
              {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
