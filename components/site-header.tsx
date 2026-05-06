'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, ShoppingCart, User, LogOut, Package, Menu, X, Sparkles } from 'lucide-react'
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
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    setSearchQuery(searchParams?.get('search') ?? '')
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = (searchQuery ?? '').trim()
    router.push(q ? `/?search=${encodeURIComponent(q)}` : '/')
    setMobileOpen(false)
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
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl font-bold tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">
            Ecom<span className="text-primary">Dash</span>
          </span>
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="relative hidden flex-1 max-w-xl md:flex"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>

        <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
          <ThemeToggle />

          {/* Cart */}
          <Link href="/cart" aria-label="Carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {hasHydrated && totalItems > 0 ? (
                <span
                  className={cn(
                    'absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-discount px-1 text-[11px] font-semibold text-white shadow'
                  )}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              ) : null}
            </Button>
          </Link>

          {/* User menu */}
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
                    <span className="text-sm font-medium">
                      {session?.user?.name ?? 'Usuario'}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {session?.user?.email ?? ''}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdminRole && (
                  <DropdownMenuItem
                    onClick={() => router.push('/admin')}
                    className="cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Panel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => router.push('/orders')}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mis pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
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

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile search & links */}
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
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/login">Ingresar</Link>
                </Button>
                <Button
                  asChild
                  className="flex-1"
                  onClick={() => setMobileOpen(false)}
                >
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
