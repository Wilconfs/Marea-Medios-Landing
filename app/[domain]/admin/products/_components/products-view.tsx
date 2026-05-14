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
  const { data: session } = useSession()
  // Corregido: 'AUXILIAR' para que TypeScript no marque error
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
      // Corregida la ruta de categorías a /api/categories
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ])
      
      const p = await pRes.json()
      const c = await cRes.json()
      
      setProducts(Array.isArray(p) ? p : [])
      setCategories(Array.isArray(c) ? c : [])
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim()
    if (!s) return products
    return products.filter((p) => 
      p.name.toLowerCase().includes(s) || 
      p.category?.name.toLowerCase().includes(s)
    )
  }, [products, search])

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/admin/products/${deletingId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Producto eliminado')
      setProducts((prev) => prev.filter((p) => p.id !== deletingId))
    } catch {
      toast.error('No se pudo eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (p: Product) => {
    if (isReadOnly) return
    setTogglingId(p.id)
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      })
      if (!res.ok) throw new Error()
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, isActive: !p.isActive } : item))
      )
      toast.success('Estado actualizado')
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
          <p className="text-sm text-muted-foreground">
            {isReadOnly ? 'Vista de solo lectura' : 'Gestiona el inventario de tus productos.'}
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs font-medium uppercase">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Estado</th>
              {!isReadOnly && <th className="px-4 py-3 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded border bg-white">
                      <Image
                        src={product.imageUrl?.split(',')[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4">{product.category?.name}</td>
                <td className="px-4 py-4 text-right">{formatPrice(product.price)}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${product.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-muted'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <Switch
                    disabled={isReadOnly || togglingId === product.id}
                    checked={product.isActive}
                    onCheckedChange={() => toggleActive(product)}
                  />
                </td>
                {!isReadOnly && (
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditing({
                          ...product,
                          price: product.price.toString(),
                          originalPrice: product.originalPrice?.toString() || '',
                          discount: product.discount?.toString() || '',
                          stock: product.stock.toString(),
                        });
                        setDialogOpen(true);
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(product.id)} className="text-red-500">
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

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        categories={categories}
        onSaved={load}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}