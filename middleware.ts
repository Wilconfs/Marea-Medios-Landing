import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  // El .split(':')[0] quita el ":3000" para que Windows no sufra
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase() || ''
  const path = url.pathname.toLowerCase() 

  // 1. LISTA DE EXCLUSIÓN
  if (
    path.startsWith('/api/') || 
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.') 
  ) {
    return NextResponse.next()
  }

  // 👇 2. REDIRECCIÓN POR DEFECTO AL LOGIN
  // Si el usuario entra a la raíz ("/") lo mandamos de inmediato a "/login"
  if (path === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Dominios raíz
  const rootDomains = ['localhost', 'mareamedios.com']
  const isRootDomain = rootDomains.some(domain => hostname === domain)

  if (isRootDomain) {
    return NextResponse.next()
  }

  // 3. REESCRITURA PARA EL SAAS (Subdominios)
  return NextResponse.rewrite(
    new URL(`/${hostname}${path}${url.search}`, request.url)
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}