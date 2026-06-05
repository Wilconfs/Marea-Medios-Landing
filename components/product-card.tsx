'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  discount?: number | null
  rating?: number
  soldCount?: number
  imageUrl: string
  stock?: number
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCart((s) => s?.addItem)

  const handleAdd = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const currentStock = product?.stock ?? 0

  // 1. Obtenemos el estado actual del carrito de Zustand en tiempo real
  const cartItems = useCart.getState().items
  const existingItem = cartItems.find((item) => item.id === product.id)
  const quantityInCart = existingItem?.quantity ?? 0

  // 2. Si el cliente ya tiene en el carrito una cantidad igual o mayor al stock, lo frenamos
  if (quantityInCart + 1 > currentStock) {
    toast.error('Límite alcanzado', {
      description: `No puedes agregar más unidades. Solo hay ${currentStock} disponibles en inventario.`,
    })
    return
  }

    // 3. Si pasa el filtro, sumamos la unidad normalmente
    addItem?.({
      id: product?.id,
      name: product?.name,
      price: product?.price ?? 0,
      imageUrl: product?.imageUrl ?? '',
      stock: product?.stock,
    })
    
    toast.success('Agregado al carrito', {
      description: product?.name ?? '',
    })
  }

  // Lógica para validar si el stock es mayor a 0 o mostrar disponible por defecto
  const isAvailable = product.stock === undefined || product.stock > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, delay: Math.min((index ?? 0) * 0.04, 0.4) }}
      className="group"
    >
      <Link
        href={`/products/${product?.id ?? ''}`}
        className="block h-full"
      >
        <div
          className="flex h-full flex-col overflow-hidden rounded-lg bg-card transition-all duration-normal hover:-translate-y-1"
          style={{ boxShadow: 'var(--shadow-sm)' }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-muted">
            <Image
              src={product.imageUrl?.split(',')[0] || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              priority={index < 4} // Optimiza la carga de las primeras imágenes
            />
          </div>
          
          <div className="flex flex-1 flex-col gap-2 p-3">
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-slate-800">
              {product?.name ?? ''}
            </h3>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-bold text-blue-600">
                {formatPrice(product?.price ?? 0)}
              </span>
              {product?.originalPrice && product.originalPrice > (product?.price ?? 0) ? (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              ) : null}
            </div>

            {/* 🟢 AJUSTE: Cambiamos las estrellas y vendidos por Disponibilidad del Producto */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              {isAvailable ? (
                <div className="flex items-center gap-1.5 font-medium text-emerald-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>En stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-medium text-rose-500">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Agotado</span>
                </div>
              )}
              <span className="text-muted-foreground text-[11px] font-normal">Envío inmediato</span>
            </div>

            <Button
              size="sm"
              className="mt-1 w-full gap-1.5 bg-slate-900 hover:bg-slate-800 text-white"
              onClick={handleAdd}
              disabled={!isAvailable} // Deshabilita el botón si no hay stock
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {isAvailable ? 'Agregar' : 'Sin Stock'}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}