'use client'
import { isModuleActive } from "@/lib/modules";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// 1. Importa el icono arriba si no lo tienes:
import { Wallet } from 'lucide-react'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  MessageSquare,
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

const items: Item[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: Tags },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/users', label: 'Usuarios', icon: Users, roles: ['SUPERADMIN', 'ADMIN'] },
  { href: '/admin/messages', label: 'Mensajes WA', icon: MessageSquare },
  { href: '/admin/caja', label: 'Gestión de caja', icon: Wallet, roles: ['SUPERADMIN'] },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, roles: ['SUPERADMIN'] }
  
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
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-600/20 bg-slate-700 text-slate-100 lg:flex"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Logo Container con fondo sutilmente oscurecido */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-600/30 px-6 bg-slate-800/30">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
          <LayoutDashboard className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-white">Tienda Marea</span>
      </div>

      {/* Perfil del Operador */}
      <div className="border-b border-slate-600/30 px-6 py-4 bg-slate-800/15">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300/80">
          {ROLE_DISPLAY[role] ?? role}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-white">{userName}</p>
      </div>

      {/* Enlaces de Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400/60">
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
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-white text-slate-800 font-semibold shadow-md shadow-slate-900/10'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-slate-800" : "text-slate-300/80")} />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Acciones Inferiores */}
      <div className="border-t border-slate-600/30 p-3 bg-slate-800/30">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Store className="h-4 w-4 text-slate-300/80" />
          <span>Ver tienda</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}