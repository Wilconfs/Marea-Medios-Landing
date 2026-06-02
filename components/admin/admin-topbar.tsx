'use client'

import { useState, useEffect, useRef } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AdminMobileNav } from './admin-mobile-nav'
import type { UserRole } from '@/lib/auth-helpers'
import { signOut } from 'next-auth/react'
import { LogOut, Store } from 'lucide-react'

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
        
        {/* Contenedor relativo del Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-800 shadow-sm ring-2 ring-white/10 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            {initials}
          </button>

          {/* Menú Flotante Opciones */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-xl ring-1 ring-black/5 focus:outline-none z-40 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{role.toLowerCase()}</p>
              </div>

              {/* Botón Ver Tienda */}
              <a
                href="/"
                rel="noreferrer"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Store className="h-4 w-4 text-slate-400" />
                Ver tienda
              </a>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  signOut({ callbackUrl: '/' }) // Te manda al login directo al limpiar cookies
                }}
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