'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Menu,
  X,
  Users, 
  Briefcase, 
  ListTodo, 
  MessageSquare, 
  UserCog, 
  Settings, 
  LogOut, 
  Store,
  Newspaper
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth-helpers'
import { Film } from 'lucide-react'

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/contactos', label: 'Contactos', icon: Users },
  { href: '/admin/oportunidades', label: 'Oportunidades', icon: Briefcase },
  { href: '/admin/tareas', label: 'Tareas', icon: ListTodo },
  { href: '/admin/mensajes', label: 'Mensajes WA', icon: MessageSquare },
  { href: '/admin/equipo', label: 'Equipo', icon: UserCog, roles: ['SUPERADMIN'] },
  { href: '/admin/contenido', label: 'Contenido', icon: Film, roles: ['SUPERADMIN'] },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper, roles: ['SUPERADMIN'] },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, roles: ['SUPERADMIN'] },
]

export function AdminMobileNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const visible = items.filter((it) => !it.roles || it.roles.includes(role))

  // 💡 EVALUAR EL ROL AQUÍ TAMBIÉN PARA HACER JUEGO CON EL DESKTOP
  const isSuper = role === 'SUPERADMIN'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border lg:hidden transition-colors duration-200",
          isSuper 
            ? "border-slate-800 bg-slate-900 text-slate-400 hover:text-white" 
            : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        )}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          
          <aside className={cn(
            "absolute left-0 top-0 flex h-full w-72 flex-col border-r transition-colors duration-200",
            isSuper ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-zinc-200 text-zinc-900"
          )}>
            
            <div className={cn(
              "flex h-16 items-center justify-between border-b px-5",
              isSuper ? "border-slate-800 bg-slate-900/20" : "border-zinc-100 bg-zinc-50/50"
            )}>
              <span className={cn("font-display text-base font-bold tracking-tight", isSuper ? "text-slate-100" : "text-zinc-900")}>
                {isSuper ? "CRM Marea" : "CRM Marea"}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isSuper ? "text-slate-500 hover:bg-slate-900 hover:text-slate-200" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                )}
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {visible.map(({ href, label, icon: Icon }) => {
                  const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          active
                            ? isSuper
                              ? 'bg-blue-600 text-white font-semibold' 
                              : 'bg-blue-50 text-blue-600 font-semibold'
                            : isSuper
                              ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4",
                          active ? "text-white" : isSuper ? "text-slate-500" : "text-zinc-400"
                        )} />
                        <span>{label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className={cn("border-t p-3 space-y-1", isSuper ? "border-slate-800 bg-slate-900/20" : "border-zinc-100 bg-zinc-50/50")}>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isSuper ? "text-slate-400 hover:bg-slate-900" : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <Store className="h-4 w-4" />
                <span>Ver tienda</span>
              </Link>
              
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isSuper ? "text-slate-400 hover:bg-rose-950/20 hover:text-rose-400" : "text-zinc-600 hover:bg-red-50 hover:text-red-600"
                )}
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