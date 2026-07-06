'use client'
import { isModuleActive } from "@/lib/modules";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film } from 'lucide-react'
// 1. Importa el icono arriba si no lo tienes:
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ListTodo, 
  MessageSquare, 
  UserCog, 
  Settings, 
  LogOut,
  Newspaper
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth-helpers'

export async function SidebarAdmin({ tenantId }: { tenantId: string }) {
  // Verificamos si el switch de la caja está encendido para este cliente
  const showPOS = await isModuleActive(tenantId, "POS_CAJA");

  return (
    <aside className="w-64 bg-card border-r h-screen p-4 space-y-2">
      {/* Enlaces comunes que siempre se ven */}
      <a href="/admin/dashboard">Resumen</a>
      <a href="/admin/products">Productos</a>
      <a href="/admin/orders">Órdenes</a>
      
      {/* 👇 SI EL MÓDULO ESTÁ ACTIVO, SE MUESTRA EN EL MENÚ */}
      {showPOS && (
        <a href="/admin/caja" className="flex items-center gap-2 text-purple-600 font-semibold">
          <span>🏪</span> Gestión de Caja (POS)
        </a>
      )}

      <a href="/admin/settings">Configuración</a>
    </aside>
  );
}

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/contactos', label: 'Contactos', icon: Users },
  { href: '/admin/oportunidades', label: 'Oportunidades', icon: Briefcase },
  { href: '/admin/tareas', label: 'Tareas', icon: ListTodo },
  { href: '/admin/mensajes', label: 'Mensajes WA', icon: MessageSquare },
  { href: '/admin/equipo', label: 'Equipo', icon: UserCog, roles: ['SUPERADMIN'] },
  { href: '/admin/contenido', label: 'Contenido', icon: Film, roles: ['SUPERADMIN'] },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper, roles: ['SUPERADMIN'] }, // 👈 Agrega esta línea
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
  const isSuper = role === 'SUPERADMIN'

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r lg:flex transition-colors duration-200",
        isSuper 
          ? "border-slate-800 bg-slate-950 text-slate-100" // 💡 Azul marino profundo y calmado para ti
          : "border-zinc-200 bg-white text-zinc-900"
      )}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Logo Container */}
      <div className={cn(
        "flex h-16 items-center gap-2 border-b px-6",
        isSuper ? "border-slate-800/60 bg-slate-900/30" : "border-zinc-100 bg-zinc-50/50"
      )}>
        <span className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm",
          isSuper ? "bg-slate-800 text-blue-400" : "bg-blue-600 text-white"
        )}>
          <LayoutDashboard className="h-5 w-5" />
        </span>
        <span className={cn("font-display text-lg font-bold tracking-tight", isSuper ? "text-slate-100" : "text-zinc-900")}>
          {isSuper ? "CRM Marea" : "CRM Marea"}
        </span>
      </div>

      {/* Perfil del Operador */}
      <div className={cn(
        "border-b px-6 py-4",
        isSuper ? "border-slate-800/60 bg-slate-900/10" : "border-zinc-100 bg-zinc-50/30"
      )}>
        <p className={cn("text-[11px] font-bold uppercase tracking-widest", isSuper ? "text-slate-400" : "text-zinc-500")}>
          {ROLE_DISPLAY[role] ?? role}
        </p>
        <p className={cn("mt-0.5 truncate text-sm font-semibold", isSuper ? "text-slate-200" : "text-zinc-800")}>
          {userName}
        </p>
      </div>

      {/* Enlaces de Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className={cn("mb-2 px-3 text-[11px] font-bold uppercase tracking-widest", isSuper ? "text-slate-500" : "text-zinc-400")}>
          Menú
        </p>
        <ul className="space-y-1">
          {visible.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? isSuper
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30' // 💡 Resalta en azul vibrante pero balanceado
                        : 'bg-blue-50 text-blue-600 font-semibold'
                      : isSuper
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4", 
                    active 
                      ? "text-white" 
                      : isSuper ? "text-slate-500" : "text-zinc-400"
                  )} />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Acciones Inferiores */}
      <div className={cn("border-t p-3", isSuper ? "border-slate-800 bg-slate-900/20" : "border-zinc-100 bg-zinc-50/50")}>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isSuper 
              ? "text-slate-400 hover:bg-rose-950/20 hover:text-rose-400" 
              : "text-zinc-600 hover:bg-red-50 hover:text-red-600"
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}