'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ProductFormData = {
  id?: string
  name: string
  description: string
  price: string
  originalPrice: string
  discount: string
  stock: string
  imageUrl: string
  categoryId: string
  isActive: boolean
  isFlashSale: boolean
}

const EMPTY: ProductFormData = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  discount: '',
  stock: '0',
  imageUrl: '',
  categoryId: '',
  isActive: true,
  isFlashSale: false,
}

type Category = { id: string; name: string }

export function ProductFormDialog({
  open,
  onOpenChange,
  initial,
  categories,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: ProductFormData | null
  categories: Category[]
  onSaved: () => void
}) {
  const [data, setData] = useState<ProductFormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) setData(initial ?? EMPTY)
  }, [open, initial])

  const update = <K extends keyof ProductFormData>(
    k: K,
    v: ProductFormData[K],
  ) => setData((d) => ({ ...d, [k]: v }))

  const isEdit = !!initial?.id

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!data.name.trim() || !data.description.trim() || !data.imageUrl.trim() || !data.categoryId) {
      toast.error('Completa los campos obligatorios')
      return
    }
    const priceNum = Number(data.price)
    if (!priceNum || priceNum <= 0) {
      toast.error('Precio inválido')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: priceNum,
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        discount: data.discount ? Number(data.discount) : null,
        stock: Number(data.stock) || 0,
        imageUrl: data.imageUrl.trim(),
        categoryId: data.categoryId,
        isActive: data.isActive,
        isFlashSale: data.isFlashSale,
      }

      const url = isEdit ? `/api/admin/products/${initial!.id}` : '/api/admin/products'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error === 'invalid_input' ? 'Datos inválidos' : 'No se pudo guardar')
        return
      }

      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      onSaved()
      onOpenChange(false)
    } catch {
      toast.error('Error de red')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            Completa los datos del producto. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={data.categoryId}
                onValueChange={(v) => update('categoryId', v)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={data.stock}
                onChange={(e) => update('stock', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="any"
                value={data.price}
                onChange={(e) => update('price', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="originalPrice">Precio original</Label>
              <Input
                id="originalPrice"
                type="number"
                min={0}
                step="any"
                value={data.originalPrice}
                onChange={(e) => update('originalPrice', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="discount">Descuento (%)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={data.discount}
                onChange={(e) => update('discount', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="imageUrl">URL de imagen *</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://..."
                value={data.imageUrl}
                onChange={(e) => update('imageUrl', e.target.value)}
                required
              />
              {data.imageUrl && (
                <div className="mt-2 h-24 w-24 overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.imageUrl} alt="preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="isActive" className="font-medium">Activo</Label>
                <p className="text-xs text-muted-foreground">Visible en la tienda</p>
              </div>
              <Switch
                id="isActive"
                checked={data.isActive}
                onCheckedChange={(v) => update('isActive', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="isFlashSale" className="font-medium">Oferta Flash</Label>
                <p className="text-xs text-muted-foreground">Destacar en flash sale</p>
              </div>
              <Switch
                id="isFlashSale"
                checked={data.isFlashSale}
                onCheckedChange={(v) => update('isFlashSale', v)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
