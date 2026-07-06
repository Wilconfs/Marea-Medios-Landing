import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // 👇 AQUÍ ESTÁ EL AJUSTE: Se agregó .replace('www.', '') al final de la cadena
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase().replace('www.', '') || ''
  
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

  // 2. DOMINIOS RAÍZ
  const rootDomains = ['localhost', 'mareamedios.com']
  const isRootDomain = rootDomains.some(domain => hostname === domain)

  if (isRootDomain) {
    return NextResponse.next()
  }

  // 3. REESCRITURA PARA EL SAAS (Subdominios / Dominios personalizados)
  return NextResponse.rewrite(
    new URL(`/${hostname}${path}${url.search}`, request.url)
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}