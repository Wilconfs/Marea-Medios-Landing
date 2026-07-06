import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // 1. LIMPIEZA DE HOSTNAME
  // El .split(':')[0] quita el ":3000" para local
  // El .replace('www.', '') unifica el dominio para que funcione con o sin www
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase().replace('www.', '') || ''
  
  const path = url.pathname.toLowerCase() 

  // 2. LISTA DE EXCLUSIÓN (Archivos estáticos y APIs no se reescriben)
  if (
    path.startsWith('/api/') || 
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.') 
  ) {
    return NextResponse.next()
  }

  // 3. DOMINIOS RAÍZ
  // Solo dejamos localhost. Así, cualquier dominio de producción (incluyendo el tuyo) pasará al rewrite.
  const rootDomains = ['localhost']
  const isRootDomain = rootDomains.some(domain => hostname === domain)

  if (isRootDomain) {
    return NextResponse.next()
  }

  // 4. REESCRITURA PARA EL SAAS (Tenant)
  return NextResponse.rewrite(
    new URL(`/${hostname}${path}${url.search}`, request.url)
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}