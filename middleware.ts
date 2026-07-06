import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // 1. LIMPIEZA DE HOSTNAME
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase().replace('www.', '') || ''
  
  const path = url.pathname.toLowerCase() 

  // 2. LISTA DE EXCLUSIÓN
  if (
    path.startsWith('/api/') || 
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.') 
  ) {
    return NextResponse.next()
  }

  // 3. DOMINIOS RAÍZ
  const rootDomains = ['localhost']
  const isRootDomain = rootDomains.some(domain => hostname === domain)

  if (isRootDomain) {
    return NextResponse.next()
  }

  // 🚨 PREVENCIÓN DE BUCLE INFINITO
  // Si la ruta ya empieza con el nombre del dominio, no la reescribas de nuevo
  if (path.startsWith(`/${hostname}`)) {
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