'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { ProductCard } from '@/components/product-card'

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

export function FlashSaleSection({ products }: { products: Product[] }) {
  const safeProducts = products ?? []
  const [time, setTime] = useState({ h: 8, m: 17, s: 8 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        s -= 1
        if (s < 0) {
          s = 59
          m -= 1
        }
        if (m < 0) {
          m = 59
          h -= 1
        }
        if (h < 0) {
          return { h: 23, m: 59, s: 59 }
        }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (safeProducts.length === 0) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <section className="rounded-lg bg-card p-5 sm:p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-discount/10 text-discount">
            <Zap className="h-5 w-5" />
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Flash Sale
          </h2>
        </div>
        <div className="flex items-center gap-1.5" suppressHydrationWarning>
          <TimeBox value={mounted ? pad(time.h) : '08'} />
          <span className="font-mono font-bold text-discount">:</span>
          <TimeBox value={mounted ? pad(time.m) : '17'} />
          <span className="font-mono font-bold text-discount">:</span>
          <TimeBox value={mounted ? pad(time.s) : '08'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {safeProducts.slice(0, 4).map((p, i) => (
          <ProductCard key={p?.id} product={p} index={i} />
        ))}
      </div>
    </section>
  )
}

function TimeBox({ value }: { value: string }) {
  return (
    <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-discount px-2 font-mono text-sm font-bold text-white">
      {value}
    </span>
  )
}
