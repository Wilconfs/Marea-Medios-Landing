'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search, Shield, ShieldCheck, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Role = 'SUPERADMIN' | 'ADMIN' | 'CLIENTE'

type User = {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  _count: { orders: number }
}

const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  CLIENTE: 'Cliente',
}

const ROLE_COLOR: Record<Role, string> = {
  SUPERADMIN: 'bg-primary/10 text-primary',
  ADMIN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  CLIENTE: 'bg-secondary text-foreground',
}

export function UsersView() {
  const { data: session } = useSession() || {}
  const currentUserId = session?.user?.id
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      toast.error('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const s = search.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
    )
  }, [users, search])

  async function changeRole(user: User, role: Role) {
    if (user.role === role) return
    setUpdatingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === 'cannot_modify_self') {
          toast.error('No puedes cambiar tu propio rol')
        } else {
          toast.error('No se pudo actualizar')
        }
        return
      }
      toast.success('Rol actualizado')
      setUsers((arr) => arr.map((x) => (x.id === user.id ? { ...x, role } : x)))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Administra los roles y permisos de los usuarios
        </p>
      </div>

      <div
        className="rounded-lg bg-card"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-2 border-b p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No hay usuarios.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-right">Pedidos</th>
                  <th className="px-4 py-3 text-left">Registro</th>
                  <th className="px-4 py-3 text-left">Rol actual</th>
                  <th className="px-4 py-3 text-right">Cambiar rol</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.id === currentUserId
                  const Icon =
                    u.role === 'SUPERADMIN' ? ShieldCheck : u.role === 'ADMIN' ? Shield : UserIcon
                  const initials = u.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {initials}
                          </span>
                          <div>
                            <p className="font-medium">
                              {u.name}
                              {isSelf && (
                                <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-right font-mono">{u._count.orders}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                            ROLE_COLOR[u.role],
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Select
                          value={u.role}
                          onValueChange={(v) => changeRole(u, v as Role)}
                          disabled={isSelf || updatingId === u.id}
                        >
                          <SelectTrigger className="ml-auto w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CLIENTE">Cliente</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                            <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
