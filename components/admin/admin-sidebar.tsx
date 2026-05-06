'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  Store,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth-helpers'

type Item = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  roles?: UserRole[]
}

const items: Item[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tags },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/users', label: 'Usuarios', icon: Users, roles: ['SUPERADMIN', 'ADMIN'] },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, roles: ['SUPERADMIN'] },
]

const ROLE_DISPLAY: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  AUXILIAR: 'Auxiliar',
  CLIENTE: 'Cliente',
}

export function AdminSidebar({
  role,
  userName,
}: {
  role: UserRole
  userName: string
}) {
  const pathname = usePathname()
  const visible = items.filter((it) => !it.roles || it.roles.includes(role))

  return (
    <aside
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card lg:flex"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LayoutDashboard className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold">EcomDash</span>
      </div>

      {/* User info */}
      <div className="border-b px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {ROLE_DISPLAY[role] ?? role}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{userName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menú
        </p>
        <ul className="space-y-1">
          {visible.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:bg-secondary hover:text-foreground',
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

      {/* Footer actions */}
      <div className="border-t p-3">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Store className="h-4 w-4" />
          <span>Ver tienda</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
