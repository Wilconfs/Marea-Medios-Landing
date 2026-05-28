'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Truck, ShieldCheck, Package, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const maxStock = product?.stock !== undefined ? product.stock : 99

  // Lógica del Carrusel: Separar imágenes y manejar el índice
  const images = product?.imageUrl?.split(',').filter(url => url.trim() !== '') || ['/placeholder.png']
  const [currentImgIdx, setCurrentImgIdx] = useState(0)

  const nextImage = () => setCurrentImgIdx((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length)

  // 🟢 REEMPLAZA ESTAS DOS FUNCIONES EN PRODUCT-DETAIL.TSX:
  const handleAdd = () => {
    const currentStock = product?.stock ?? 0;
    
    // 1. Obtenemos lo que ya está guardado en el carrito para este producto
    const cartItems = useCart.getState().items;
    const existingItem = cartItems.find((item) => item.id === product.id);
    const quantityInCart = existingItem?.quantity ?? 0;

    // 2. Calculamos cuánto quiere meter en total (lo de antes + lo de ahora)
    if (quantityInCart + qty > currentStock) {
      const maxAllowedToAdd = currentStock - quantityInCart;
      
      if (maxAllowedToAdd <= 0) {
        toast.error('Límite alcanzado', {
          description: `Ya tienes las ${currentStock} unidades máximas disponibles en tu carrito.`,
        });
      } else {
        toast.error('Stock insuficiente', {
          description: `Solo puedes agregar ${maxAllowedToAdd} unidad(es) más para no superar el stock.`,
        });
      }
      return;
    }

    // 3. Si pasa la prueba, se agrega normalmente
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
    const currentStock = product?.stock ?? 0;
    const cartItems = useCart.getState().items;
    const existingItem = cartItems.find((item) => item.id === product.id);
    const quantityInCart = existingItem?.quantity ?? 0;

    // Misma validación estricta para la compra directa
    if (quantityInCart + qty > currentStock) {
      toast.error('Límite de stock superado', {
        description: `No puedes comprar más de las ${currentStock} unidades disponibles en inventario.`,
      });
      return;
    }

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

  const hasStock = (product?.stock ?? 0) > 0

  return (
    <div className="grid gap-8 rounded-lg bg-card p-5 sm:p-7 lg:grid-cols-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Columna Izquierda: Carrusel de Imágenes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        {/* Recuadro de Imagen Principal */}
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
                className="object-cover" 
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Flechas de Navegación */}
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

          {/* Etiqueta de Descuento */}
          {product?.discount ? (
            <span className="absolute left-3 top-3 rounded-md bg-discount px-3 py-1 text-sm font-bold text-white shadow">
              -{product.discount}% OFF
            </span>
          ) : null}
        </div>

        {/* Galería de Miniaturas */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImgIdx(i)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-muted/50 transition-all ${
                  i === currentImgIdx ? 'border-primary ring-1 ring-primary' : 'border-border hover:opacity-100 opacity-70'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${i}`}
                  fill
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Columna Derecha: Detalles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        {product?.category?.name && (
          <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {product.category.name}
          </span>
        )}

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl text-slate-900">
          {product?.name ?? ''}
        </h1>

        {/* ✨ CAMBIO: Se eliminaron estrellas y vendidos. Se optimizó el badge de Stock */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 font-semibold">
            {hasStock ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Stock Disponible ({product?.stock} unidades)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Agotado temporalmente</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-extrabold text-blue-600 sm:text-4xl">
            {formatPrice(product?.price ?? 0)}
          </span>
          {product?.originalPrice && product.originalPrice > (product?.price ?? 0) ? (
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-slate-500">
          {product?.description ?? ''}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Cantidad:</span>
          <div className="inline-flex items-center rounded-md border border-input bg-background">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || !hasStock}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            
            {/* Controlamos que visualmente no muestre más del stock real */}
            <span className="min-w-10 text-center font-mono text-sm">
              {hasStock ? Math.min(qty, maxStock) : 0}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              // Lógica estricta: No permite subir si ya alcanzó el maxStock real
              onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
              disabled={qty >= maxStock || !hasStock}
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
            disabled={!hasStock}
            className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Agregar al carrito
          </Button>
          <Button
            size="lg"
            onClick={handleBuyNow}
            disabled={!hasStock}
            className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white"
          >
            Comprar ahora
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <Feature icon={Truck} label="Envío inmediato" />
          <Feature icon={ShieldCheck} label="Compra segura" />
          <Feature icon={Package} label="Garantía de fábrica" />
        </div>
      </motion.div>
    </div>
  )
}

function Feature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
      <Icon className="h-4 w-4 text-indigo-600" />
      <span className="font-medium text-slate-700">{label}</span>
    </span>
  )
}