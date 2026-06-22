'use client'

import { useState, useEffect, useRef } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AdminMobileNav } from './admin-mobile-nav'
import type { UserRole } from '@/lib/auth-helpers'
import { signOut } from 'next-auth/react'
import { LogOut, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminTopbar({
  role,
  userName,
  title,
}: {
  role: UserRole
  userName: string
  title?: string
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isSuper = role === 'SUPERADMIN' // 💡 Evaluamos el rol aquí también

  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Efecto para cerrar el menú flotante si el usuario hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
   <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-6 border-b transition-colors duration-200",
        isSuper 
          ? "bg-slate-950 border-slate-800 text-slate-100" // 💡 Mismo fondo azul oscuro calmo
          : "bg-white border-zinc-200 text-zinc-900"
      )}
      style={{ boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.01)' }}
    >
      <div className="flex items-center gap-3">
        <AdminMobileNav role={role} />
        <div>
          <h1 className={cn("font-display text-base font-bold sm:text-lg", isSuper ? "text-slate-100" : "text-zinc-900")}>
            {title ?? 'Panel de Administración'}
          </h1>
          <p className={cn("hidden text-xs sm:block", isSuper ? "text-slate-400" : "text-zinc-500")}>
            {isSuper ? "Gestión general" : "Gestión General"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={cn(isSuper ? "text-slate-400 hover:text-slate-100" : "text-zinc-500 hover:text-zinc-900")}>
          <ThemeToggle />
        </div>
        <div className={cn("h-6 w-px", isSuper ? "bg-slate-800" : "bg-zinc-200")} />
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shadow-sm transition-colors focus:outline-none",
              isSuper 
                ? "bg-slate-900 text-slate-200 hover:bg-slate-800 ring-2 ring-slate-800" 
                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 ring-2 ring-zinc-200/5"
            )}
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className={cn(
              "absolute right-0 mt-2 w-48 origin-top-right rounded-xl border p-1 shadow-xl z-40",
              isSuper ? "bg-slate-900 border-slate-800" : "bg-white border-zinc-200"
            )}>
              <div className={cn("px-3 py-2 border-b", isSuper ? "border-slate-800" : "border-zinc-100")}>
                <p className={cn("text-xs font-semibold truncate", isSuper ? "text-slate-200" : "text-zinc-900")}>{userName}</p>
                <p className={cn("text-[10px] capitalize", isSuper ? "text-slate-500" : "text-zinc-400")}>{role.toLowerCase()}</p>
              </div>

              <button
                onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }) }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}