import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Rutas que requieren evento seleccionado
const PROTECTED_ROUTES = [
  '/dashboard',
  '/personas',
  '/finanzas',
  '/logistica',
  '/juegos',
]

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Si no está autenticado, dejar que siga (auth handler lo redirige)
  if (!session?.user?.id) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  // Si está accediendo a una ruta protegida, verificar que tenga evento en sesión
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Verificar si hay evento en la cookie/sesión
    const eventSession = request.cookies.get('eventSession')?.value

    if (!eventSession) {
      // Redirigir a selección de evento
      return NextResponse.redirect(new URL('/select-event', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/(app)/:path*'],
}
