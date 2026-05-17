'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { formatPrice } from '@/lib/format'
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

const ITEMS_PER_PAGE = 10 // Paginación local de 10 productos por vista

export function ProductsView() {
  const { data: session } = useSession()
  const isReadOnly = session?.user?.role === 'AUXILIAR'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductFormData | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  
  // Estado que almacena el número de página actual
  const [currentPage, setCurrentPage] = useState(1)

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
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Si escriben en la barra de búsqueda, devolvemos el paginador a la página 1 automáticamente
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  // Filtrado de productos según la barra de búsqueda
  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim()
    if (!s) return products
    return products.filter((p) => 
      p.name.toLowerCase().includes(s) || 
      p.category?.name.toLowerCase().includes(s)
    )
  }, [products, search])

  // Cálculos reactivos de la paginación
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  
  const paginatedProducts = useMemo(() => {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(offset, offset + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/admin/products/${deletingId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Producto eliminado')
      setProducts((prev) => prev.filter((p) => p.id !== deletingId))
      
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
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
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Estado</th>
              {!isReadOnly && <th className="px-4 py-3 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white">
                      <Image
                        src={product.imageUrl?.split(',')[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {product.category?.name || 'Sin categoría'}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-800 dark:text-white">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${
                    product.stock <= 5 
                      ? 'bg-red-500/10 text-red-600' 
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Switch
                    disabled={isReadOnly || togglingId === product.id}
                    checked={product.isActive}
                    onCheckedChange={() => toggleActive(product)}
                  />
                </td>
                {!isReadOnly && (
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => {
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
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(product.id)} className="text-red-500 rounded-xl hover:bg-red-500/10 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                  No se encontraron productos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER DEL PAGINADOR INTERACTIVO */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Página <span className="font-semibold text-slate-800 dark:text-white">{currentPage}</span> de {totalPages}
          </p>

          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        categories={categories}
        onSaved={load}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">No</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white rounded-xl hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}