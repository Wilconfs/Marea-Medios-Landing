'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, ShoppingCart, Plus, Minus, Truck, ShieldCheck, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  discount?: number | null
  rating?: number
  soldCount?: number
  stock?: number
  imageUrl: string
  category?: { name: string; slug: string } | null
}

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const addItem = useCart((s) => s?.addItem)
  const maxStock = Math.max(product?.stock ?? 99, 1)

  // Lógica del Carrusel: Separar imágenes y manejar el índice
  const images = product?.imageUrl?.split(',').filter(url => url.trim() !== '') || ['/placeholder.png']
  const [currentImgIdx, setCurrentImgIdx] = useState(0)

  const nextImage = () => setCurrentImgIdx((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length)

  const handleAdd = () => {
    addItem?.(
      {
        id: product?.id,
        name: product?.name ?? '',
        price: product?.price ?? 0,
        imageUrl: product?.imageUrl ?? '',
        stock: product?.stock,
      },
      qty
    )
    toast.success('Agregado al carrito', { description: product?.name ?? '' })
  }

  const handleBuyNow = () => {
    addItem?.(
      {
        id: product?.id,
        name: product?.name ?? '',
        price: product?.price ?? 0,
        imageUrl: product?.imageUrl ?? '',
        stock: product?.stock,
      },
      qty
    )
    router.push('/cart')
  }

  return (
    <div className="grid gap-8 rounded-lg bg-card p-5 sm:p-7 lg:grid-cols-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Columna Izquierda: Carrusel de Imágenes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        {/* Recuadro de Imagen Principal (Ajustado) */}
        <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted shadow-inner border">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImgIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative h-full w-full"
            >
              <Image
                src={images[currentImgIdx]}
                alt={product.name}
                fill
                // CAMBIO CLAVE AQUÍ: object-cover para ocupar todo el recuadro, sin padding
                className="object-cover" 
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Flechas de Navegación (Solo si hay más de una imagen) */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </button>
            </>
          )}

          {/* Etiqueta de Descuento (Mantenida) */}
          {product?.discount ? (
            <span className="absolute left-3 top-3 rounded-md bg-discount px-3 py-1 text-sm font-bold text-white shadow">
              -{product.discount}% OFF
            </span>
          ) : null}
        </div>

        {/* Galería de Miniaturas (Sección añadida para navegar) */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImgIdx(i)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-pink-50 transition-all ${
                  i === currentImgIdx ? 'border-primary ring-1 ring-primary' : 'border-border hover:opacity-100 opacity-70'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${i}`}
                  fill
                  // Mantenemos object-contain para que la miniatura se vea completa
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Columna Derecha: Detalles (Se mantiene igual tu lógica) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        {product?.category?.name && (
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {product.category.name}
          </span>
        )}

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {product?.name ?? ''}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{(product?.rating ?? 0).toFixed(1)}</span>
          </span>
          <span className="text-muted-foreground">
            {product?.soldCount ?? 0} vendidos
          </span>
          <span
            className={`font-medium ${
              (product?.stock ?? 0) > 0 ? 'text-emerald-600' : 'text-destructive'
            }`}
          >
            {(product?.stock ?? 0) > 0 ? `Stock disponible (${product?.stock})` : 'Agotado'}
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-extrabold text-primary sm:text-4xl">
            {formatPrice(product?.price ?? 0)}
          </span>
          {product?.originalPrice && product.originalPrice > (product?.price ?? 0) ? (
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {product?.description ?? ''}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Cantidad:</span>
          <div className="inline-flex items-center rounded-md border border-input bg-background">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-10 text-center font-mono text-sm">{qty}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
              disabled={qty >= maxStock}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            size="lg"
            variant="outline"
            onClick={handleAdd}
            disabled={(product?.stock ?? 0) === 0}
            className="flex-1 sm:flex-none"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Agregar al carrito
          </Button>
          <Button
            size="lg"
            onClick={handleBuyNow}
            disabled={(product?.stock ?? 0) === 0}
            className="flex-1 sm:flex-none"
          >
            Comprar ahora
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <Feature icon={Truck} label="Envío rápido" />
          <Feature icon={ShieldCheck} label="Compra segura" />
          <Feature icon={Package} label="Devoluciones" />
        </div>
      </motion.div>
    </div>
  )
}

function Feature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-medium text-foreground">{label}</span>
    </span>
  )
}