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
  stock: '',
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

  // Función auxiliar para transformar un número o string numérico a formato con puntos
  const formatWithDots = (value: string | number): string => {
    if (value === null || value === undefined) return ''
    const cleanValue = value.toString().replace(/\D/g, '')
    if (!cleanValue) return ''
    return new Intl.NumberFormat('es-CO').format(parseInt(cleanValue, 10))
  }

  // Función para limpiar los puntos antes de enviar al backend
  const cleanDots = (value: string): string => {
    return value.replace(/\./g, '')
  }

  useEffect(() => {
    if (open) {
      if (initial) {
        /* NUEVA LÓGICA DE CARGA DIRECTA:
          - Si 'originalPrice' existe en la BD, significa que el producto TIENE una oferta activa.
            Por lo tanto: El precio base es 'originalPrice' y el de oferta es 'price'.
          - Si 'originalPrice' NO existe (es nulo o 0), el producto NO tiene oferta.
            Por lo tanto: El precio base real está guardado en 'price' y el input de oferta debe quedar vacío.
        */
        const hasOriginalPrice = initial.originalPrice && Number(initial.originalPrice) > 0

        setData({
          ...initial,
          stock: initial.stock?.toString() || '',
          originalPrice: hasOriginalPrice 
            ? formatWithDots(initial.originalPrice) 
            : (initial.price ? formatWithDots(initial.price) : ''),
          price: hasOriginalPrice 
            ? (initial.price ? formatWithDots(initial.price) : '') 
            : '',
        })
      } else {
        setData(EMPTY)
      }
    }
  }, [open, initial])

  const update = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => 
    setData((d) => ({ ...d, [k]: v }))

  const handlePriceChange = (key: 'originalPrice' | 'price', value: string) => {
    const formatted = formatWithDots(value)
    update(key, formatted)
  }

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

    if (!data.categoryId) {
      toast.error('Por favor, selecciona una categoría')
      return
    }

    if (!data.imageUrl.trim()) {
      toast.error('Debes subir al menos una imagen para el producto')
      return
    }

    setSubmitting(true)
    try {
      const rawOriginalPrice = cleanDots(data.originalPrice)
      const rawSalePrice = cleanDots(data.price)

      const hasSalePrice = rawSalePrice.trim() !== ''
      
      /*
        NUEVA LÓGICA DE ENVÍO SEGURO:
        - Si el usuario llenó ambos campos (Regular y Oferta):
          'price' de la BD será el valor de Oferta (el más barato)
          'originalPrice' de la BD será el valor Regular (el precio de antes)
        - Si solo llenó el precio Regular:
          'price' de la BD toma el valor Regular
          'originalPrice' se va como null
      */
      const payload = {
        ...data,
        name: data.name.trim(),
        description: data.description.trim(),
        price: hasSalePrice ? Number(rawSalePrice) : Number(rawOriginalPrice),
        originalPrice: hasSalePrice ? Number(rawOriginalPrice) : null,
        discount: data.discount ? Number(data.discount) : null,
        stock: data.stock === '' ? 0 : Number(data.stock),
        imageUrl: data.imageUrl.trim()
      }

      const url = isEdit ? `/api/admin/products/${initial!.id}` : '/api/admin/products'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Error del servidor')
      }

      toast.success('Guardado con éxito')
      onSaved()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el producto')
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
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))} 
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stock Disponible</Label>
              <Input type="number" placeholder="0" value={data.stock} onChange={(e) => update('stock', e.target.value)} />
            </div>

            <div>
              <Label>Precio Regular (Base) *</Label>
              <Input 
                type="text" 
                placeholder="Ej: 50.000" 
                value={data.originalPrice} 
                onChange={(e) => handlePriceChange('originalPrice', e.target.value)} 
                required 
              />
            </div>

            <div>
              <Label>Precio Rebajado (Oferta)</Label>
              <Input 
                type="text" 
                placeholder="Ej: 35.000" 
                value={data.price} 
                onChange={(e) => handlePriceChange('price', e.target.value)} 
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Galería de Imágenes *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentImages.map((url, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-md border overflow-hidden">
                    <img src={url} className="h-full w-full object-cover" alt="Preview" />
                    <button type="button" onClick={() => {
                      const filtered = currentImages.filter(u => u !== url)
                      update('imageUrl', filtered.join(','))
                    }} className="absolute right-1 top-1 bg-destructive text-white rounded-full p-0.5">
                      <X size={12}/>
                    </button>
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