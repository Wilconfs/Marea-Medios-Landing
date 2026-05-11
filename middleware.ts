import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  // Limpiamos el hostname para quitar puertos (ej: :3000) y pasarlo a minúsculas
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase() || ''
  const path = url.pathname

  // 1. LISTA DE EXCLUSIÓN
  const isGlobalPath = 
    path.startsWith('/login') || 
    path.startsWith('/register') || 
    path.startsWith('/api') ||
    path.startsWith('/admin') ||
    path.startsWith('/orders') || 
    path.startsWith('/cart')

  // Definimos tus dominios raíz
  const rootDomains = ['localhost', 'mareamedios.com', 'www.mareamedios.com']
  
  // Verificamos si es dominio raíz o si es un "www" que debe tratarse como raíz
  const isRootDomain = rootDomains.some(domain => hostname === domain)

  if (isGlobalPath) {
    return NextResponse.next()
  }

  // 2. Lógica de Subdominios (Multi-tenant)
  if (!isRootDomain) {
    // Extraemos el primer segmento: "tienda2.mareamedios.com" -> "tienda2"
    const subdomain = hostname.split('.')[0]

    // Si por alguna razón el subdominio queda vacío o es "www", no reescribir
    if (!subdomain || subdomain === 'www') {
      return NextResponse.next()
    }

    // Si la ruta ya empieza con el subdominio (evita bucles infinitos)
    if (path.startsWith(`/${subdomain}`)) {
       return NextResponse.next()
    }

    // REESCRITURA MÁGICA:
    // Transforma tienda2.mareamedios.com/productos 
    // internamente en mareamedios.com/tienda2/productos
    return NextResponse.rewrite(
      new URL(`/${subdomain}${path}${url.search}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Excluye archivos estáticos, imágenes y rutas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}