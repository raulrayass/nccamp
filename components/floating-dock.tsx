'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Square, Users, DollarSign, MapPin, Trophy, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLoading } from '@/components/loading-screen'

// 5 destinos, con Inicio centrado y resaltado:
// Personas · Finanzas · Inicio · Logística · Juegos
const navItems = [
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
    href: '/',
    label: 'Inicio',
    icon: Square,
    match: (p: string) => p === '/',
    isHome: true,
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

// Acción contextual del "+" flotante según la pantalla.
function getPrimaryAction(pathname: string): { label: string; href: string } | null {
  if (pathname === '/') return null // en Inicio no hay acción de agregar
  if (pathname.startsWith('/transactions') || pathname.startsWith('/categories'))
    return { label: 'Nueva transacción', href: '/transactions?new=1' }
  if (pathname.startsWith('/rooms') || pathname.startsWith('/churches'))
    return { label: 'Nueva habitación', href: '/rooms?new=1' }
  if (pathname.startsWith('/games')) return { label: 'Nuevo juego', href: '/games?new=1' }
  if (pathname.startsWith('/staff')) return { label: 'Nuevo staff', href: '/staff?new=1' }
  if (pathname.startsWith('/teams')) return { label: 'Nuevo equipo', href: '/teams?new=1' }
  return { label: 'Agregar campero', href: '/attendees?new=1' }
}

// Pantallas con barra de búsqueda con id="page-search".
function hasPageSearch(pathname: string): boolean {
  return (
    pathname.startsWith('/attendees') ||
    pathname.startsWith('/transactions')
  )
}

export function FloatingDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoading } = useLoading()

  if (isLoading) return null

  const action = getPrimaryAction(pathname)
  const showSearch = hasPageSearch(pathname)

  // Foco SÍNCRONO en el tap para que el teclado móvil (iOS) aparezca.
  // No usar setTimeout ni await antes de esto: rompe el "user gesture"
  // y iOS Safari se niega a abrir el teclado.
  function focusPageSearch() {
    const el = document.getElementById('page-search') as HTMLInputElement | null
    if (!el) return
    el.focus({ preventScroll: true })
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 lg:hidden">
      {/* Botones de acción SUPERPUESTOS, mismo tamaño, uno junto al otro */}
      <div className="absolute -top-16 right-0 flex flex-row items-center gap-2">
        {showSearch && (
          <button
            onClick={focusPageSearch}
            title="Buscar"
            aria-label="Buscar"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-card border border-border text-foreground shadow-lg transition-all duration-200 hover:bg-muted active:scale-95"
          >
            <Search className="w-6 h-6" strokeWidth={2.25} />
          </button>
        )}
        {action && (
          <button
            onClick={() => router.push(action.href)}
            title={action.label}
            aria-label={action.label}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 transition-all duration-200 hover:bg-green-700 active:scale-95"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Píldora con los 5 ítems — Inicio centrado, solo ícono */}
      <nav>
        <div className="flex items-center justify-between px-1.5 py-1.5 rounded-3xl bg-card/95 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
          {navItems.map((item) => (
            <DockItem key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function DockItem({
  item,
  active,
}: {
  item: {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    isHome?: boolean
  }
  active: boolean
}) {
  const Icon = item.icon

  if (item.isHome) {
    // Botón central de Inicio: solo ícono, resaltado verde leve,
    // más marcado cuando está activo.
    return (
      <Link
        href={item.href}
        title={item.label}
        aria-label={item.label}
        className="flex flex-1 items-center justify-center py-1"
      >
        <span
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200',
            active
              ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
              : 'bg-green-50 text-green-600'
          )}
        >
          <Icon className="w-5 h-5" />
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl transition-colors duration-200',
        active ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="w-5 h-5" />
      <span className={cn('text-[10px] leading-none', active ? 'font-semibold' : 'font-medium')}>
        {item.label}
      </span>
    </Link>
  )
}