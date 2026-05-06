'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import { formatPrice, formatNumber } from '@/lib/format'
import { ProductFormDialog, type ProductFormData } from './product-form-dialog'

type Category = { id: string; name: string; slug: string }

type Product = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  discount: number | null
  stock: number
  soldCount: number
  rating: number
  imageUrl: string
  isActive: boolean
  isFlashSale: boolean
  categoryId: string
  category: Category
  createdAt: string
}

export function ProductsView() {
  const { data: session } = useSession() || {}
  const isReadOnly = session?.user?.role === 'AUXILIAR'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductFormData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ])
      const p = await pRes.json()
      const c = await cRes.json()
      setProducts(Array.isArray(p) ? p : [])
      setCategories(Array.isArray(c) ? c : [])
    } catch {
      toast.error('No se pudieron cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const s = search.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(s) || p.category.name.toLowerCase().includes(s),
    )
  }, [products, search])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditing({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
      discount: p.discount != null ? String(p.discount) : '',
      stock: String(p.stock),
      imageUrl: p.imageUrl,
      categoryId: p.categoryId,
      isActive: p.isActive,
      isFlashSale: p.isFlashSale,
    })
    setDialogOpen(true)
  }

  async function toggleActive(p: Product) {
    setTogglingId(p.id)
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      })
      if (!res.ok) throw new Error()
      toast.success(p.isActive ? 'Producto desactivado' : 'Producto activado')
      setProducts((arr) =>
        arr.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)),
      )
    } catch {
      toast.error('No se pudo actualizar')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    const id = deletingId
    setDeletingId(null)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Producto eliminado')
      setProducts((arr) => arr.filter((x) => x.id !== id))
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {isReadOnly ? 'Vista del catálogo (solo lectura)' : 'Gestiona el catálogo de tu tienda'}
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        )}
      </div>

      <div
        className="rounded-lg bg-card"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-2 border-b p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No hay productos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Vendidos</th>
                  {!isReadOnly && <th className="px-4 py-3 text-center">Activo</th>}
                  {!isReadOnly && <th className="px-4 py-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.imageUrl && (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          {p.isFlashSale && (
                            <span className="text-[10px] font-semibold uppercase text-discount">
                              Flash sale
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(p.stock)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatNumber(p.soldCount)}</td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={p.isActive}
                          disabled={togglingId === p.id}
                          onCheckedChange={() => toggleActive(p)}
                        />
                      </td>
                    )}
                    {!isReadOnly && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingId(p.id)}
                            aria-label="Eliminar"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isReadOnly && (
        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          categories={categories}
          onSaved={load}
        />
      )}

      {!isReadOnly && (
        <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
