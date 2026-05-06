'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Package, Tags, ShoppingBag, Users, Settings, Store, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth-helpers'

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tags },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/users', label: 'Usuarios', icon: Users, roles: ['SUPERADMIN', 'ADMIN'] as UserRole[] },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, roles: ['SUPERADMIN'] as UserRole[] },
]

export function AdminMobileNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const visible = items.filter((it) => !it.roles || it.roles.includes(role))

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md border bg-card lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-card">
            <div className="flex h-16 items-center justify-between border-b px-5">
              <span className="font-display text-lg font-bold">EcomDash</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {visible.map(({ href, label, icon: Icon }) => {
                  const active =
                    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground/70 hover:bg-secondary',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="border-t p-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                <Store className="h-4 w-4" />
                <span>Ver tienda</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
