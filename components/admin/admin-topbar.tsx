'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { AdminMobileNav } from './admin-mobile-nav'
import type { UserRole } from '@/lib/auth-helpers'

export function AdminTopbar({
  role,
  userName,
  title,
}: {
  role: UserRole
  userName: string
  title?: string
}) {
  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-3">
        <AdminMobileNav role={role} />
        <div>
          <h1 className="font-display text-lg font-semibold">
            {title ?? 'Panel de Administración'}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Bienvenido, {userName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </span>
      </div>
    </header>
  )
}
