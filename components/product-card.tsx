'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
              />
            </div>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
              {product?.name ?? ''}
            </h3>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-bold text-primary">
                {formatPrice(product?.price ?? 0)}
              </span>
              {product?.originalPrice && product.originalPrice > (product?.price ?? 0) ? (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">
                  {(product?.rating ?? 0).toFixed(1)}
                </span>
              </span>
              <span>{product?.soldCount ?? 0} vendidos</span>
            </div>

            <Button
              size="sm"
              className="mt-1 w-full gap-1.5"
              onClick={handleAdd}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Agregar
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
