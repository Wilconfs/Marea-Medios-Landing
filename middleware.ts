import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const path = url.pathname

  // 1. LISTA DE EXCLUSIÓN: Rutas globales que no dependen del subdominio
  const isGlobalPath = 
    path.startsWith('/login') || 
    path.startsWith('/register') || 
    path.startsWith('/api') ||
    path.startsWith('/admin') ||
    path.startsWith('/orders') || 
    path.startsWith('/cart')

  const rootDomains = ['localhost:3000', 'tuapp.com']
  const isRootDomain = rootDomains.some(domain => hostname === domain)

  // CORRECCIÓN: Usar el nombre de variable correcto aquí
  if (isGlobalPath) {
    return NextResponse.next()
  }

  // 2. Lógica de Subdominios
  if (!isRootDomain) {
    const subdomain = hostname.split('.')[0]
    
    if (path.startsWith(`/${subdomain}`)) {
       return NextResponse.next()
    }

    return NextResponse.rewrite(
      new URL(`/${subdomain}${path}${url.search}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|_static|[\\w-]+\\.\\w+).*)',
  ],
}