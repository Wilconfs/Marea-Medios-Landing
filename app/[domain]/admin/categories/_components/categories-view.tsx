'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatNumber } from '@/lib/format'

type Category = {
  id: string
  name: string
  slug: string
  icon: string
  _count?: { products: number }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CategoriesView() {
  const { data: session } = useSession() || {}
  const isReadOnly = session?.user?.role === 'AUXILIAR'
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<Category | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      toast.error('No se pudieron cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setName('')
    setSlug('')
    setOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setName(c.name)
    setSlug(c.slug)
    setOpen(true)
  }

  async function save() {
    if (!name.trim() || !slug.trim()) {
      toast.error('Completa nombre y slug')
      return
    }
    setSubmitting(true)
    try {
      const url = editing
        ? `/api/categories/${editing.id}`
        : '/api/categories'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        // Mantenemos tu name, tu slug original y fijamos el icon como 'package'
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), icon: 'package' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === 'slug_taken') {
          toast.error('Ese slug ya está en uso')
        } else {
          toast.error('No se pudo guardar')
        }
        return
      }
      toast.success(editing ? 'Categoría actualizada' : 'Categoría creada')
      setOpen(false)
      load()
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    const id = deleting.id
    setDeleting(null)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === 'has_products') {
          toast.error(`No se puede eliminar: tiene ${err.count} productos`)
        } else {
          toast.error('No se pudo eliminar')
        }
        return
      }
      toast.success('Categoría eliminada')
      load()
    } catch {
      toast.error('Error de red')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Organiza tu catálogo en categorías
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-lg bg-card p-12" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg bg-card p-12 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aún no hay categorías.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-lg bg-card p-5"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {/* Renderiza el ícono de paquete por defecto en las tarjetas */}
                  <Package className="h-5 w-5" />
                </div>
                {!isReadOnly && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <h3 className="font-display text-lg font-semibold">{c.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">/{c.slug}</p>
              <div className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                {formatNumber(c._count?.products ?? 0)} producto
                {(c._count?.products ?? 0) !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </DialogTitle>
            <DialogDescription>
              Las categorías agrupan productos en la tienda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Nombre *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!editing) setSlug(slugify(e.target.value))
                }}
              />
            </div>
            <div>
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="camisetas"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Sólo letras minúsculas, números y guiones
              </p>
            </div>
            {/* El campo de selección de ícono ha sido completamente eliminado de aquí */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              No podrás eliminarla si tiene productos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}