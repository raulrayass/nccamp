'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Square, Users, DollarSign, MapPin, Trophy, User, ChevronDown, UserRound, Shield, UsersRound, WalletCards, Tags, DoorOpen, Church, Gamepad2, Settings2, CalendarDays } from 'lucide-react'
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
const megaGroups = [
  {
    label: 'Personas',
    icon: Users,
    items: [
      { href: '/attendees', label: 'Camperos', description: 'Registro y seguimiento de participantes', icon: UserRound },
      { href: '/staff', label: 'Staff', description: 'Equipo responsable del evento', icon: Shield },
      { href: '/teams', label: 'Equipos', description: 'Organiza grupos y responsables', icon: UsersRound },
    ],
  },
  {
    label: 'Operación',
    icon: MapPin,
    items: [
      { href: '/rooms', label: 'Salones', description: 'Espacios y asignaciones', icon: DoorOpen },
      { href: '/churches', label: 'Iglesias', description: 'Comunidades participantes', icon: Church },
      { href: '/games', label: 'Juegos', description: 'Actividades y marcadores', icon: Gamepad2 },
    ],
  },
  {
    label: 'Finanzas',
    icon: DollarSign,
    items: [
      { href: '/transactions', label: 'Movimientos', description: 'Ingresos, egresos y pagos', icon: WalletCards },
      { href: '/categories', label: 'Categorías', description: 'Clasifica tus movimientos', icon: Tags },
    ],
  },
  {
    label: 'Configuración',
    icon: Settings2,
    items: [
      { href: '/settings', label: 'Preferencias', description: 'Cuenta, eventos y apariencia', icon: Settings2 },
      { href: '/select-event', label: 'Cambiar evento', description: 'Selecciona el espacio de trabajo', icon: CalendarDays },
    ],
  },
]

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
    <header className="sticky top-0 z-40 border-b border-border bg-background">
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
              <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight truncate">
                {eventName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.name || 'Usuario'}
              </p>
            </div>
          </div>

          <nav className="topbar-mega-nav hidden lg:flex items-center justify-center gap-1">
            <Link href="/" className="topbar-nav-link">Inicio</Link>
            {megaGroups.map((group) => {
              const active = group.items.some((item) => pathname.startsWith(item.href))
              const GroupIcon = group.icon
              return (
                <div key={group.label} className="topbar-mega-group">
                  <button type="button" className={cn('topbar-nav-link inline-flex items-center gap-1.5', active && 'topbar-nav-link-active')} aria-haspopup="true">
                    <span>{group.label}</span><ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="topbar-mega-panel" role="menu">
                    <div className="topbar-mega-heading"><GroupIcon className="h-4 w-4" /><span>{group.label}</span></div>
                    <div className="topbar-mega-grid">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        return <Link key={item.href} href={item.href} role="menuitem" className="topbar-mega-item"><ItemIcon className="topbar-mega-item-icon" /><span><strong>{item.label}</strong><small>{item.description}</small></span></Link>
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Right: User button */}
          {user ? (
            <Link href="/settings" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shrink-0">
              <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted">
                <User className="size-4 text-foreground" />
              </div>
              <span className="hidden sm:block text-xs font-medium">Perfil</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
