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
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 sm:px-6"
      style={{ boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)' }}
    >
      <div className="flex items-center gap-3">
        <AdminMobileNav role={role} />
        <div>
          <h1 className="font-display text-base font-bold text-white sm:text-lg">
            {title ?? 'Panel de Administración'}
          </h1>
          <p className="hidden text-xs text-slate-300 sm:block">
            Gestión general • {userName}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-slate-300 hover:text-white transition-colors">
          <ThemeToggle />
        </div>
        <div className="h-6 w-px bg-slate-700" /> {/* Separador fino en gama gris */}
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-800 shadow-sm ring-2 ring-white/10">
          {initials}
        </span>
      </div>
    </header>
  )
}