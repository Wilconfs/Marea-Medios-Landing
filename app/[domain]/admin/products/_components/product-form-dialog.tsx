'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
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
  stock: '', // Vacío para evitar el "0126"
  imageUrl: '',
  categoryId: '',
  isActive: true,
  isFlashSale: false,
}

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
  categories: { id: string; name: string }[]
  onSaved: () => void
}) {
  const [data, setData] = useState<ProductFormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (initial) {
        setData({
          ...initial,
          stock: initial.stock?.toString() || '',
          price: initial.price?.toString() || '',
          originalPrice: initial.originalPrice?.toString() || '',
        })
      } else {
        setData(EMPTY)
      }
    }
  }, [open, initial])

  const update = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => 
    setData((d) => ({ ...d, [k]: v }))

  const isEdit = !!initial?.id

  async function handleImagesUpload(files: FileList) {
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!response.ok) throw new Error()
      const result = await response.json()
      
      const newUrls = result.urls.join(',')
      const updatedUrls = data.imageUrl ? `${data.imageUrl.trim()},${newUrls}` : newUrls
      
      update('imageUrl', updatedUrls)
      toast.success('Imágenes añadidas')
    } catch {
      toast.error('Error al subir')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        discount: data.discount ? Number(data.discount) : null,
        stock: data.stock === '' ? 0 : Number(data.stock),
        imageUrl: data.imageUrl.trim() // Importante para la BD
      }

      const url = isEdit ? `/api/admin/products/${initial!.id}` : '/api/admin/products'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()

      toast.success('Guardado')
      onSaved()
      onOpenChange(false)
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const currentImages = data.imageUrl ? data.imageUrl.split(',').filter(url => url.trim() !== '') : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
          <DialogDescription>Administra la información de venta y stock.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nombre del Producto *</Label>
              <Input value={data.name} onChange={(e) => update('name', e.target.value)} required />
            </div>

            <div className="sm:col-span-2">
              <Label>Descripción *</Label>
              <Textarea value={data.description} onChange={(e) => update('description', e.target.value)} required />
            </div>

            <div>
              <Label>Categoría *</Label>
              <Select value={data.categoryId} onValueChange={(v) => update('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stock Disponible</Label>
              <Input type="number" placeholder="0" value={data.stock} onChange={(e) => update('stock', e.target.value)} />
            </div>

            <div>
              <Label>Precio Original (Antes)</Label>
              <Input type="number" placeholder="Ej: 50000" value={data.originalPrice} onChange={(e) => update('originalPrice', e.target.value)} />
            </div>

            <div>
              <Label>Precio Rebajado (Venta) *</Label>
              <Input type="number" placeholder="Ej: 35000" value={data.price} onChange={(e) => update('price', e.target.value)} required />
            </div>

            <div className="sm:col-span-2">
              <Label>Galería de Imágenes</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentImages.map((url, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-md border overflow-hidden">
                    <img src={url} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => {
                      const filtered = currentImages.filter(u => u !== url)
                      update('imageUrl', filtered.join(','))
                    }} className="absolute right-1 top-1 bg-destructive text-white rounded-full p-0.5"><X size={12}/></button>
                  </div>
                ))}
                <div onClick={() => fileInputRef.current?.click()} className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed hover:bg-muted">
                  {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                </div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleImagesUpload(e.target.files)} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Activo</Label>
                <p className="text-sm text-muted-foreground">Visible en la tienda</p>
              </div>
              <Switch checked={data.isActive} onCheckedChange={(v) => update('isActive', v)} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Flash Sale</Label>
                <p className="text-sm text-muted-foreground">Destacar en oferta flash</p>
              </div>
              <Switch checked={data.isFlashSale} onCheckedChange={(v) => update('isFlashSale', v)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting || uploading}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}