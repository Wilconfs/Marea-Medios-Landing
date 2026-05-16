'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, ShoppingCart, User, LogOut, Package, Menu, X, Sparkles, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Hook simple de Debounce para proteger el rendimiento de MySQL local
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

type PredictiveProduct = {
  id: string
  name: string
  price: number
  imageUrl: string
}

export function SiteHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession() || {}
  const items = useCart((s) => s?.items ?? [])
  const hasHydrated = useCart((s) => s?.hasHydrated)
  
  const totalItems = (items ?? []).reduce(
    (sum, item) => sum + (item?.quantity ?? 0),
    0
  )

  const initialSearch = searchParams?.get('search') ?? ''
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Estados del Buscador Predictivo en vivo
  const [predictions, setPredictions] = useState<PredictiveProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Sincronizar el input si cambia la URL externamente
  useEffect(() => {
    setSearchQuery(searchParams?.get('search') ?? '')
  }, [searchParams])

  // Cerrar predicciones al hacer clic en cualquier otra parte de la pantalla
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar sugerencias en vivo desde la API de MySQL
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setPredictions([])
      return
    }

    async function getPredictions() {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/search-predictive?q=${encodeURIComponent(debouncedSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setPredictions(data)
          setShowDropdown(true)
        }
      } catch (err) {
        console.error('Error cargando sugerencias predictivas:', err)
      } finally {
        setLoading(false)
      }
    }

    getPredictions()
  }, [debouncedSearch])

  // Desplazamiento inteligente y actualización de parámetros
  const executeSearch = (queryStr: string) => {
    setShowDropdown(false)
    setMobileOpen(false)
    const q = queryStr.trim()

    router.push(q ? `/?search=${encodeURIComponent(q)}` : '/')

    // Si el usuario escribe algo, hacemos scroll automático al ID exacto de tu page.tsx
    if (q) {
      setTimeout(() => {
        const sectionProductos = document.getElementById('productos')
        if (sectionProductos) {
          sectionProductos.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch(searchQuery)
  }

  const userInitials = (session?.user?.name ?? session?.user?.email ?? 'U')
    .split(' ')
    .map((s) => s?.[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isAdminRole = session?.user?.role === 'SUPERADMIN' ||
    session?.user?.role === 'ADMIN' ||
    session?.user?.role === 'AUXILIAR'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center gap-3">
        
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">
            Tienda<span className="text-primary">Marea</span>
          </span>
        </Link>

        {/* Formulario de Escritorio con Predictivo */}
        <div ref={containerRef} className="relative hidden flex-1 max-w-xl md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowDropdown(true)
              }}
              className="pl-10 pr-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </form>

          {/* Menú Flotante de Sugerencias */}
          {showDropdown && predictions.length > 0 && (
            <div className="absolute left-0 mt-2 w-full bg-popover text-popover-foreground rounded-xl border border-border shadow-xl overflow-hidden max-h-72 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="p-2 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4">
                Sugerencias en tiempo real
              </div>
              <div className="divide-y divide-border/50">
                {predictions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setShowDropdown(false)
                      router.push(`products/${product.id}`)
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/80 cursor-pointer transition-colors"
                  >
                    <img
                      src={product.imageUrl?.split(',')[0] || '/placeholder.png'}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover bg-muted border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate text-foreground">{product.name}</h4>
                      <p className="text-xs font-bold text-primary mt-0.5">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acciones Derecha */}
        <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
          {/* Carrito */}
          <Link href="/cart" aria-label="Carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {hasHydrated && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-discount px-1 text-[11px] font-semibold text-white shadow">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Menú de Usuario */}
          {status === 'loading' ? (
            <Button variant="ghost" size="icon" disabled>
              <User className="h-5 w-5 opacity-50" />
            </Button>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {userInitials}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{session?.user?.name ?? 'Usuario'}</span>
                    <span className="text-xs font-normal text-muted-foreground">{session?.user?.email ?? ''}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdminRole && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    Panel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push('/orders')} className="cursor-pointer">
                  <Package className="mr-2 h-4 w-4" />
                  Mis pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          )}

          {/* Botón menú Móvil */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menú">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container-page space-y-3 py-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </form>
            {!session?.user && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMobileOpen(false)} asChild>
                  <Link href="/login">Ingresar</Link>
                </Button>
                <Button className="flex-1" onClick={() => setMobileOpen(false)} asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}