'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search, Shield, ShieldCheck, User as UserIcon, Plus, HardHat, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Role = 'SUPERADMIN' | 'ADMIN' | 'AUXILIAR' | 'CLIENTE'

type User = {
  id: string
  name: string
  email: string
  phone?: string | null // ◄ AGREGAR ESTO
  role: Role
  createdAt: string
  _count: { orders: number }
}

const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  AUXILIAR: 'Auxiliar',
  CLIENTE: 'Cliente',
}

const ROLE_COLOR: Record<Role, string> = {
  SUPERADMIN: 'bg-primary/10 text-primary',
  ADMIN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  AUXILIAR: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  CLIENTE: 'bg-secondary text-foreground',
}

export function UsersView() {
  const { data: session } = useSession() || {}
  const currentUserId = session?.user?.id
  const currentUserRole = session?.user?.role as Role | undefined
  const isSuperAdmin = currentUserRole === 'SUPERADMIN'
  
  // Seguridad: Solo SUPERADMIN y ADMIN pueden gestionar y realizar ediciones
  const canManage = currentUserRole === 'SUPERADMIN' || currentUserRole === 'ADMIN'

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Estados para creación
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'CLIENTE' as Role })

  // Estados para edición
  const [editOpen, setEditOpen] = useState(false)
  const [updatingUser, setUpdatingUser] = useState(false)
  const [editData, setEditData] = useState({ id: '', name: '', email: '', phone: '', password: '', role: 'CLIENTE' as Role })

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
        } else if (err.error === 'forbidden') {
          toast.error(err.message || 'No tienes permiso para esta acción')
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

  function getAvailableRoles(): Role[] {
    if (isSuperAdmin) return ['SUPERADMIN', 'ADMIN', 'AUXILIAR', 'CLIENTE']
    return ['ADMIN', 'AUXILIAR', 'CLIENTE']
  }

  function getAssignableRoles(targetUser: User): Role[] {
    const roles = getAvailableRoles()
    if (targetUser.role === 'SUPERADMIN' && !isSuperAdmin) return ['SUPERADMIN']
    return roles
  }

  // Manejador para abrir el modal de edición cargando los datos del usuario seleccionado
  function handleOpenEdit(user: User) {
    setEditData({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '', // ◄ AGREGAR ESTA LÍNEA
      password: '',            // ◄ AGREGAR ESTA LÍNEA
      role: user.role,
    })
    setEditOpen(true)
  }

  // Envío del formulario de edición de datos completos
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editData.name.trim() || !editData.email.trim()) {
      toast.error('Nombre y email son obligatorios')
      return
    }
    setUpdatingUser(true)
    try {
      // Apuntamos a la API general /api/admin/users que sí funciona sin problemas de carpetas
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          id: editData.id, 
          name: editData.name.trim(), 
          email: editData.email.trim().toLowerCase(), 
          role: editData.role,
          phone: editData.phone.trim(),
          password: editData.password ? editData.password.trim() : undefined // ◄ ¡AGREGAR ESTA LÍNEA!
        }),
      })

      const responseData = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(responseData.message || responseData.error || 'No se pudo actualizar el usuario')
        return
      }

      toast.success('Usuario actualizado con éxito')
      setEditOpen(false)
      load()
    } catch (error) {
      console.error(error)
      toast.error('Error de red al intentar actualizar')
    } finally {
      setUpdatingUser(false)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast.error('Todos los campos son obligatorios')
      return
    }
    if (newUser.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === 'email_taken') {
          toast.error('Ya existe un usuario con ese email')
        } else if (err.error === 'forbidden') {
          toast.error(err.message || 'No tienes permiso')
        } else {
          toast.error('No se pudo crear el usuario')
        }
        return
      }
      toast.success('Usuario creado exitosamente')
      setCreateOpen(false)
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'CLIENTE' })
      load()
    } catch {
      toast.error('Error de red')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los roles y permisos de los usuarios
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!canManage}>
          <Plus className="mr-2 h-4 w-4" />
          Crear usuario
        </Button>
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
                  {/*<th className="px-4 py-3 text-right">Cambiar rol</th>*/}
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.id === currentUserId
                  const Icon =
                    u.role === 'SUPERADMIN' ? ShieldCheck : u.role === 'ADMIN' ? Shield : u.role === 'AUXILIAR' ? HardHat : UserIcon
                  const initials = u.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  const assignable = getAssignableRoles(u)
                  const canChange = canManage && !isSelf && assignable.length > 1
                  
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
                        {/*
                      <td className="px-4 py-3 text-right">
                        <Select
                          value={u.role}
                          onValueChange={(v) => changeRole(u, v as Role)}
                          disabled={!canChange || updatingId === u.id}
                        >
                          <SelectTrigger className="ml-auto w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {assignable.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      */}
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(u)}
                          disabled={!canManage || (u.role === 'SUPERADMIN' && !isSuperAdmin)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create user dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear usuario interno</DialogTitle>
            <DialogDescription>
              Crea una cuenta para un colaborador. Podrá acceder al panel según el rol asignado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="new-name">Nombre *</Label>
              <Input
                id="new-name"
                placeholder="Nombre completo"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="new-email">Email *</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="new-password">Contraseña *</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="new-role">Rol *</Label>
              <Select
                value={newUser.role}
                onValueChange={(v) => setNewUser({ ...newUser, role: v as Role })}
              >
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos principales o actualiza los permisos de este colaborador.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nombre *</Label>
            <Input
              id="edit-name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              required
            />
          </div>

          {/* 👇 NUEVO INPUT: TELÉFONO EN EDICIÓN */}
          <div>
            <Label htmlFor="edit-phone">Teléfono Celular *</Label>
            <Input
              id="edit-phone"
              type="text"
              placeholder="Ej: 3101234567"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-role">Rol *</Label>
            <Select
              value={editData.role}
              onValueChange={(v) => setEditData({ ...editData, role: v as Role })}
              disabled={editData.id === currentUserId}
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles().map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 👇 NUEVO INPUT: CONTRASEÑA CON BLOQUEO PARA CLIENTES */}
          <div>
            <Label htmlFor="edit-password">
              Nueva Contraseña {editData.role === 'CLIENTE' ? '(No editable)' : '(Opcional)'}
            </Label>
            <Input
              id="edit-password"
              type="password"
              placeholder={
                editData.role === 'CLIENTE'
                  ? 'Las claves de clientes no se editan aquí'
                  : 'Dejar en blanco para mantener la actual'
              }
              value={editData.password}
              onChange={(e) => setEditData({ ...editData, password: e.target.value })}
              disabled={editData.role === 'CLIENTE'} 
            />
            {editData.role !== 'CLIENTE' && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Mínimo 6 caracteres. Si escribes una clave, se actualizará en la base de datos.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={updatingUser}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updatingUser}>
              {updatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}